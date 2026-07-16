import { jwtDecode } from 'jwt-decode';

import { APIServiceNoAuth } from '@/config/api/apiServices';
import {
  clearAuthStorage,
  getStoredTokens,
  getStoredUser,
  setStoredTokens,
  setStoredUser,
} from '@/config/storage';
import {
  confirmResetPasswordLoading,
  confirmResetPasswordSuccess,
  hydrateAuth,
  loginUserLoading,
  loginUserSuccess,
  logoutUser,
  resetPasswordLoading,
  resetPasswordSuccess,
} from '@/redux/actions/auth/auth.creator';
import type { AppDispatch } from '@/redux/store';

export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthActionResult = {
  fulfilled: boolean;
  message: string;
};

type DecodedUser = Record<string, unknown> & {
  branch_id?: number;
  username?: string;
  email?: string;
  is_solar_customer?: boolean;
  role_text?: string;
};

/**
 * Login — client solar dashboard auth (wyre-dashboard)
 * POST /api/v1/auth/
 */
export const loginAUser =
  (parameters: LoginCredentials) => async (dispatch: AppDispatch): Promise<AuthActionResult> => {
    dispatch(loginUserLoading(true));
    const requestUrl = 'auth/';

    try {
      const response = await APIServiceNoAuth.post(requestUrl, parameters);
      const token = response.data?.data?.token ?? response.data?.token;

      if (!token?.access) {
        dispatch(loginUserLoading(false));
        return { fulfilled: false, message: 'Invalid login response from server.' };
      }

      const decodedToken = jwtDecode<DecodedUser>(token.access);

      await setStoredTokens(token);
      await setStoredUser(decodedToken);

      dispatch(loginUserSuccess(decodedToken));
      dispatch(loginUserLoading(false));
      return { fulfilled: true, message: 'successful' };
    } catch (error: unknown) {
      dispatch(loginUserLoading(false));
      const message = extractErrorMessage(error, 'An error occurred during login');
      return { fulfilled: false, message };
    }
  };

export const logUserOut = () => async (dispatch: AppDispatch) => {
  await clearAuthStorage();
  dispatch(logoutUser());
  dispatch(loginUserSuccess(null));
};

/**
 * Restore session from AsyncStorage on app launch.
 */
export const bootstrapAuth = () => async (dispatch: AppDispatch) => {
  try {
    const [tokens, user] = await Promise.all([getStoredTokens(), getStoredUser()]);
    if (tokens?.access && user) {
      dispatch(hydrateAuth({ userData: user, isAuthenticated: true }));
      return true;
    }
  } catch {
    // fall through
  }

  dispatch(hydrateAuth({ userData: null, isAuthenticated: false }));
  return false;
};

/**
 * Forgot password — POST /api/v1/accounts/reset_password/
 */
export const resetPasswordAction =
  ({ email }: { email: string }) =>
  async (dispatch: AppDispatch): Promise<AuthActionResult> => {
    dispatch(resetPasswordLoading(true));
    try {
      const response = await APIServiceNoAuth.post('accounts/reset_password/', { email });
      const message =
        response.data?.message || 'Check your email for reset instructions.';
      dispatch(resetPasswordSuccess(message));
      dispatch(resetPasswordLoading(false));
      return { fulfilled: true, message };
    } catch (error: unknown) {
      dispatch(resetPasswordLoading(false));
      const message = extractErrorMessage(error, 'Request failed');
      return { fulfilled: false, message };
    }
  };

/**
 * Confirm reset — POST /api/v1/accounts/confirm_reset_password/
 */
export const confirmResetPasswordAction =
  ({ token, new_password }: { token: string; new_password: string }) =>
  async (dispatch: AppDispatch): Promise<AuthActionResult> => {
    dispatch(confirmResetPasswordLoading(true));
    try {
      const response = await APIServiceNoAuth.post('accounts/confirm_reset_password/', {
        token,
        new_password,
      });
      const message = response.data?.message || 'Password reset successfully.';
      dispatch(confirmResetPasswordSuccess(message));
      dispatch(confirmResetPasswordLoading(false));
      return { fulfilled: true, message };
    } catch (error: unknown) {
      dispatch(confirmResetPasswordLoading(false));
      const message = extractErrorMessage(error, 'Request failed');
      return { fulfilled: false, message };
    }
  };

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string; message?: string; detail?: string } } })
      .response;
    return (
      response?.data?.error ||
      response?.data?.message ||
      response?.data?.detail ||
      fallback
    );
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

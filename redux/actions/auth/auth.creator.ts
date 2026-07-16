import authTypes from '@/redux/reducers/auth/auth.types';

export const loginUserLoading = (payload = true) => ({
  type: authTypes.LOGIN_USER_LOADING,
  payload,
});

export const loginUserSuccess = (payload: unknown = null) => ({
  type: authTypes.LOGIN_USER_SUCCESS,
  payload,
});

export const logoutUser = () => ({
  type: authTypes.LOGOUT_USER,
});

export const hydrateAuth = (payload: { userData: unknown; isAuthenticated: boolean }) => ({
  type: authTypes.HYDRATE_AUTH,
  payload,
});

export const resetPasswordLoading = (payload = true) => ({
  type: authTypes.RESET_PASSWORD_LOADING,
  payload,
});

export const resetPasswordSuccess = (payload: unknown = null) => ({
  type: authTypes.RESET_PASSWORD_SUCCESS,
  payload,
});

export const confirmResetPasswordLoading = (payload = true) => ({
  type: authTypes.CONFIRM_RESET_PASSWORD_LOADING,
  payload,
});

export const confirmResetPasswordSuccess = (payload: unknown = null) => ({
  type: authTypes.CONFIRM_RESET_PASSWORD_SUCCESS,
  payload,
});

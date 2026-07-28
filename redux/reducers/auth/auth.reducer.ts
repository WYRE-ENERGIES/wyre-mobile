import authTypes from '@/redux/reducers/auth/auth.types';

export type AuthState = {
  loginUserLoading: boolean;
  userData: Record<string, unknown> | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  resetPasswordLoading: boolean;
  resetPasswordData: string | null;
  confirmResetPasswordLoading: boolean;
  confirmResetPasswordData: string | null;
};

const INITIAL_STATE: AuthState = {
  loginUserLoading: false,
  userData: null,
  isAuthenticated: false,
  isHydrated: false,
  resetPasswordLoading: false,
  resetPasswordData: null,
  confirmResetPasswordLoading: false,
  confirmResetPasswordData: null,
};

type AuthAction = {
  type: string;
  payload?: unknown;
};

const authReducer = (state = INITIAL_STATE, action: AuthAction): AuthState => {
  switch (action.type) {
    case authTypes.LOGIN_USER_LOADING:
      return {
        ...state,
        loginUserLoading: Boolean(action.payload),
      };

    case authTypes.LOGIN_USER_SUCCESS:
      return {
        ...state,
        userData: (action.payload as AuthState['userData']) ?? null,
        isAuthenticated: Boolean(action.payload),
      };

    case authTypes.HYDRATE_AUTH: {
      const payload = action.payload as {
        userData: AuthState['userData'];
        isAuthenticated: boolean;
      };
      return {
        ...state,
        userData: payload.userData,
        isAuthenticated: payload.isAuthenticated,
        isHydrated: true,
      };
    }

    case authTypes.LOGOUT_USER:
      return {
        ...INITIAL_STATE,
        isHydrated: true,
      };

    case authTypes.RESET_PASSWORD_LOADING:
      return {
        ...state,
        resetPasswordLoading: Boolean(action.payload),
      };

    case authTypes.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        resetPasswordData: (action.payload as string) ?? null,
      };

    case authTypes.CONFIRM_RESET_PASSWORD_LOADING:
      return {
        ...state,
        confirmResetPasswordLoading: Boolean(action.payload),
      };

    case authTypes.CONFIRM_RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        confirmResetPasswordData: (action.payload as string) ?? null,
      };

    default:
      return state;
  }
};

export default authReducer;

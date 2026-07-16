import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '@/redux/reducers/auth/auth.reducer';

const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;

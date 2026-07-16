import { configureStore } from '@reduxjs/toolkit';

import rootReducer from '@/redux/reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

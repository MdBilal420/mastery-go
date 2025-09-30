import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './sessionSlice';

// Configure and export the Redux store
export const store = configureStore({
  reducer: {
    session: sessionReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {session: SessionState}
export type AppDispatch = typeof store.dispatch;
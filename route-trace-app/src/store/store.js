import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import routeTraceReducer from './slices/routeTraceSlice';
import historyReducer from './slices/historySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    routeTrace: routeTraceReducer,
    history: historyReducer,
  },
  // Middleware is automatically included by configureStore (e.g., thunk)
});

export default store;
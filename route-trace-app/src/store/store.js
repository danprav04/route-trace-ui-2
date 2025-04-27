// ----- File: src\store\store.js -----
// ----- File: src/store/store.js -----

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import routeTraceReducer from './slices/routeTraceSlice'; // Combined trace
import macTraceReducer from './slices/macTraceSlice'; // MAC trace
import directRouteReducer from './slices/directRouteSlice'; // Direct route trace
import historyReducer from './slices/historySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    routeTrace: routeTraceReducer, // State key for combined trace page
    macTrace: macTraceReducer,     // State key for MAC trace page
    directRoute: directRouteReducer, // State key for direct route trace page
    history: historyReducer,
  },
  // Middleware is automatically included by configureStore (e.g., thunk)
});

export default store;

// ----- End File: src/store/store.js -----
// ----- End File: src\store\store.js -----
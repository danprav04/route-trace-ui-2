import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';

// Enhanced JSON parsing to handle potential non-JSON strings gracefully
const safeParseJson = (jsonString, defaultValue = null) => {
  // If it's already an object (e.g., already parsed), return it directly
  if (typeof jsonString === 'object' && jsonString !== null) return jsonString;
  // If it's not a string or empty/whitespace, return the default value
  if (typeof jsonString !== 'string' || jsonString.trim() === '') return defaultValue;

  try {
    // Don't check type after parsing, just return the parsed result
    return JSON.parse(jsonString);
  } catch (e) {
    // Log parsing errors for debugging, but don't crash the app
    console.warn("Failed to parse JSON string:", jsonString?.substring(0, 100) + "...", "Error:", e); // Log only start of long strings
    return defaultValue; // Return default value on parsing failure
  }
};

// Helper to process raw route entries from the backend
const processRouteEntry = (route) => {
    // Ensure default values are appropriate (e.g., [] for hop lists, null for objects)
    const mainRouteTrace = safeParseJson(route.main_route_trace, []);
    const sourceMacTrace = safeParseJson(route.source_mac_trace, []);
    const destinationMacTrace = safeParseJson(route.destination_mac_trace, []);
    const inputDetails = safeParseJson(route.input_details, null);

    // Basic validation: ensure parsed hop traces are arrays
    const validMainRoute = Array.isArray(mainRouteTrace) ? mainRouteTrace : [];
    const validSourceMac = Array.isArray(sourceMacTrace) ? sourceMacTrace : [];
    const validDestMac = Array.isArray(destinationMacTrace) ? destinationMacTrace : [];

    return {
        ...route, // Include id, source, destination, trace_type, timestamp, user
        mainRouteTrace: validMainRoute,
        sourceMacTrace: validSourceMac,
        destinationMacTrace: validDestMac,
        inputDetails: (typeof inputDetails === 'object') ? inputDetails : null, // Ensure inputDetails is object or null
        // Keep original user object structure
        user: (typeof route.user === 'object' && route.user !== null) ? route.user : null,
        // Deprecated fields removed/replaced
        route: undefined, // Remove old 'route' field
        routeData: undefined, // Remove old 'routeData' field
        deviceInfo: undefined, // Remove old 'deviceInfo' field
        device_additional_info: undefined // Remove original backend field name
    };
};


// Async thunk for fetching user-specific route history
export const fetchUserHistory = createAsyncThunk(
  'history/fetchUserHistory',
  async (_, { rejectWithValue }) => {
    try {
      const rawRoutes = await routeService.getUserRoutes();
      // Process each route entry safely
      return rawRoutes.map(processRouteEntry);
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to fetch user history';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for fetching all routes (admin perspective)
export const fetchAllHistory = createAsyncThunk(
  'history/fetchAllHistory',
  async (_, { rejectWithValue }) => {
    try {
      const rawRoutes = await routeService.getAllRoutes();
       // Process each route entry safely
       return rawRoutes.map(processRouteEntry);
    } catch (error) {
       const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to fetch all routes history';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  userHistory: [],
  allHistory: [],
  userHistoryStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  allHistoryStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  error: null, // Holds error message string
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // Action to explicitly reset any history-related errors
    resetHistoryError: (state) => {
        state.error = null;
    }
    // Potentially add reducers for clearing history, etc. if needed
  },
  extraReducers: (builder) => {
    builder
      // --- User History Fetching ---
      .addCase(fetchUserHistory.pending, (state) => {
        state.userHistoryStatus = 'loading';
        state.error = null; // Clear previous errors
      })
      .addCase(fetchUserHistory.fulfilled, (state, action) => {
        state.userHistoryStatus = 'succeeded';
        state.userHistory = action.payload; // Store processed routes
      })
      .addCase(fetchUserHistory.rejected, (state, action) => {
        state.userHistoryStatus = 'failed';
        state.error = action.payload; // Store error message
      })
      // --- All History Fetching ---
      .addCase(fetchAllHistory.pending, (state) => {
        state.allHistoryStatus = 'loading';
        state.error = null; // Clear previous errors
      })
      .addCase(fetchAllHistory.fulfilled, (state, action) => {
        state.allHistoryStatus = 'succeeded';
        state.allHistory = action.payload; // Store processed routes
      })
      .addCase(fetchAllHistory.rejected, (state, action) => {
        state.allHistoryStatus = 'failed';
        state.error = action.payload; // Store error message
      });
  },
});

export const { resetHistoryError } = historySlice.actions;
export default historySlice.reducer;
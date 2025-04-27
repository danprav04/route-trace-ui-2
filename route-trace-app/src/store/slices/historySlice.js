// ----- File: src\store\slices\historySlice.js -----
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';

// Enhanced JSON parsing to handle potential non-JSON strings gracefully
const safeParseJson = (jsonString, defaultValue = null) => {
  // If it's already an object (e.g., already parsed), return it directly
  if (typeof jsonString === 'object' && jsonString !== null) return jsonString;
  // If it's not a string, return the default value
  if (typeof jsonString !== 'string' || jsonString.trim() === '') return defaultValue;

  try {
    const parsed = JSON.parse(jsonString);
    // Basic check if parsed result is an array (for routeData)
    // Adjust check if other structures are expected
    if (Array.isArray(parsed)) {
        return parsed;
    } else if (typeof parsed === 'object' && parsed !== null) { // For deviceInfo
         return parsed;
    }
    // If parsed into something unexpected (e.g., a primitive), return default
    return defaultValue;
  } catch (e) {
    // Log parsing errors for debugging, but don't crash the app
    console.warn("Failed to parse JSON string:", jsonString, "Error:", e);
    return defaultValue; // Return default value on parsing failure
  }
};

// Helper to process raw route entries from the backend
const processRouteEntry = (route) => ({
    ...route,
    // Parse the 'route' field (expected List[DetailedHop] as JSON string)
    routeData: safeParseJson(route.route, []), // Default to empty array if parsing fails or invalid
    // Parse the 'device_additional_info' field (expected JSON object string or null)
    deviceInfo: safeParseJson(route.device_additional_info, null), // Default to null
    // Ensure user is an object or null
    user: (typeof route.user === 'object' && route.user !== null) ? route.user : null
});

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
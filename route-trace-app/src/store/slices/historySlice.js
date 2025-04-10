// src/store/slices/historySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';

// Helper to safely parse JSON
const safeParseJson = (jsonString, defaultValue = null) => {
  // Added check for already parsed objects which might happen in some scenarios
  if (typeof jsonString === 'object' && jsonString !== null) return jsonString;
  if (typeof jsonString !== 'string') return defaultValue; // Return default if not string or object
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON:", e, "Input:", jsonString);
    return defaultValue; // Return default if parsing fails
  }
};

// Async thunk for fetching user-specific route history
export const fetchUserHistory = createAsyncThunk(
  'history/fetchUserHistory',
  async (_, { rejectWithValue }) => {
    try {
      const routes = await routeService.getUserRoutes();
      // Backend returns RouteHistoryEntry model
      // route field is a JSON string of List[DetailedHop]
      // device_additional_info is optional JSON string
      return routes.map(r => ({
        ...r,
        // Parse the JSON strings into objects/arrays
        // Ensure routeData becomes an array of hops or null/empty array
        routeData: safeParseJson(r.route, []), // Default to empty array if parse fails
        deviceInfo: safeParseJson(r.device_additional_info), // Default to null
      }));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user history');
    }
  }
);

// Async thunk for fetching all routes (admin)
export const fetchAllHistory = createAsyncThunk(
  'history/fetchAllHistory',
  async (_, { rejectWithValue }) => {
    try {
      const routes = await routeService.getAllRoutes();
       return routes.map(r => ({
        ...r,
        routeData: safeParseJson(r.route, []),
        deviceInfo: safeParseJson(r.device_additional_info),
        // Keep user info if backend provides it
        user: r.user || null
      }));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch all routes');
    }
  }
);

const initialState = {
  userHistory: [],
  allHistory: [],
  userHistoryStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  allHistoryStatus: 'idle',
  error: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    resetHistoryError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // User History Fetching
      .addCase(fetchUserHistory.pending, (state) => {
        state.userHistoryStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchUserHistory.fulfilled, (state, action) => {
        state.userHistoryStatus = 'succeeded';
        state.userHistory = action.payload;
      })
      .addCase(fetchUserHistory.rejected, (state, action) => {
        state.userHistoryStatus = 'failed';
        state.error = action.payload;
      })
      // All History Fetching
      .addCase(fetchAllHistory.pending, (state) => {
        state.allHistoryStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAllHistory.fulfilled, (state, action) => {
        state.allHistoryStatus = 'succeeded';
        state.allHistory = action.payload;
      })
      .addCase(fetchAllHistory.rejected, (state, action) => {
        state.allHistoryStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetHistoryError } = historySlice.actions;
export default historySlice.reducer;
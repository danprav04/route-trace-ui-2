import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';

// Helper to safely parse JSON
const safeParseJson = (jsonString, defaultValue = null) => {
  if (typeof jsonString !== 'string') return jsonString; // Already parsed or not a string
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse route JSON:", e);
    return defaultValue; // Return null or default if parsing fails
  }
};

// Async thunk for fetching user-specific route history
export const fetchUserHistory = createAsyncThunk(
  'history/fetchUserHistory',
  async (_, { rejectWithValue }) => {
    try {
      const routes = await routeService.getUserRoutes();
      // Assuming routes is an array: [{id, source, destination, route(json_string), timestamp, device_additional_info(json_string? check model), ...}, ...]
      return routes.map(r => ({
        ...r,
        // Parse potentially nested JSON strings
        routeData: safeParseJson(r.route),
        deviceInfo: safeParseJson(r.device_additional_info), // Adjust field name based on DB model
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
        routeData: safeParseJson(r.route),
        deviceInfo: safeParseJson(r.device_additional_info),
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
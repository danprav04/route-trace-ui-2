// ----- File: src/store/slices/macTraceSlice.js -----

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';
import { v4 as uuidv4 } from 'uuid';

// Helper to create initial trace state for MAC trace
const createInitialMacTraceState = () => ({
  id: uuidv4(),
  ip: '', // Endpoint IP
  dg: '', // Default Gateway
  dgStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'manual'
  traceStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  traceResult: null, // Will hold the List[DetailedHop] for the MAC trace
  error: null,
});

// --- Async Thunks ---

// Reusable fetch DG logic (or could import from a shared utility if needed)
export const fetchMacDefaultGateway = createAsyncThunk(
  'macTrace/fetchDefaultGateway',
  async ({ ip, traceId }, { rejectWithValue }) => {
    if (!ip) return rejectWithValue({ message: "IP address is required.", traceId });
    try {
      const gateway = await routeService.getDefaultGateway(ip);
      if (!gateway) throw new Error("No gateway found by backend.");
      return { gateway, traceId }; // Only need gateway and traceId
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Failed to fetch DG', traceId });
    }
  }
);

// Thunk to perform the MAC trace
export const performMacTrace = createAsyncThunk(
  'macTrace/performMacTrace',
  async ({ traceId, ip, dg }, { rejectWithValue }) => {
    if (!ip || !dg) {
        return rejectWithValue({ message: "Endpoint IP and Default Gateway are required.", traceId });
    }
    try {
      const result = await routeService.getMacTrace(ip, dg);
      return { traceId, result }; // result is expected List[DetailedHop]
    } catch (error) {
      return rejectWithValue({ message: error.message || 'MAC trace failed', traceId, errorObj: error });
    }
  }
);

// --- Slice Definition ---

const initialState = {
  traces: [createInitialMacTraceState()], // Start with one MAC trace section
};

const macTraceSlice = createSlice({
  name: 'macTrace',
  initialState,
  reducers: {
    addMacTraceSection: (state) => {
       if (state.traces.length < 5) {
         state.traces.push(createInitialMacTraceState());
       }
    },
    removeMacTraceSection: (state, action) => {
        const traceIdToRemove = action.payload;
        if (state.traces.length > 1) {
            state.traces = state.traces.filter(trace => trace.id !== traceIdToRemove);
        }
    },
    updateMacTraceInput: (state, action) => {
      const { traceId, field, value } = action.payload;
      const trace = state.traces.find(t => t.id === traceId);
      if (trace) {
        trace[field] = value;
        // Reset status and results when inputs change
        trace.traceStatus = 'idle';
        trace.traceResult = null;
        trace.error = null;

        // Mark DG as manually entered if user changes it
        if (field === 'dg' && trace.dgStatus !== 'loading') trace.dgStatus = 'manual';

        // Reset DG status if IP changes
        if (field === 'ip') {
            trace.dg = ''; // Clear old DG if IP changes
            trace.dgStatus = 'idle';
        }
      }
    },
    resetMacTraceState: (state) => {
        state.traces = [createInitialMacTraceState()];
    }
  },
  extraReducers: (builder) => {
    builder
      // Default Gateway Fetching
      .addCase(fetchMacDefaultGateway.pending, (state, action) => {
        const { traceId } = action.meta.arg;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.dgStatus = 'loading';
          trace.error = null; // Clear previous errors
        }
      })
      .addCase(fetchMacDefaultGateway.fulfilled, (state, action) => {
        const { gateway, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
            trace.dg = gateway;
            trace.dgStatus = 'succeeded';
        }
      })
      .addCase(fetchMacDefaultGateway.rejected, (state, action) => {
        const { message, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
         if (trace) {
          trace.dgStatus = 'failed';
          trace.error = `DG Fetch Error: ${message}`;
        }
      })

      // MAC Trace Execution
      .addCase(performMacTrace.pending, (state, action) => {
        const { traceId } = action.meta.arg;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = 'loading';
          trace.error = null;
          trace.traceResult = null; // Clear previous result
        }
      })
      .addCase(performMacTrace.fulfilled, (state, action) => {
        const { traceId, result } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = 'succeeded';
          trace.traceResult = result; // Store the List[DetailedHop]
          trace.error = null;
        }
      })
      .addCase(performMacTrace.rejected, (state, action) => {
        const { message, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = 'failed';
          trace.error = message;
          trace.traceResult = null; // Ensure result is null on failure
        }
      });
  },
});

export const { addMacTraceSection, removeMacTraceSection, updateMacTraceInput, resetMacTraceState } = macTraceSlice.actions;
export default macTraceSlice.reducer;

// ----- End File: src/store/slices/macTraceSlice.js -----
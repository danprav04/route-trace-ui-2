// ----- File: src\store\slices\macTraceSlice.js -----
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
  traceResult: null, // Holds List[DetailedHop] for the MAC trace
  error: null, // Holds error message string or object
});

// --- Async Thunks ---

export const fetchMacDefaultGateway = createAsyncThunk(
  'macTrace/fetchDefaultGateway',
  async ({ ip, traceId }, { rejectWithValue }) => {
    if (!ip) return rejectWithValue({ message: "IP address is required to fetch gateway.", traceId });
    try {
      const gateway = await routeService.getDefaultGateway(ip);
      if (!gateway) throw new Error("No gateway address returned by the backend.");
      return { gateway, traceId };
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to fetch default gateway';
      return rejectWithValue({ message: errorMessage, traceId });
    }
  }
);

export const performMacTrace = createAsyncThunk(
  'macTrace/performMacTrace',
  async ({ traceId, ip, dg }, { rejectWithValue }) => {
    if (!ip || !dg) {
        return rejectWithValue({ message: "Endpoint IP and Default Gateway are required.", traceId });
    }
    try {
      const result = await routeService.getMacTrace(ip, dg);
      // Ensure result is always an array, even if backend returns null/undefined
      return { traceId, result: result || [] };
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'MAC trace failed';
      return rejectWithValue({ message: errorMessage, traceId });
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
       const MAX_SECTIONS = 4; // Example limit
       if (state.traces.length < MAX_SECTIONS) {
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
      const traceIndex = state.traces.findIndex(t => t.id === traceId);
      if (traceIndex !== -1) {
        const trace = state.traces[traceIndex];
        trace[field] = value;

        // Reset status and results on input change
        trace.traceStatus = 'idle';
        trace.traceResult = null;
        trace.error = null; // Clear general error

        // Handle DG status updates
        if (field === 'dg' && trace.dgStatus !== 'loading') {
            trace.dgStatus = 'manual'; // Mark as manual if user types DG
        }
        // Reset DG field and status if IP changes
        if (field === 'ip') {
            trace.dg = '';
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
      // --- Default Gateway Fetching Reducers ---
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
             // Clear error state if DG fetch was the cause
             if (trace.error?.includes('Failed to fetch default gateway')) {
                 trace.error = null;
             }
        }
      })
      .addCase(fetchMacDefaultGateway.rejected, (state, action) => {
        const { message, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
         if (trace) {
          trace.dgStatus = 'failed';
          trace.error = `Gateway Fetch Error: ${message}`; // Set specific error
          // trace.traceStatus = 'idle'; // Optional: Reset trace status?
        }
      })

      // --- MAC Trace Execution Reducers ---
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
          trace.error = message; // Store the specific trace error
          trace.traceResult = null; // Ensure result is cleared on failure
        }
      });
  },
});

export const { addMacTraceSection, removeMacTraceSection, updateMacTraceInput, resetMacTraceState } = macTraceSlice.actions;
export default macTraceSlice.reducer;
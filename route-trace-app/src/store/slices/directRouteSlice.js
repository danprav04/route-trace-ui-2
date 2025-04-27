// ----- File: src\store\slices\directRouteSlice.js -----
// ----- File: src\store\slices\directRouteSlice.js -----
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';
import { v4 as uuidv4 } from 'uuid';

// Helper to create initial trace state for Direct Route trace (Simplified)
const createInitialDirectTraceState = () => ({
  id: uuidv4(),
  // sourceIp: '', // Removed
  // destinationIp: '', // Removed
  sourceDg: '', // Represents Source Gateway IP
  destinationDg: '', // Represents Destination Gateway IP
  vrf: '', // VRF is required
  // DgStatus fields removed as auto-fetch is removed
  traceStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  traceResult: null, // Holds List[DetailedHop] for the direct route trace
  error: null, // Holds error message string or object
});

// --- Async Thunks ---

// Removed fetchDirectDefaultGateway thunk as it's no longer needed

export const performDirectRouteTrace = createAsyncThunk(
  'directRoute/performDirectRouteTrace',
  async ({ traceId, sourceDg, destinationDg, vrf }, { rejectWithValue }) => {
    // Input validation - VRF is now considered mandatory here
    // sourceDg and destinationDg are the primary inputs now
    if (!sourceDg || !destinationDg || !vrf || vrf.trim() === '') {
        return rejectWithValue({ message: "Source Gateway IP, Destination Gateway IP, and VRF Name are required.", traceId });
    }
    try {
      // Trim VRF just in case
      const traceVrf = vrf.trim();
      // Call the main routeService.getRouteTrace function.
      // Pass Gateway IPs as both endpoint IPs and gateway IPs for this trace type.
      const result = await routeService.getRouteTrace(
          sourceDg,       // Pass Source Gateway as source_ip
          destinationDg,  // Pass Dest Gateway as destination_ip
          sourceDg,       // Pass Source Gateway as source_dg
          destinationDg,  // Pass Dest Gateway as destination_dg
          traceVrf        // Pass VRF
      );
      // Assuming result is List[DetailedHop] or could be empty list
      return { traceId, result: result || [] }; // Ensure result is always an array
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Direct route trace failed';
      return rejectWithValue({ message: errorMessage, traceId });
    }
  }
);

// --- Slice Definition ---

const initialState = {
  traces: [createInitialDirectTraceState()], // Start with one direct trace section
};

const directRouteSlice = createSlice({
  name: 'directRoute',
  initialState,
  reducers: {
    addDirectTraceSection: (state) => {
       const MAX_SECTIONS = 4; // Example limit
       if (state.traces.length < MAX_SECTIONS) {
         state.traces.push(createInitialDirectTraceState());
       }
    },
    removeDirectTraceSection: (state, action) => {
        const traceIdToRemove = action.payload;
        if (state.traces.length > 1) {
            state.traces = state.traces.filter(trace => trace.id !== traceIdToRemove);
        }
    },
    updateDirectTraceInput: (state, action) => {
      const { traceId, field, value } = action.payload;
      const traceIndex = state.traces.findIndex(t => t.id === traceId);
      if (traceIndex !== -1) {
        // Only update allowed fields: sourceDg, destinationDg, vrf
        if (['sourceDg', 'destinationDg', 'vrf'].includes(field)) {
            const trace = state.traces[traceIndex];
            trace[field] = value;

            // Reset status and results if relevant inputs change
            trace.traceStatus = 'idle';
            trace.traceResult = null;
            trace.error = null; // Clear general error on input change
        }
      }
    },
    resetDirectTraceState: (state) => {
        // Reset to the initial state with one empty trace section
        state.traces = [createInitialDirectTraceState()];
    }
  },
  extraReducers: (builder) => {
    builder
      // Removed fetchDirectDefaultGateway reducers

      // --- Direct Route Trace Execution Reducers ---
      .addCase(performDirectRouteTrace.pending, (state, action) => {
        const { traceId } = action.meta.arg;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = 'loading';
          trace.error = null; // Clear previous errors
          trace.traceResult = null; // Clear previous results
        }
      })
      .addCase(performDirectRouteTrace.fulfilled, (state, action) => {
        const { traceId, result } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = 'succeeded';
          trace.traceResult = result; // Store the List[DetailedHop]
          trace.error = null;
        }
      })
      .addCase(performDirectRouteTrace.rejected, (state, action) => {
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

export const { addDirectTraceSection, removeDirectTraceSection, updateDirectTraceInput, resetDirectTraceState } = directRouteSlice.actions;
export default directRouteSlice.reducer;

// ----- End File: src\store\slices\directRouteSlice.js -----
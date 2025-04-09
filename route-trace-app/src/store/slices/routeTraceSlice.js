import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';
import { v4 as uuidv4 } from 'uuid';

// Helper to create initial trace state
const createInitialTraceState = () => ({
  id: uuidv4(), // Unique ID for this trace section
  sourceIp: '',
  destinationIp: '',
  sourceDg: '',
  destinationDg: '',
  sourceDgStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'manual'
  destinationDgStatus: 'idle', // 'manual' means user edited it after fetch/fail
  traceStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'partial_success'
  sourceMacTrace: null,
  destinationMacTrace: null,
  mainRouteTrace: null, // Expecting format like [{hop: 1, ip: 'x', name: 'y'}, ...]
  error: null, // Can store string or object for more details
});

// --- Async Thunks ---

export const fetchDefaultGateway = createAsyncThunk(
  'routeTrace/fetchDefaultGateway',
  async ({ ip, type, traceId }, { rejectWithValue }) => {
    if (!ip) return rejectWithValue({ message: "IP address is required.", type, traceId });
    try {
      const gateway = await routeService.getDefaultGateway(ip);
      // Assuming gateway is returned directly as a string
      if (!gateway) throw new Error("No gateway found by backend.");
      return { gateway, type, traceId };
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Failed to fetch DG', type, traceId });
    }
  }
);

export const performFullTrace = createAsyncThunk(
  'routeTrace/performFullTrace',
  async ({ traceId, sourceIp, destinationIp, sourceDg, destinationDg }, { rejectWithValue }) => {
    if (!sourceIp || !destinationIp || !sourceDg || !destinationDg) {
        return rejectWithValue({ message: "Source IP, Destination IP, Source DG, and Destination DG are required.", traceId });
    }
    try {
      const results = await Promise.allSettled([
        routeService.getRouteTrace(sourceIp, destinationIp, sourceDg, destinationDg), // Main route first
        routeService.getMacTrace(sourceIp, sourceDg),
        routeService.getMacTrace(destinationIp, destinationDg)
      ]);

      const [mainRouteResult, sourceMacResult, destMacResult] = results;

      const mainRouteTrace = mainRouteResult.status === 'fulfilled' ? mainRouteResult.value : null;
      const sourceMacTrace = sourceMacResult.status === 'fulfilled' ? sourceMacResult.value : null;
      const destinationMacTrace = destMacResult.status === 'fulfilled' ? destMacResult.value : null;

      const errors = results
        .filter(p => p.status === 'rejected')
        .map(p => p.reason.message || 'Unknown error')
        .join('; ');

      // Determine overall status
      let status = 'failed';
      if (mainRouteResult.status === 'fulfilled') {
          status = errors ? 'partial_success' : 'succeeded';
      }

      if (status === 'failed') {
          // Throw error to be caught by rejectWithValue if the main trace failed fundamentally
          throw new Error(errors || 'Trace failed');
      }

      return {
        traceId,
        mainRouteTrace,
        sourceMacTrace,
        destinationMacTrace,
        status, // 'succeeded' or 'partial_success'
        error: errors || null // Report partial errors if any
      };

    } catch (error) {
      // Catches error from the try block (fundamental failure) or rejections if not handled above
      return rejectWithValue({ message: error.message || 'Full trace failed', traceId });
    }
  }
);

// --- Slice Definition ---

const initialState = {
  traces: [createInitialTraceState()], // Start with one trace section
};

const routeTraceSlice = createSlice({
  name: 'routeTrace',
  initialState,
  reducers: {
    addTraceSection: (state) => {
       if (state.traces.length < 5) { // Limit comparison sections if needed
         state.traces.push(createInitialTraceState());
       }
    },
    removeTraceSection: (state, action) => {
        const traceIdToRemove = action.payload;
        if (state.traces.length > 1) { // Prevent removing the last one
            state.traces = state.traces.filter(trace => trace.id !== traceIdToRemove);
        }
    },
    updateTraceInput: (state, action) => {
      const { traceId, field, value } = action.payload;
      const trace = state.traces.find(t => t.id === traceId);
      if (trace) {
        trace[field] = value;
        // Reset status and results when inputs change
        trace.traceStatus = 'idle';
        trace.mainRouteTrace = null;
        trace.sourceMacTrace = null;
        trace.destinationMacTrace = null;
        trace.error = null;

        // Mark DG as manually entered if user changes it after auto-fetch/fail
        if (field === 'sourceDg' && trace.sourceDgStatus !== 'loading') trace.sourceDgStatus = 'manual';
        if (field === 'destinationDg' && trace.destinationDgStatus !== 'loading') trace.destinationDgStatus = 'manual';

        // Reset DG status if IP changes
        if (field === 'sourceIp') {
            trace.sourceDg = ''; // Clear old DG if source IP changes
            trace.sourceDgStatus = 'idle';
        }
        if (field === 'destinationIp') {
            trace.destinationDg = ''; // Clear old DG if destination IP changes
            trace.destinationDgStatus = 'idle';
        }
      }
    },
    resetTraceState: (state) => {
        state.traces = [createInitialTraceState()];
    }
  },
  extraReducers: (builder) => {
    builder
      // Default Gateway Fetching
      .addCase(fetchDefaultGateway.pending, (state, action) => {
        const { type, traceId } = action.meta.arg;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          if (type === 'source') trace.sourceDgStatus = 'loading';
          if (type === 'destination') trace.destinationDgStatus = 'loading';
          trace.error = null;
        }
      })
      .addCase(fetchDefaultGateway.fulfilled, (state, action) => {
        const { gateway, type, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          if (type === 'source') {
            trace.sourceDg = gateway;
            trace.sourceDgStatus = 'succeeded';
          }
          if (type === 'destination') {
            trace.destinationDg = gateway;
            trace.destinationDgStatus = 'succeeded';
          }
        }
      })
      .addCase(fetchDefaultGateway.rejected, (state, action) => {
        const { message, type, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
         if (trace) {
          if (type === 'source') trace.sourceDgStatus = 'failed';
          if (type === 'destination') trace.destinationDgStatus = 'failed';
           trace.error = `DG Fetch Error (${type}): ${message}`;
        }
      })
      // Full Trace Execution
      .addCase(performFullTrace.pending, (state, action) => {
        const { traceId } = action.meta.arg;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = 'loading';
          trace.error = null;
          // Clear previous results while loading new ones
          trace.mainRouteTrace = null;
          trace.sourceMacTrace = null;
          trace.destinationMacTrace = null;
        }
      })
      .addCase(performFullTrace.fulfilled, (state, action) => {
        const { traceId, mainRouteTrace, sourceMacTrace, destinationMacTrace, status, error } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = status; // 'succeeded' or 'partial_success'
          trace.mainRouteTrace = mainRouteTrace;
          trace.sourceMacTrace = sourceMacTrace;
          trace.destinationMacTrace = destinationMacTrace;
          trace.error = error; // Store any partial errors reported
        }
      })
      .addCase(performFullTrace.rejected, (state, action) => {
        const { message, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = 'failed';
          trace.error = message; // Store the main error message
           // Results are already cleared in pending or might be null from failed calls
        }
      });
  },
});

export const { addTraceSection, removeTraceSection, updateTraceInput, resetTraceState } = routeTraceSlice.actions;
export default routeTraceSlice.reducer;
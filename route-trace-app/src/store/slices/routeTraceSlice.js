// ----- File: src/store/slices/routeTraceSlice.js -----

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';
import { v4 as uuidv4 } from 'uuid';

// Helper to create initial trace state
const createInitialTraceState = () => ({
  id: uuidv4(), // Unique ID for this trace instance
  sourceIp: '',
  destinationIp: '',
  sourceDg: '',
  destinationDg: '',
  sourceDgStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'manual'
  destinationDgStatus: 'idle',
  traceStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'partial_success'
  sourceMacTrace: null, // Expecting format like List[DetailedHop] or null
  destinationMacTrace: null, // Expecting format like List[DetailedHop] or null
  mainRouteTrace: null, // Expecting format like List[DetailedHop] or null
  error: null, // Can store string or object for more details
});

// --- Async Thunks (Modified to accept traceId in payload but operate on single state) ---

// Fetch DG needs traceId in case multiple slices use it, but RouteTrace only has one trace
export const fetchDefaultGateway = createAsyncThunk(
  'routeTrace/fetchDefaultGateway',
  async ({ ip, type, traceId }, { rejectWithValue, getState }) => {
    // Ensure the traceId matches the ID in the current state
    const currentTraceId = getState().routeTrace.trace.id;
    if (traceId !== currentTraceId) {
         console.warn(`fetchDefaultGateway: Mismatched traceId. State: ${currentTraceId}, Action: ${traceId}. Ignoring action.`);
         // Don't reject, just ignore if ID doesn't match current state
         return { ignored: true }; // Signal that the action was ignored
    }

    if (!ip) return rejectWithValue({ message: "IP address is required.", type, traceId });
    try {
      const gateway = await routeService.getDefaultGateway(ip);
      if (!gateway) throw new Error("No gateway found by backend.");
      return { gateway, type, traceId }; // Return traceId for consistency
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Failed to fetch DG', type, traceId });
    }
  }
);

// Perform trace needs traceId to ensure action corresponds to current state
export const performFullTrace = createAsyncThunk(
  'routeTrace/performFullTrace',
  async ({ traceId, sourceIp, destinationIp, sourceDg, destinationDg }, { rejectWithValue, getState }) => {
    const currentTraceId = getState().routeTrace.trace.id;
    if (traceId !== currentTraceId) {
        console.warn(`performFullTrace: Mismatched traceId. State: ${currentTraceId}, Action: ${traceId}. Ignoring action.`);
        // Don't reject, just ignore
        return { ignored: true };
    }

    if (!sourceIp || !destinationIp || !sourceDg || !destinationDg) {
        return rejectWithValue({ message: "Source IP, Destination IP, Source DG, and Destination DG are required.", traceId });
    }
    try {
      // Perform the API calls concurrently
      const results = await Promise.allSettled([
        routeService.getRouteTrace(sourceIp, destinationIp, sourceDg, destinationDg), // Main route first
        routeService.getMacTrace(sourceIp, sourceDg),
        routeService.getMacTrace(destinationIp, destinationDg)
      ]);

      const [mainRouteResult, sourceMacResult, destMacResult] = results;

      // Extract data or null from results
      const mainRouteTrace = mainRouteResult.status === 'fulfilled' ? mainRouteResult.value : null;
      const sourceMacTrace = sourceMacResult.status === 'fulfilled' ? sourceMacResult.value : null;
      const destinationMacTrace = destMacResult.status === 'fulfilled' ? destMacResult.value : null;

      // Collect error messages
      const errors = results
        .filter(p => p.status === 'rejected')
        .map(p => p.reason?.message || 'Unknown trace component error') // Use optional chaining
        .join('; ');

      // Determine overall status
      let status = 'failed'; // Default to failed
      if (mainRouteResult.status === 'fulfilled') {
          status = errors ? 'partial_success' : 'succeeded'; // Success/Partial if main trace worked
      }

      if (status === 'failed' && mainRouteResult.status === 'rejected') {
          // If the main trace failed fundamentally, throw its error to be caught by rejectWithValue
          throw new Error(errors || mainRouteResult.reason?.message || 'Main trace failed fundamentally');
      }

      return {
        traceId, // Include traceId in the fulfilled payload for matching
        mainRouteTrace,
        sourceMacTrace,
        destinationMacTrace,
        status, // 'succeeded' or 'partial_success' or 'failed' (if only mac traces failed)
        error: errors || null // Report partial errors if any
      };

    } catch (error) {
      // Catches error from the try block (fundamental failure) or rejections if not handled above
      return rejectWithValue({ message: error.message || 'Full trace operation failed', traceId, errorObj: error });
    }
  }
);

// --- Slice Definition (Simplified State) ---

const initialState = {
  // Contains only *one* trace state object, not an array
  trace: createInitialTraceState(),
};

const routeTraceSlice = createSlice({
  name: 'routeTrace',
  initialState,
  reducers: {
    // REMOVED: addTraceSection, removeTraceSection

    updateTraceInput: (state, action) => {
      const { traceId, field, value } = action.payload;
      // Check if the action is for the *current* trace object in state
      if (state.trace.id === traceId) {
          const trace = state.trace; // Direct reference to the single trace object
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
      } else {
          console.warn(`updateTraceInput: Mismatched traceId. State: ${state.trace.id}, Action: ${traceId}. Ignoring update.`);
      }
    },
    resetTraceState: (state) => {
        // Replace the existing trace object with a new initial one
        state.trace = createInitialTraceState();
    }
  },
  extraReducers: (builder) => {
    builder
      // Default Gateway Fetching
      .addCase(fetchDefaultGateway.pending, (state, action) => {
        const { type, traceId } = action.meta.arg;
        // Only update state if the pending action matches the current trace ID
        if (state.trace.id === traceId) {
          if (type === 'source') state.trace.sourceDgStatus = 'loading';
          if (type === 'destination') state.trace.destinationDgStatus = 'loading';
          state.trace.error = null; // Clear previous DG errors
        }
      })
      .addCase(fetchDefaultGateway.fulfilled, (state, action) => {
         if (action.payload.ignored) return; // Do nothing if action was ignored
        const { gateway, type, traceId } = action.payload;
        // Only update state if the fulfilled action matches the current trace ID
        if (state.trace.id === traceId) {
          if (type === 'source') {
            state.trace.sourceDg = gateway;
            state.trace.sourceDgStatus = 'succeeded';
          }
          if (type === 'destination') {
            state.trace.destinationDg = gateway;
            state.trace.destinationDgStatus = 'succeeded';
          }
           // Clear general error if DG fetch succeeds (might overwrite a previous trace error)
           state.trace.error = null;
        }
      })
      .addCase(fetchDefaultGateway.rejected, (state, action) => {
        if (action.payload.ignored) return; // Do nothing if action was ignored
        const { message, type, traceId } = action.payload;
        // Only update state if the rejected action matches the current trace ID
        if (state.trace.id === traceId) {
          if (type === 'source') state.trace.sourceDgStatus = 'failed';
          if (type === 'destination') state.trace.destinationDgStatus = 'failed';
          // Set the error specifically for DG failure
          state.trace.error = `DG Fetch Error (${type}): ${message}`;
          // Reset trace status if a DG fetch fails while trace was in progress/success
          state.trace.traceStatus = 'idle';
        }
      })

      // Full Trace Execution
      .addCase(performFullTrace.pending, (state, action) => {
        const { traceId } = action.meta.arg;
        // Only update state if the pending action matches the current trace ID
        if (state.trace.id === traceId) {
          state.trace.traceStatus = 'loading';
          state.trace.error = null;
          // Clear previous results while loading new ones
          state.trace.mainRouteTrace = null;
          state.trace.sourceMacTrace = null;
          state.trace.destinationMacTrace = null;
        }
      })
      .addCase(performFullTrace.fulfilled, (state, action) => {
         if (action.payload.ignored) return; // Do nothing if action was ignored
        const { traceId, mainRouteTrace, sourceMacTrace, destinationMacTrace, status, error } = action.payload;
        // Only update state if the fulfilled action matches the current trace ID
        if (state.trace.id === traceId) {
          state.trace.traceStatus = status; // 'succeeded' or 'partial_success' or 'failed'
          state.trace.mainRouteTrace = mainRouteTrace;
          state.trace.sourceMacTrace = sourceMacTrace;
          state.trace.destinationMacTrace = destinationMacTrace;
          state.trace.error = error; // Store any partial errors reported
        }
      })
      .addCase(performFullTrace.rejected, (state, action) => {
        if (action.payload.ignored) return; // Do nothing if action was ignored
        const { message, traceId } = action.payload;
        // Only update state if the rejected action matches the current trace ID
        if (state.trace.id === traceId) {
          state.trace.traceStatus = 'failed';
          state.trace.error = message; // Store the main error message
           // Ensure results are explicitly null on failure
           state.trace.mainRouteTrace = null;
           state.trace.sourceMacTrace = null;
           state.trace.destinationMacTrace = null;
        }
      });
  },
});

// Export only the relevant actions
export const { updateTraceInput, resetTraceState } = routeTraceSlice.actions;
export default routeTraceSlice.reducer;

// ----- End File: src/store/slices/routeTraceSlice.js -----
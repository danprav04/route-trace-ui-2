// ----- File: src\store\slices\routeTraceSlice.js -----
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed

// Helper to create the initial state for the single combined trace
const createInitialTraceState = () => ({
  id: uuidv4(), // Unique ID for this trace instance/session
  sourceIp: '',
  destinationIp: '',
  sourceDg: '',
  destinationDg: '',
  sourceDgStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'manual'
  destinationDgStatus: 'idle',
  traceStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'partial_success'
  sourceMacTrace: null, // Holds List[DetailedHop] or null
  destinationMacTrace: null, // Holds List[DetailedHop] or null
  mainRouteTrace: null, // Holds List[DetailedHop] or null
  error: null, // Holds error message string or potentially an object with details
});

// --- Async Thunks ---

// Fetch Default Gateway (Source or Destination)
export const fetchDefaultGateway = createAsyncThunk(
  'routeTrace/fetchDefaultGateway',
  async ({ ip, type, traceId }, { rejectWithValue, getState }) => {
    // Check if the action's traceId matches the current state's traceId
    const currentTraceId = getState().routeTrace.trace.id;
    if (traceId !== currentTraceId) {
         // This prevents updates if the user quickly changes inputs/navigates
         console.warn(`fetchDefaultGateway: Action traceId ${traceId} does not match current state traceId ${currentTraceId}. Ignoring.`);
         return { ignored: true }; // Signal that the action was ignored
    }

    if (!ip) return rejectWithValue({ message: "IP address is required to fetch gateway.", type, traceId });
    try {
      const gateway = await routeService.getDefaultGateway(ip);
      if (!gateway) throw new Error("No gateway address returned by the backend.");
      return { gateway, type, traceId };
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to fetch default gateway';
      return rejectWithValue({ message: errorMessage, type, traceId });
    }
  }
);

// Perform the Full Combined Trace (Main Route + Both MAC Traces)
export const performFullTrace = createAsyncThunk(
  'routeTrace/performFullTrace',
  async ({ traceId, sourceIp, destinationIp, sourceDg, destinationDg }, { rejectWithValue, getState }) => {
    // Check if the action's traceId matches the current state's traceId
     const currentTraceId = getState().routeTrace.trace.id;
     if (traceId !== currentTraceId) {
         console.warn(`performFullTrace: Action traceId ${traceId} does not match current state traceId ${currentTraceId}. Ignoring.`);
         return { ignored: true }; // Signal ignored action
     }

    // Input validation
    if (!sourceIp || !destinationIp || !sourceDg || !destinationDg) {
        return rejectWithValue({ message: "Source IP, Destination IP, Source DG, and Destination DG are required.", traceId });
    }
    try {
      // Perform the API calls concurrently for efficiency
      const results = await Promise.allSettled([
        routeService.getRouteTrace(sourceIp, destinationIp, sourceDg, destinationDg), // Main route
        routeService.getMacTrace(sourceIp, sourceDg),                             // Source MAC trace
        routeService.getMacTrace(destinationIp, destinationDg)                       // Destination MAC trace
      ]);

      const [mainRouteResult, sourceMacResult, destMacResult] = results;

      // Helper to extract value or null, ensuring arrays for trace results
      const getResultData = (promiseResult) =>
         promiseResult.status === 'fulfilled' ? (promiseResult.value || []) : null;

      // Extract data or null from settled promises
      const mainRouteTrace = getResultData(mainRouteResult);
      const sourceMacTrace = getResultData(sourceMacResult);
      const destinationMacTrace = getResultData(destMacResult);

      // Collect detailed error messages if any part failed
      const errors = results
        .filter(p => p.status === 'rejected')
        .map((p, index) => {
            const component = ['Main Route', 'Source MAC Trace', 'Destination MAC Trace'][index];
            const reason = p.reason?.response?.data?.detail || p.reason?.message || 'Unknown error';
            return `${component}: ${reason}`;
        });

      // Determine overall status based on results
      let finalStatus;
      if (mainRouteResult.status === 'rejected') {
          finalStatus = 'failed'; // Main route failure is a critical failure
      } else if (errors.length > 0) {
          finalStatus = 'partial_success'; // Main route succeeded, but MAC trace(s) failed
      } else {
          finalStatus = 'succeeded'; // All components succeeded
      }

      // Return combined results and status
      return {
        traceId,
        mainRouteTrace,
        sourceMacTrace,
        destinationMacTrace,
        status: finalStatus,
        // Join multiple errors for display, or return null if no errors
        error: errors.length > 0 ? errors.join('; ') : null
      };

    } catch (error) {
      // This catch block handles errors *before* the Promise.allSettled or if something unexpected happens
      const errorMessage = error?.response?.data?.detail || error?.message || 'Full trace operation failed unexpectedly';
      return rejectWithValue({ message: errorMessage, traceId });
    }
  }
);

// --- Slice Definition (Manages a single trace state) ---

const initialState = {
  // Contains only *one* trace state object
  trace: createInitialTraceState(),
};

const routeTraceSlice = createSlice({
  name: 'routeTrace',
  initialState,
  reducers: {
    // Update input fields for the single trace
    updateTraceInput: (state, action) => {
      const { traceId, field, value } = action.payload;
      // Ensure the update is for the currently active trace ID
      if (state.trace.id === traceId) {
          const trace = state.trace; // Direct reference
          trace[field] = value;

          // Reset status and results whenever an input changes
          trace.traceStatus = 'idle';
          trace.mainRouteTrace = null;
          trace.sourceMacTrace = null;
          trace.destinationMacTrace = null;
          trace.error = null; // Clear general error

          // Handle DG status logic
          if (field === 'sourceDg' && trace.sourceDgStatus !== 'loading') {
              trace.sourceDgStatus = 'manual';
          }
          if (field === 'destinationDg' && trace.destinationDgStatus !== 'loading') {
              trace.destinationDgStatus = 'manual';
          }
          if (field === 'sourceIp') {
              trace.sourceDg = '';
              trace.sourceDgStatus = 'idle';
          }
          if (field === 'destinationIp') {
              trace.destinationDg = '';
              trace.destinationDgStatus = 'idle';
          }
      } else {
           console.warn(`updateTraceInput: Mismatched traceId. State: ${state.trace.id}, Action: ${traceId}. Ignoring update.`);
      }
    },
    // Reset the entire trace state to its initial empty state
    resetTraceState: (state) => {
        state.trace = createInitialTraceState();
    }
    // Removed addTraceSection and removeTraceSection as this slice handles a single trace
  },
  extraReducers: (builder) => {
    builder
      // --- Default Gateway Fetching Reducers ---
      .addCase(fetchDefaultGateway.pending, (state, action) => {
        const { type, traceId } = action.meta.arg;
        if (state.trace.id === traceId) { // Check ID match
          if (type === 'source') state.trace.sourceDgStatus = 'loading';
          if (type === 'destination') state.trace.destinationDgStatus = 'loading';
          state.trace.error = null; // Clear previous errors
        }
      })
      .addCase(fetchDefaultGateway.fulfilled, (state, action) => {
         // Ignore if the action was signaled as ignored
         if (action.payload.ignored) return;
        const { gateway, type, traceId } = action.payload;
        if (state.trace.id === traceId) { // Check ID match
          if (type === 'source') {
            state.trace.sourceDg = gateway;
            state.trace.sourceDgStatus = 'succeeded';
          }
          if (type === 'destination') {
            state.trace.destinationDg = gateway;
            state.trace.destinationDgStatus = 'succeeded';
          }
           // Clear error state if DG fetch was the cause
           if (state.trace.error?.includes('Failed to fetch default gateway')) {
               state.trace.error = null;
           }
        }
      })
      .addCase(fetchDefaultGateway.rejected, (state, action) => {
        if (action.payload.ignored) return; // Ignore if signaled
        const { message, type, traceId } = action.payload;
        if (state.trace.id === traceId) { // Check ID match
          if (type === 'source') state.trace.sourceDgStatus = 'failed';
          if (type === 'destination') state.trace.destinationDgStatus = 'failed';
          state.trace.error = `Gateway Fetch Error (${type}): ${message}`; // Set specific error
          // state.trace.traceStatus = 'idle'; // Optional: Reset trace status on DG fail?
        }
      })

      // --- Full Trace Execution Reducers ---
      .addCase(performFullTrace.pending, (state, action) => {
        const { traceId } = action.meta.arg;
        if (state.trace.id === traceId) { // Check ID match
          state.trace.traceStatus = 'loading';
          state.trace.error = null;
          // Clear previous results
          state.trace.mainRouteTrace = null;
          state.trace.sourceMacTrace = null;
          state.trace.destinationMacTrace = null;
        }
      })
      .addCase(performFullTrace.fulfilled, (state, action) => {
         if (action.payload.ignored) return; // Ignore if signaled
        const { traceId, mainRouteTrace, sourceMacTrace, destinationMacTrace, status, error } = action.payload;
        if (state.trace.id === traceId) { // Check ID match
          state.trace.traceStatus = status; // 'succeeded', 'partial_success', or 'failed'
          state.trace.mainRouteTrace = mainRouteTrace;
          state.trace.sourceMacTrace = sourceMacTrace;
          state.trace.destinationMacTrace = destinationMacTrace;
          state.trace.error = error; // Store combined errors message or null
        }
      })
      .addCase(performFullTrace.rejected, (state, action) => {
        if (action.payload.ignored) return; // Ignore if signaled
        const { message, traceId } = action.payload;
        if (state.trace.id === traceId) { // Check ID match
          state.trace.traceStatus = 'failed';
          state.trace.error = message; // Store the primary error message
           // Explicitly clear results on fundamental failure
           state.trace.mainRouteTrace = null;
           state.trace.sourceMacTrace = null;
           state.trace.destinationMacTrace = null;
        }
      });
  },
});

// Export only the relevant actions for a single trace state
export const { updateTraceInput, resetTraceState } = routeTraceSlice.actions;
export default routeTraceSlice.reducer;
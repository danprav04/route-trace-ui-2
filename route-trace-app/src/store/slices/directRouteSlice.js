// ----- File: src\store\slices\directRouteSlice.js -----
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../../services/routeService';
import { v4 as uuidv4 } from 'uuid';

// Helper to create initial trace state for Direct Route trace
const createInitialDirectTraceState = () => ({
  id: uuidv4(),
  sourceIp: '',
  destinationIp: '',
  sourceDg: '',
  destinationDg: '',
  vrf: '', // Add VRF field
  sourceDgStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'manual'
  destinationDgStatus: 'idle',
  traceStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  traceResult: null, // Holds List[DetailedHop] for the direct route trace
  error: null, // Holds error message string or object
});

// --- Async Thunks ---

export const fetchDirectDefaultGateway = createAsyncThunk(
  'directRoute/fetchDefaultGateway',
  async ({ ip, type, traceId }, { rejectWithValue }) => {
    // Basic IP validation could be added here
    if (!ip) return rejectWithValue({ message: "IP address is required to fetch gateway.", type, traceId });
    try {
      const gateway = await routeService.getDefaultGateway(ip);
      // Handle case where backend returns empty/null gateway gracefully
      if (!gateway) throw new Error("No gateway address returned by the backend.");
      return { gateway, type, traceId };
    } catch (error) {
      // Standardize error message format
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to fetch default gateway';
      return rejectWithValue({ message: errorMessage, type, traceId });
    }
  }
);

export const performDirectRouteTrace = createAsyncThunk(
  'directRoute/performDirectRouteTrace',
  async ({ traceId, sourceIp, destinationIp, sourceDg, destinationDg, vrf }, { rejectWithValue }) => {
    // Input validation
    if (!sourceIp || !destinationIp || !sourceDg || !destinationDg) {
        return rejectWithValue({ message: "Source IP, Destination IP, Source DG, and Destination DG are required.", traceId });
    }
    try {
      // Ensure VRF is passed correctly (null or string)
      const traceVrf = vrf && vrf.trim() !== '' ? vrf.trim() : null;
      const result = await routeService.getRouteTrace(
          sourceIp, destinationIp, sourceDg, destinationDg, null, null, traceVrf
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
       // Limit the number of sections for performance/UI reasons
       const MAX_SECTIONS = 4; // Example limit
       if (state.traces.length < MAX_SECTIONS) {
         state.traces.push(createInitialDirectTraceState());
       }
       // Optionally, provide feedback if limit is reached (e.g., via a separate state flag or UI component)
    },
    removeDirectTraceSection: (state, action) => {
        const traceIdToRemove = action.payload;
        // Prevent removing the last section
        if (state.traces.length > 1) {
            state.traces = state.traces.filter(trace => trace.id !== traceIdToRemove);
        }
    },
    updateDirectTraceInput: (state, action) => {
      const { traceId, field, value } = action.payload;
      const traceIndex = state.traces.findIndex(t => t.id === traceId);
      if (traceIndex !== -1) {
        const trace = state.traces[traceIndex];
        trace[field] = value;

        // Reset status and results if relevant inputs change
        trace.traceStatus = 'idle';
        trace.traceResult = null;
        trace.error = null; // Clear general error on input change

        // Logic for DG status when inputs change
        if (field === 'sourceDg' && trace.sourceDgStatus !== 'loading') {
            trace.sourceDgStatus = 'manual'; // Mark as manual if user types in DG field
        }
        if (field === 'destinationDg' && trace.destinationDgStatus !== 'loading') {
            trace.destinationDgStatus = 'manual';
        }
        // If IP changes, reset the corresponding DG field and status
        if (field === 'sourceIp') {
            trace.sourceDg = '';
            trace.sourceDgStatus = 'idle';
        }
        if (field === 'destinationIp') {
            trace.destinationDg = '';
            trace.destinationDgStatus = 'idle';
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
      // --- Default Gateway Fetching Reducers ---
      .addCase(fetchDirectDefaultGateway.pending, (state, action) => {
        const { type, traceId } = action.meta.arg;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          if (type === 'source') trace.sourceDgStatus = 'loading';
          if (type === 'destination') trace.destinationDgStatus = 'loading';
          trace.error = null; // Clear previous errors when starting fetch
        }
      })
      .addCase(fetchDirectDefaultGateway.fulfilled, (state, action) => {
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
           // Clear error state if DG fetch was the cause of a previous error
           if (trace.error?.includes('Failed to fetch default gateway')) {
               trace.error = null;
           }
        }
      })
      .addCase(fetchDirectDefaultGateway.rejected, (state, action) => {
        const { message, type, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
         if (trace) {
          if (type === 'source') trace.sourceDgStatus = 'failed';
          if (type === 'destination') trace.destinationDgStatus = 'failed';
          // Set specific error related to DG fetch
          trace.error = `Gateway Fetch Error (${type}): ${message}`;
          // Reset trace status if a DG fetch fails while a trace was in progress/succeeded
          // trace.traceStatus = 'idle'; // Optional: Reset trace status?
        }
      })

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
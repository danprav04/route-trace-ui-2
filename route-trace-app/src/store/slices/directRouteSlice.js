// ----- File: src/store/slices/directRouteSlice.js -----

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
  sourceDgStatus: 'idle',
  destinationDgStatus: 'idle',
  traceStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  traceResult: null, // Will hold the List[DetailedHop] for the direct route trace
  error: null,
});

// --- Async Thunks ---

// Reusable fetch DG logic
export const fetchDirectDefaultGateway = createAsyncThunk(
  'directRoute/fetchDefaultGateway',
  async ({ ip, type, traceId }, { rejectWithValue }) => {
    if (!ip) return rejectWithValue({ message: "IP address is required.", type, traceId });
    try {
      const gateway = await routeService.getDefaultGateway(ip);
      if (!gateway) throw new Error("No gateway found by backend.");
      return { gateway, type, traceId };
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Failed to fetch DG', type, traceId });
    }
  }
);

// Thunk to perform the Direct Route trace
export const performDirectRouteTrace = createAsyncThunk(
  'directRoute/performDirectRouteTrace',
  async ({ traceId, sourceIp, destinationIp, sourceDg, destinationDg, vrf }, { rejectWithValue }) => {
    if (!sourceIp || !destinationIp || !sourceDg || !destinationDg) {
        return rejectWithValue({ message: "Source IP, Destination IP, Source DG, and Destination DG are required.", traceId });
    }
    try {
      // Call the specific backend endpoint for direct route trace
      const result = await routeService.getRouteTrace(
          sourceIp, destinationIp, sourceDg, destinationDg, null, null, vrf // Map frontend names to backend params (dg_name params omitted, vrf added)
      );
      return { traceId, result }; // result is expected List[DetailedHop]
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Direct route trace failed', traceId, errorObj: error });
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
       if (state.traces.length < 5) {
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
      const trace = state.traces.find(t => t.id === traceId);
      if (trace) {
        trace[field] = value;
        // Reset status and results when inputs change
        trace.traceStatus = 'idle';
        trace.traceResult = null;
        trace.error = null;

        // Handle DG status updates
        if (field === 'sourceDg' && trace.sourceDgStatus !== 'loading') trace.sourceDgStatus = 'manual';
        if (field === 'destinationDg' && trace.destinationDgStatus !== 'loading') trace.destinationDgStatus = 'manual';
        if (field === 'sourceIp') {
            trace.sourceDg = ''; trace.sourceDgStatus = 'idle';
        }
        if (field === 'destinationIp') {
            trace.destinationDg = ''; trace.destinationDgStatus = 'idle';
        }
      }
    },
    resetDirectTraceState: (state) => {
        state.traces = [createInitialDirectTraceState()];
    }
  },
  extraReducers: (builder) => {
    builder
      // Default Gateway Fetching (identical logic to other slices)
      .addCase(fetchDirectDefaultGateway.pending, (state, action) => {
        const { type, traceId } = action.meta.arg;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          if (type === 'source') trace.sourceDgStatus = 'loading';
          if (type === 'destination') trace.destinationDgStatus = 'loading';
          trace.error = null;
        }
      })
      .addCase(fetchDirectDefaultGateway.fulfilled, (state, action) => {
        const { gateway, type, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          if (type === 'source') { trace.sourceDg = gateway; trace.sourceDgStatus = 'succeeded'; }
          if (type === 'destination') { trace.destinationDg = gateway; trace.destinationDgStatus = 'succeeded'; }
        }
      })
      .addCase(fetchDirectDefaultGateway.rejected, (state, action) => {
        const { message, type, traceId } = action.payload;
        const trace = state.traces.find(t => t.id === traceId);
         if (trace) {
          if (type === 'source') trace.sourceDgStatus = 'failed';
          if (type === 'destination') trace.destinationDgStatus = 'failed';
          trace.error = `DG Fetch Error (${type}): ${message}`;
        }
      })

      // Direct Route Trace Execution
      .addCase(performDirectRouteTrace.pending, (state, action) => {
        const { traceId } = action.meta.arg;
        const trace = state.traces.find(t => t.id === traceId);
        if (trace) {
          trace.traceStatus = 'loading';
          trace.error = null;
          trace.traceResult = null; // Clear previous result
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
          trace.error = message;
          trace.traceResult = null; // Ensure result is null on failure
        }
      });
  },
});

export const { addDirectTraceSection, removeDirectTraceSection, updateDirectTraceInput, resetDirectTraceState } = directRouteSlice.actions;
export default directRouteSlice.reducer;

// ----- End File: src/store/slices/directRouteSlice.js -----
// ----- File: src\pages\RouteTracePage.jsx -----
// No changes needed here based on the new warnings, re-providing corrected version from previous step.
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Divider } from '@mui/material';
import RouteInputForm from '../components/RouteTrace/RouteInputForm';
import RouteVisualizer from '../components/RouteTrace/RouteVisualizer';
import LoadingSpinner from '../components/Common/LoadingSpinner'; // LoadingSpinner import confirmed

// This page handles the *single* combined trace scenario.
// It uses the `routeTrace` slice which manages only one trace state object.
const RouteTracePage = () => {
    // Select the single trace state object directly from the slice
    const trace = useSelector((state) => state.routeTrace.trace);

    // Basic check if trace state exists (it should based on slice initial state)
    if (!trace) {
        // This state should ideally not be reachable if the slice initializes correctly
        return <LoadingSpinner message="Initializing trace state..." />;
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                Trace Network Route (Combined)
            </Typography>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Perform a comprehensive trace including Layer 2 (MAC) paths at source/destination and Layer 3 (IP) hops in between.
            </Typography>

            {/* Use a single Paper container for the form and results */}
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    borderRadius: 2,
                }}
            >
                {/* Input Form for the single trace */}
                <RouteInputForm trace={trace} />

                {/* Divider between form and results, shown only when results are pending/present */}
                {(trace.traceStatus !== 'idle' || trace.error) && (
                     <Divider sx={{ my: 3 }} />
                )}

                {/* Visualizer for the single trace results */}
                <RouteVisualizer trace={trace} />
            </Paper>

            {/* Comparison controls (Add/Remove buttons) are removed as this page handles a single trace */}

        </Box>
    );
};

export default RouteTracePage;
// ----- End File: src\pages\RouteTracePage.jsx -----
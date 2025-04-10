// ----- File: src/pages/RouteTracePage.jsx -----

import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper } from '@mui/material';
// Remove Button, AddIcon, RouteComparisonContainer, RouteTraceSection imports
import RouteInputForm from '../components/RouteTrace/RouteInputForm'; // Import the form
import RouteVisualizer from '../components/RouteTrace/RouteVisualizer'; // Import the visualizer

const RouteTracePage = () => {
    // Select the single trace state object directly
    const trace = useSelector((state) => state.routeTrace.trace); // Access the single trace state

    // No need for handleAddRoute or dispatching add/remove actions anymore

    // Ensure trace exists before rendering (should always exist based on slice initial state)
    if (!trace) {
        return <Typography>Loading trace state...</Typography>; // Or some loading indicator
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Trace Network Route (Combined)
            </Typography>

            {/* Render the single trace section directly */}
            {/* Use Paper for consistent look with other pages */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <RouteInputForm trace={trace} />
                <RouteVisualizer trace={trace} />
            </Paper>

            {/* Remove the "Add Route for Comparison" button and surrounding Box */}

        </Box>
    );
};

export default RouteTracePage;

// ----- End File: src/pages/RouteTracePage.jsx -----
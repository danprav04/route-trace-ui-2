import React from 'react';
import { Paper } from '@mui/material';
import HistoryTraceVisualizer from './HistoryTraceVisualizer'; // Use the universal visualizer

// This component acts as a container for a single historical trace within the comparison view.
// It now receives a processed history entry which includes the trace_type.
const ComparisonItem = ({ trace }) => {
    // 'trace' prop comes from ComparisonPage, which is historical data processed by historySlice
    if (!trace) return null;

    return (
        // Use Paper for consistent styling with other sections
        // Set height to 100% to fill Grid item space if needed for alignment
        <Paper
            elevation={2}
            sx={{
                p: { xs: 1.5, sm: 2 }, // Responsive padding
                mb: 3,
                height: '100%', // Fill height of the grid container
                display: 'flex', // Allow flex column layout
                flexDirection: 'column'
            }}
        >
            {/* The main visualizer for the historical route */}
            {/* Pass the full trace object to the universal visualizer */}
            <HistoryTraceVisualizer route={trace} />
        </Paper>
    );
};

export default ComparisonItem;
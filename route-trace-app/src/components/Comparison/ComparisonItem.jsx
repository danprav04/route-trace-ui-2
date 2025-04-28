// ----- File: src\components\Comparison\ComparisonItem.jsx -----

import React from 'react';
import { Paper } from '@mui/material';
import HistoryTraceVisualizer from './HistoryTraceVisualizer'; // Use the universal visualizer

// This component acts as a container for a single historical trace within the comparison view.
// It now receives a processed history entry which includes the trace_type.
// It also receives the isMinimalView prop to pass down.
const ComparisonItem = ({ trace, isMinimalView }) => {
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
                flexDirection: 'column',
                // Minimal view might have slightly different background or border? Optional.
                // bgcolor: isMinimalView ? 'background.default' : 'background.paper',
            }}
        >
            {/* The main visualizer for the historical route */}
            {/* Pass the full trace object AND the view mode to the universal visualizer */}
            <HistoryTraceVisualizer route={trace} isMinimalView={isMinimalView} />
        </Paper>
    );
};

export default ComparisonItem;

// ----- End File: src\components\Comparison\ComparisonItem.jsx -----
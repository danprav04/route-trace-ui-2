// ----- File: src\components\Comparison\ComparisonItem.jsx -----

// ----- File: src\components\Comparison\ComparisonItem.jsx -----

import React from 'react';
import { Paper, IconButton, Tooltip } from '@mui/material'; // Added IconButton, Tooltip
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'; // Correct icon
import HistoryTraceVisualizer from './HistoryTraceVisualizer'; // Use the universal visualizer

// This component acts as a container for a single historical trace within the comparison view.
// It now receives processed history entry, view modes, reverse handler, and highlighting info.
// It will now contain the reverse button itself.
const ComparisonItem = ({
    trace,
    isMinimalView,
    isReversed,
    onToggleReverse,
    isHighlightingActive, // New: Highlighting state
    highlightedIPs        // New: Set of IPs to highlight
}) => {
    // 'trace' prop comes from ComparisonPage
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
                position: 'relative', // Needed for absolute positioning of the button
                // Minimal view might have slightly different background or border? Optional.
                // bgcolor: isMinimalView ? 'background.default' : 'background.paper',
            }}
        >
            {/* Reverse Toggle Button - Always visible */}
            {onToggleReverse && ( // Only show if handler is provided
                <Tooltip title={isReversed ? "Show Original Direction" : "Visually Reverse Direction"}>
                    <IconButton
                        onClick={() => onToggleReverse(trace.id)} // Call handler with trace ID
                        size="small"
                        aria-label="Reverse display direction"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1, // Ensure it's above other content
                            color: isReversed ? 'warning.main' : 'action.active' // Indicate active reversal
                         }}
                    >
                        <SwapHorizIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
             )}

            {/* The main visualizer for the historical route */}
            {/* Pass the full trace object AND view modes, reverse state, and highlighting info */}
            <HistoryTraceVisualizer
                route={trace}
                isMinimalView={isMinimalView}
                isReversed={isReversed}
                isHighlightingActive={isHighlightingActive} // Pass down
                highlightedIPs={highlightedIPs}             // Pass down
             />
        </Paper>
    );
};

export default ComparisonItem;

// ----- End File: src\components\Comparison\ComparisonItem.jsx -----
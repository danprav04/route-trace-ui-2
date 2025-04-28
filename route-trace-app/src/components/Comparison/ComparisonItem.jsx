// ----- File: src\components\Comparison\ComparisonItem.jsx -----

import React from 'react';
import { Paper, IconButton, Tooltip } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HistoryTraceVisualizer from './HistoryTraceVisualizer';

// Accepts and passes down highlighting info including ipColorMap
const ComparisonItem = ({
    trace,
    isMinimalView,
    isReversed,
    onToggleReverse,
    isHighlightingActive, // Highlighting state
    highlightedIPs,       // Set of IPs
    ipColorMap            // New: IP to Color map
}) => {
    if (!trace) return null;

    return (
        <Paper
            elevation={2}
            sx={{
                p: { xs: 1.5, sm: 2 },
                mb: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {onToggleReverse && (
                <Tooltip title={isReversed ? "Show Original Direction" : "Visually Reverse Direction"}>
                    <IconButton
                        onClick={() => onToggleReverse(trace.id)}
                        size="small"
                        aria-label="Reverse display direction"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            color: isReversed ? 'warning.main' : 'action.active'
                         }}
                    >
                        <SwapHorizIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
             )}

            {/* Pass highlighting info down */}
            <HistoryTraceVisualizer
                route={trace}
                isMinimalView={isMinimalView}
                isReversed={isReversed}
                isHighlightingActive={isHighlightingActive} // Pass down
                highlightedIPs={highlightedIPs}             // Pass down
                ipColorMap={ipColorMap}                     // Pass down
             />
        </Paper>
    );
};

export default ComparisonItem;
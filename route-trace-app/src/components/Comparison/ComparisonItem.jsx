// ----- File: src/components/Comparison/ComparisonItem.jsx -----

import React from 'react';
import { Paper, Box, IconButton, Tooltip, Typography } from '@mui/material';
import HistoryRouteVisualizer from './HistoryRouteVisualizer';
// import CloseIcon from '@mui/icons-material/Close'; // Removing close button for now, handled by selector

// This component acts as a wrapper for HistoryRouteVisualizer
// to fit into the structure expected by RouteComparisonContainer.
// RouteComparisonContainer passes 'trace' and 'canRemove'.
// We adapt the 'route' prop from ComparisonPage to the 'trace' prop name.
const ComparisonItem = ({ trace: route }) => {
    // The 'canRemove' prop from RouteComparisonContainer might not be directly used here.
    // Removal is handled by the ComparisonSelector.

    if (!route) return null;

    return (
        // We use Paper similar to other Section components for consistency
        <Paper elevation={2} sx={{ p: 2, mb: 3, position: 'relative', height: '100%' }}>
            {/* Optional: Add a header specific to the comparison item */}
            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, borderBottom: 1, borderColor: 'divider', pb:1 }}>
                <Typography variant="subtitle1">Trace ID: {route.id}</Typography> */}
                {/* Add remove button here if needed, linking back to ComparisonPage state */}
            {/* </Box> */}

            <HistoryRouteVisualizer route={route} />
        </Paper>
    );
};

export default ComparisonItem;

// ----- End File: src/components/Comparison/ComparisonItem.jsx -----
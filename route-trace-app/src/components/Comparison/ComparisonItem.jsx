// ----- File: src\components\Comparison\ComparisonItem.jsx -----
import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import HistoryRouteVisualizer from './HistoryRouteVisualizer';

// This component acts as a container for a single historical trace within the comparison view.
const ComparisonItem = ({ trace: route }) => {
    // route prop comes from ComparisonPage, which is historical data
    if (!route) return null;

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
            {/* Optional Header: Display basic info, kept minimal */}
            {/* <Box sx={{ mb: 1, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                    Trace ID: {route.id} | {route.user?.username || 'N/A'} | {formatTimestamp(route.timestamp, 'short')}
                </Typography>
            </Box> */}

            {/* The main visualizer for the historical route */}
            <HistoryRouteVisualizer route={route} />
        </Paper>
    );
};

export default ComparisonItem;
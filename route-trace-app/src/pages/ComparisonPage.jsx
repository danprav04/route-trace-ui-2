// ----- File: src\pages\ComparisonPage.jsx -----

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Alert, Paper, Stack, ToggleButton, Tooltip } from '@mui/material'; // Added Stack, ToggleButton, Tooltip
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ViewCompactIcon from '@mui/icons-material/ViewCompact'; // Icon for minimal view
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'; // Icon for detailed view
import ComparisonSelector from '../components/Comparison/ComparisonSelector';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import ComparisonItem from '../components/Comparison/ComparisonItem'; // ComparisonItem now uses universal visualizer
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { fetchAllHistory, resetHistoryError } from '../store/slices/historySlice';

const ComparisonPage = () => {
    const dispatch = useDispatch();
    // Use allHistory which contains processed entries of all types
    const { allHistory, allHistoryStatus, error: historyError } = useSelector((state) => state.history);
    // Store IDs of the routes selected for comparison
    const [selectedRouteIds, setSelectedRouteIds] = useState([]);
    // State to control the minimalist view toggle
    const [isMinimalView, setIsMinimalView] = useState(false); // Default to detailed view

    // Fetch all history if it hasn't been fetched yet
    useEffect(() => {
        if (allHistoryStatus === 'idle' || allHistoryStatus === 'failed') { // Fetch if idle or failed previously
            dispatch(fetchAllHistory());
        }
        // Optional: Reset error on unmount
        // return () => { dispatch(resetHistoryError()); };
    }, [allHistoryStatus, dispatch]);

    // Handler for when the selection in ComparisonSelector changes
    const handleSelectionChange = (selectedIds) => {
        setSelectedRouteIds(selectedIds);
    };

    // Handler for toggling the minimal view
    const handleViewToggle = () => {
        setIsMinimalView(!isMinimalView);
    };

    // Filter the full history data based on the selected IDs
    // This derived state will be passed to the comparison container
    const selectedRoutesData = allHistory.filter(route => selectedRouteIds.includes(route.id));

    // Show loading spinner while fetching history
    if (allHistoryStatus === 'loading') {
        return <LoadingSpinner message="Loading route history..." />;
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                 <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                    Compare Historical Traces
                 </Typography>
                 {/* Toggle Button for Minimal View - Only show if routes are loaded */}
                 {allHistoryStatus === 'succeeded' && (
                    <Tooltip title={isMinimalView ? "Show Full Details" : "Show Minimal View (Hops Only)"}>
                        <ToggleButton
                            value="check"
                            selected={isMinimalView}
                            onChange={handleViewToggle}
                            size="small"
                            aria-label="Toggle minimal view"
                        >
                            {isMinimalView ? <ViewHeadlineIcon /> : <ViewCompactIcon />}
                        </ToggleButton>
                    </Tooltip>
                 )}
             </Stack>


            {/* Display error if history fetching failed */}
            {allHistoryStatus === 'failed' && (
                <ErrorMessage error={historyError} title="Could not load route history" />
            )}

            {/* Render selector and comparison container only if history loaded successfully */}
            {allHistoryStatus === 'succeeded' && (
                <>
                    {/* Component to select routes from the available history */}
                    <ComparisonSelector
                        availableRoutes={allHistory} // Pass all history entries
                        selectedIds={selectedRouteIds}
                        onChange={handleSelectionChange}
                    />

                    {/* Display the comparison container if routes are selected */}
                    {selectedRoutesData.length > 0 ? (
                         <Box sx={{ mt: 3 }}>
                             {/* Container responsible for laying out the comparison items */}
                             <RouteComparisonContainer
                                traces={selectedRoutesData} // Pass the filtered historical data
                                SectionComponent={ComparisonItem} // ComparisonItem renders HistoryTraceVisualizer internally
                                isMinimalView={isMinimalView} // Pass the view mode state
                             />
                         </Box>
                    ) : (
                        // Show an informational message if no routes are selected yet
                         <Alert
                            severity="info"
                            icon={<CompareArrowsIcon />}
                            variant="outlined" // Use outlined for less emphasis
                            sx={{ mt: 3 }}
                         >
                            Select two or more routes (Combined, Direct, or MAC) from the list above to compare them side-by-side. Use the <ViewCompactIcon fontSize='small' sx={{verticalAlign: 'bottom', mx: 0.5}}/> button to toggle a minimal view.
                         </Alert>
                    )}
                </>
            )}
        </Box>
    );
};

export default ComparisonPage;

// ----- End File: src\pages\ComparisonPage.jsx -----
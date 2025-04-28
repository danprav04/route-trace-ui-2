import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Alert, Paper } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
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

    // Fetch all history if it hasn't been fetched yet
    useEffect(() => {
        if (allHistoryStatus === 'idle') {
            dispatch(fetchAllHistory());
        }
        // Optional: Reset error on unmount
        // return () => { dispatch(resetHistoryError()); };
    }, [allHistoryStatus, dispatch]);

    // Handler for when the selection in ComparisonSelector changes
    const handleSelectionChange = (selectedIds) => {
        setSelectedRouteIds(selectedIds);
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
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                Compare Historical Traces
            </Typography>

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
                            Select two or more routes (Combined, Direct, or MAC) from the list above to compare them side-by-side.
                         </Alert>
                    )}
                </>
            )}
        </Box>
    );
};

export default ComparisonPage;
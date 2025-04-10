// ----- File: src/pages/ComparisonPage.jsx -----

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Alert } from '@mui/material';
import ComparisonSelector from '../components/Comparison/ComparisonSelector';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import ComparisonItem from '../components/Comparison/ComparisonItem';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { fetchAllHistory, resetHistoryError } from '../store/slices/historySlice';

const ComparisonPage = () => {
    const dispatch = useDispatch();
    const { allHistory, allHistoryStatus, error: historyError } = useSelector((state) => state.history);
    const [selectedRouteIds, setSelectedRouteIds] = useState([]);

    // Fetch all history if not already loaded
    useEffect(() => {
        if (allHistoryStatus === 'idle') {
            dispatch(fetchAllHistory());
        }
        // Clear errors on unmount
        return () => {
            dispatch(resetHistoryError());
        };
    }, [allHistoryStatus, dispatch]);

    const handleSelectionChange = (selectedIds) => {
        setSelectedRouteIds(selectedIds);
    };

    // Filter the full history data based on selected IDs
    const selectedRoutesData = allHistory.filter(route => selectedRouteIds.includes(route.id));

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Compare Historical Traces
            </Typography>

            {allHistoryStatus === 'loading' && <LoadingSpinner />}
            {allHistoryStatus === 'failed' && <ErrorMessage error={historyError} title="Could not load route history" />}

            {allHistoryStatus === 'succeeded' && (
                <Box>
                    <ComparisonSelector
                        availableRoutes={allHistory}
                        selectedIds={selectedRouteIds}
                        onChange={handleSelectionChange}
                    />

                    {selectedRoutesData.length > 0 ? (
                         // Use RouteComparisonContainer, passing the selected *historical* routes
                         // and the ComparisonItem component to render each one.
                        <Box sx={{mt: 3}}>
                             <RouteComparisonContainer
                                traces={selectedRoutesData} // Pass historical data
                                SectionComponent={ComparisonItem} // Use the specific component for historical items
                             />
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{ mt: 3 }}>
                            Select two or more routes from the history list above to compare them side-by-side.
                        </Alert>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default ComparisonPage;

// ----- End File: src/pages/ComparisonPage.jsx -----
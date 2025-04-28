// ----- File: src\pages\AllRoutesPage.jsx -----

// ----- File: src\pages\AllRoutesPage.jsx -----
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Box } from '@mui/material';
import HistoryList from '../components/History/HistoryList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { fetchAllHistory, resetHistoryError } from '../store/slices/historySlice';

const AllRoutesPage = () => {
  const dispatch = useDispatch();
  // Select relevant state from history slice
  const { allHistory, allHistoryStatus, error } = useSelector((state) => state.history);

  // Fetch data when component mounts UNLESS it's already loading.
  // This ensures data is refreshed on subsequent visits.
  useEffect(() => {
    if (allHistoryStatus !== 'loading') {
      dispatch(fetchAllHistory());
    }
    // Optional: Clear errors when component unmounts
    // return () => { dispatch(resetHistoryError()); };
  }, [dispatch]); // Depend only on dispatch to re-run fetch on every mount

  // Show loading spinner only when status is explicitly 'loading'
  const isLoading = allHistoryStatus === 'loading';

  return (
    <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
            All User Routes History
        </Typography>

        {/* Show loading spinner */}
        {isLoading && <LoadingSpinner message="Loading all routes history..." />}

        {/* Display error if fetching failed */}
        {allHistoryStatus === 'failed' && error && (
            <ErrorMessage
                error={error}
                title="Could Not Load History"
             />
        )}

        {/* Display the history list if loading succeeded or if data is already present (even if idle/failed after a previous fetch) */}
        {/* HistoryList component handles the case of empty routes internally */}
        {!isLoading && (
            <HistoryList
                routes={allHistory}
                title="All Recorded Traces" // More specific title
            />
        )}
    </Box>
  );
};

export default AllRoutesPage;
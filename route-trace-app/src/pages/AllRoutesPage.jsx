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

  // Fetch data when component mounts if status is idle
  useEffect(() => {
    if (allHistoryStatus === 'idle') {
      dispatch(fetchAllHistory());
    }
     // Clear errors when component unmounts or dependencies change
     return () => {
        // Only reset if the status indicates a completed fetch (or error)
        // to avoid resetting during loading or initial idle state.
        // if (allHistoryStatus === 'succeeded' || allHistoryStatus === 'failed') {
        //     dispatch(resetHistoryError()); // Consider if resetting error on unmount is desired UX
        // }
    }
  }, [allHistoryStatus, dispatch]);

  // Handle loading state
  if (allHistoryStatus === 'loading') {
      return <LoadingSpinner message="Loading all routes history..." />;
  }

  return (
    <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
            All User Routes History
        </Typography>

        {/* Display error if fetching failed */}
        {allHistoryStatus === 'failed' && (
            <ErrorMessage
                error={error}
                title="Could Not Load History"
             />
        )}

        {/* Display the history list if loading succeeded */}
        {/* HistoryList component handles the case of empty routes internally */}
        {allHistoryStatus === 'succeeded' && (
            <HistoryList
                routes={allHistory}
                title="All Recorded Traces" // More specific title
            />
        )}
    </Box>
  );
};

export default AllRoutesPage;
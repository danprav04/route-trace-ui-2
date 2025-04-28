// ----- File: src\pages\HistoryPage.jsx -----

// ----- File: src\pages\HistoryPage.jsx -----
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Box } from '@mui/material';
import HistoryList from '../components/History/HistoryList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { fetchUserHistory, resetHistoryError } from '../store/slices/historySlice';
import { useAuth } from '../hooks/useAuth'; // Import useAuth to get username

const HistoryPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth(); // Get current user info
  // Select relevant state from history slice
  const { userHistory, userHistoryStatus, error } = useSelector((state) => state.history);

  // Fetch data when component mounts UNLESS it's already loading.
  // This ensures data is refreshed on subsequent visits.
  useEffect(() => {
    if (userHistoryStatus !== 'loading') {
      dispatch(fetchUserHistory());
    }
     // Optional: Clear errors when component unmounts
    // return () => { dispatch(resetHistoryError()); };
  }, [dispatch]); // Depend only on dispatch to re-run fetch on every mount

  // Show loading spinner only when status is explicitly 'loading'
  const isLoading = userHistoryStatus === 'loading';

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
         My Trace History
      </Typography>

      {/* Show loading spinner */}
      {isLoading && <LoadingSpinner message="Loading your trace history..." />}

      {/* Display error if fetching failed */}
      {userHistoryStatus === 'failed' && error && (
            <ErrorMessage
                error={error}
                title="Could Not Load Your History"
            />
       )}

      {/* Display the history list if loading succeeded or if data is already present */}
      {!isLoading && (
        <HistoryList
            routes={userHistory}
            title={user ? `${user.username}'s Traces` : "My Recorded Traces"} // Personalized title
        />
      )}
    </Box>
  );
};

export default HistoryPage;
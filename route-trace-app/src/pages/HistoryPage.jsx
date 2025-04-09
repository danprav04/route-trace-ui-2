import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Box } from '@mui/material';
import HistoryList from '../components/History/HistoryList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { fetchUserHistory, resetHistoryError } from '../store/slices/historySlice';

const HistoryPage = () => {
  const dispatch = useDispatch();
  const { userHistory, userHistoryStatus, error } = useSelector((state) => state.history);

  useEffect(() => {
    // Fetch history only if it's not already loaded or loading
    if (userHistoryStatus === 'idle') {
      dispatch(fetchUserHistory());
    }
    // Clear errors when component unmounts
    return () => {
        dispatch(resetHistoryError());
    }
  }, [userHistoryStatus, dispatch]);

  return (
    <Box>
      {userHistoryStatus === 'loading' && <LoadingSpinner />}
      {userHistoryStatus === 'failed' && <ErrorMessage error={error} title="Could not load history"/>}
      {userHistoryStatus === 'succeeded' && (
        <HistoryList routes={userHistory} title="My Route History" />
      )}
    </Box>
  );
};

export default HistoryPage;
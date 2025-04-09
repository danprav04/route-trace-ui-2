import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Box } from '@mui/material';
import HistoryList from '../components/History/HistoryList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { fetchAllHistory, resetHistoryError } from '../store/slices/historySlice';

const AllRoutesPage = () => {
  const dispatch = useDispatch();
  const { allHistory, allHistoryStatus, error } = useSelector((state) => state.history);

  useEffect(() => {
    if (allHistoryStatus === 'idle') {
      dispatch(fetchAllHistory());
    }
     // Clear errors when component unmounts
     return () => {
        dispatch(resetHistoryError());
    }
  }, [allHistoryStatus, dispatch]);

  return (
    <Box>
      {allHistoryStatus === 'loading' && <LoadingSpinner />}
      {allHistoryStatus === 'failed' && <ErrorMessage error={error} title="Could not load all routes"/>}
      {allHistoryStatus === 'succeeded' && (
         // Pass the user object if backend includes it: route.user.username
        <HistoryList routes={allHistory} title="All User Routes" />
      )}
    </Box>
  );
};

export default AllRoutesPage;
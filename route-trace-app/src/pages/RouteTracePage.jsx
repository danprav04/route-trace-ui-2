import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import { addTraceSection } from '../store/slices/routeTraceSlice';

const RouteTracePage = () => {
    const dispatch = useDispatch();
    const traces = useSelector((state) => state.routeTrace.traces);

    const handleAddRoute = () => {
        dispatch(addTraceSection());
    }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Trace Network Route
      </Typography>
      <RouteComparisonContainer />
       <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddRoute}
                disabled={traces.length >= 5} // Optional limit
            >
                Add Route for Comparison
            </Button>
       </Box>
    </Box>
  );
};

export default RouteTracePage;
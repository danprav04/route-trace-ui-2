// ----- File: src/pages/RouteTracePage.jsx -----

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import RouteTraceSection from '../components/RouteTrace/RouteTraceSection'; // Import the specific section for this page
import { addTraceSection } from '../store/slices/routeTraceSlice'; // Use the correct slice action for this page

const RouteTracePage = () => {
    const dispatch = useDispatch();
    // Select state from the original routeTrace slice
    const traces = useSelector((state) => state.routeTrace.traces);

    const handleAddRoute = () => {
        dispatch(addTraceSection()); // Dispatch action from routeTraceSlice
    }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Trace Network Route (Combined) {/* Added (Combined) for clarity */}
      </Typography>

      {/* Pass the correct SectionComponent prop */}
      <RouteComparisonContainer traces={traces} SectionComponent={RouteTraceSection} />

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

// ----- End File: src/pages/RouteTracePage.jsx -----
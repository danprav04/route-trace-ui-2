// ----- File: src/pages/DirectRouteTracePage.jsx -----

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import DirectRouteTraceSection from '../components/RouteTrace/DirectRouteTraceSection'; // Import the correct section
import { addDirectTraceSection } from '../store/slices/directRouteSlice'; // Use correct slice action

const DirectRouteTracePage = () => {
    const dispatch = useDispatch();
    // Select state from the directRouteTrace slice
    const traces = useSelector((state) => state.directRoute.traces);

    const handleAddRoute = () => {
        dispatch(addDirectTraceSection()); // Dispatch action from directRouteSlice
    }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Trace Direct Network Route
      </Typography>

      {/* Pass the specific SectionComponent */}
      <RouteComparisonContainer traces={traces} SectionComponent={DirectRouteTraceSection} />

       <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddRoute}
                disabled={traces.length >= 5} // Optional limit
            >
                Add Trace for Comparison
            </Button>
       </Box>
    </Box>
  );
};

export default DirectRouteTracePage;

// ----- End File: src/pages/DirectRouteTracePage.jsx -----
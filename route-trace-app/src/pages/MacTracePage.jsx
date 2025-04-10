// ----- File: src/pages/MacTracePage.jsx -----

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import MacTraceSection from '../components/RouteTrace/MacTraceSection'; // Import the correct section
import { addMacTraceSection } from '../store/slices/macTraceSlice'; // Use correct slice action

const MacTracePage = () => {
    const dispatch = useDispatch();
    // Select state from the macTrace slice
    const traces = useSelector((state) => state.macTrace.traces);

    const handleAddRoute = () => {
        dispatch(addMacTraceSection()); // Dispatch action from macTraceSlice
    }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Trace MAC Path (Endpoint ↔ Gateway)
      </Typography>

      {/* Pass the specific SectionComponent */}
      <RouteComparisonContainer traces={traces} SectionComponent={MacTraceSection} />

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

export default MacTracePage;

// ----- End File: src/pages/MacTracePage.jsx -----
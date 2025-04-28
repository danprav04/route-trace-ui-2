import React from 'react';
import { useSelector } from 'react-redux'; // Removed useDispatch
import { Box, Typography } from '@mui/material'; // Removed Button, Tooltip, AddIcon
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import MacTraceSection from '../components/RouteTrace/MacTraceSection';
// Removed addMacTraceSection import

// Removed MAX_COMPARISON_SECTIONS constant

const MacTracePage = () => {
    // Removed dispatch
    // Select the array of trace states from the macTrace slice
    const traces = useSelector((state) => state.macTrace.traces);

    // Removed canAddMore and handleAddRoute

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Trace MAC Path (Endpoint ↔ Gateway)
      </Typography>
       <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Perform a Layer 2 MAC address trace between an endpoint IP and its default gateway.
      </Typography>

      {/* Container to display one or more trace sections side-by-side */}
       {/* Pass canRemove={false} explicitly if you never want removal, */}
       {/* or adjust based on whether the slice supports removal */}
      <RouteComparisonContainer
            traces={traces}
            SectionComponent={MacTraceSection} // Pass the specific section component
      />

       {/* Removed the "Add Trace for Comparison" button and surrounding Box */}
    </Box>
  );
};

export default MacTracePage;
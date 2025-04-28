import React from 'react';
import { useSelector } from 'react-redux'; // Removed useDispatch
import { Box, Typography } from '@mui/material'; // Removed Button, Tooltip, AddIcon
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import DirectRouteTraceSection from '../components/RouteTrace/DirectRouteTraceSection';
// Removed addDirectTraceSection import

// Removed MAX_COMPARISON_SECTIONS constant

const DirectRouteTracePage = () => {
    // Removed dispatch
    // Select the array of trace states from the directRoute slice
    const traces = useSelector((state) => state.directRoute.traces);

    // Removed canAddMore and handleAddRoute

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Trace Direct Network Route
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Perform a direct route trace between two specified IP addresses using their respective default gateways.
      </Typography>

      {/* Container to display one or more trace sections side-by-side */}
      {/* Pass canRemove={false} explicitly if you never want removal, */}
      {/* or adjust based on whether the slice supports removal (currently doesn't cleanly) */}
      <RouteComparisonContainer
            traces={traces}
            SectionComponent={DirectRouteTraceSection} // Pass the specific section component
        />

       {/* Removed the "Add Trace for Comparison" button and surrounding Box */}
    </Box>
  );
};

export default DirectRouteTracePage;
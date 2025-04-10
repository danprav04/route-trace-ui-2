// ----- File: src/components/RouteTrace/RouteComparisonContainer.jsx -----

import React from 'react';
import { Box, Grid } from '@mui/material';

// Now accepts traces and the specific Section Component to render as props
const RouteComparisonContainer = ({ traces = [], SectionComponent }) => {
  const canRemove = traces.length > 1;

  // Determine grid sizing based on number of traces
  let mdSize = 12;
  if (traces.length === 2) mdSize = 6;
  if (traces.length >= 3) mdSize = 4; // Max 3 side-by-side on medium screens

  if (!SectionComponent) {
    console.error("RouteComparisonContainer requires a SectionComponent prop.");
    return <Box sx={{ color: 'error.main' }}>Error: SectionComponent not provided.</Box>;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {traces.map((trace) => (
          <Grid item xs={12} md={mdSize} key={trace.id}>
             {/* Render the passed-in SectionComponent */}
             <SectionComponent trace={trace} canRemove={canRemove} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RouteComparisonContainer;

// ----- End File: src/components/RouteTrace/RouteComparisonContainer.jsx -----
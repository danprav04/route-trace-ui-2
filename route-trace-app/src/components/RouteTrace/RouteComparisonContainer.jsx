import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid } from '@mui/material';
import RouteTraceSection from './RouteTraceSection';

const RouteComparisonContainer = () => {
  const traces = useSelector((state) => state.routeTrace.traces);
  const canRemove = traces.length > 1;

  // Determine grid sizing based on number of traces
  let mdSize = 12;
  if (traces.length === 2) mdSize = 6;
  if (traces.length >= 3) mdSize = 4; // Max 3 side-by-side on medium screens

  return (
    <Box>
      <Grid container spacing={3}>
        {traces.map((trace) => (
          <Grid item xs={12} md={mdSize} key={trace.id}>
             <RouteTraceSection trace={trace} canRemove={canRemove} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RouteComparisonContainer;
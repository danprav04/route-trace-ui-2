// ----- File: src/components/RouteTrace/RouteVisualizer.jsx -----

import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay';
import MacTraceDisplay from './MacTraceDisplay';

const RouteVisualizer = ({ trace }) => {
  const {
    sourceIp, destinationIp, sourceDg, destinationDg,
    mainRouteTrace, sourceMacTrace, destinationMacTrace,
    traceStatus, sourceDgStatus, destinationDgStatus, error
  } = trace;

  if (traceStatus === 'loading') {
    return <LoadingSpinner />;
  }

  // Only show main trace error here, DG errors are shown in the input form
  const mainTraceError = error && (traceStatus === 'failed' || (traceStatus === 'partial_success' && !mainRouteTrace));

  return (
    <Paper elevation={0} sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom align="center">Trace Results</Typography>

      {/* Display overall error only if the main trace failed */}
      {mainTraceError && <ErrorMessage error={error} title="Main Trace Problem" />}


      {(traceStatus === 'succeeded' || traceStatus === 'partial_success' || traceStatus === 'failed') && (
        <Box>
          {/* 1. Source IP Box */}
           <Paper elevation={2} sx={{ p: 1.5, mb: 1, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="overline">Source</Typography>
              <Typography variant="body1">{sourceIp}</Typography>
          </Paper>

          {/* 2. Source MAC Trace */}
          <MacTraceDisplay
            label={`${sourceIp} <-> ${sourceDg}`}
            hops={sourceMacTrace} // Pass the array of hops
            isLoading={traceStatus === 'loading'}
            // Pass specific error if source MAC trace failed during partial success, otherwise let MacTraceDisplay show the generic error if overall status is 'failed'
            error={(traceStatus === 'partial_success' || traceStatus === 'failed') && !sourceMacTrace ? (error || "Failed to retrieve source MAC trace") : null}
           />

           {/* 3. Source DG Box */}
           <Paper elevation={2} sx={{ p: 1.5, my: 1, textAlign: 'center' }}>
              <Typography variant="overline">Source DG</Typography>
              <Typography variant="body1">{sourceDg}</Typography>
           </Paper>


          {/* 4. Main Route Hops */}
          {mainRouteTrace && mainRouteTrace.length > 0 ? (
            <Stack
              direction="row"
              spacing={0} // Let HopDisplay handle spacing with icons
              alignItems="flex-start" // Align tops of papers
              sx={{
                overflowX: 'auto', // Enable horizontal scrolling for many hops
                py: 2,
                px: 1, // Padding for scroll container
                borderTop: '1px dashed',
                borderBottom: '1px dashed',
                borderColor: 'divider',
                my: 2,
              }}
            >
              {mainRouteTrace.map((hop, index) => (
                <HopDisplay
                  key={hop.hop || index}
                  hopData={hop}
                  isFirst={index === 0}
                  isLast={index === mainRouteTrace.length - 1}
                />
              ))}
            </Stack>
          ) : (
             traceStatus !== 'idle' && traceStatus !== 'loading' && !mainTraceError && ( // Show message only if main trace didn't fail outright
                <Typography align="center" color="text.secondary" sx={{ my: 3 }}>
                    {mainRouteTrace === null ? 'Main route trace did not run or failed.' : 'No hops returned for main route.'}
                </Typography>
             )
          )}

           {/* 5. Destination DG Box */}
           <Paper elevation={2} sx={{ p: 1.5, my: 1, textAlign: 'center' }}>
              <Typography variant="overline">Destination DG</Typography>
              <Typography variant="body1">{destinationDg}</Typography>
           </Paper>

          {/* 6. Destination MAC Trace */}
          <MacTraceDisplay
            label={`${destinationDg} <-> ${destinationIp}`}
            hops={destinationMacTrace} // Pass the array of hops
            isLoading={traceStatus === 'loading'}
            error={(traceStatus === 'partial_success' || traceStatus === 'failed') && !destinationMacTrace ? (error || "Failed to retrieve destination MAC trace") : null}
           />

            {/* 7. Destination IP Box */}
           <Paper elevation={2} sx={{ p: 1.5, mt: 1, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography variant="overline">Destination</Typography>
              <Typography variant="body1">{destinationIp}</Typography>
           </Paper>

        </Box>
      )}
      {traceStatus === 'idle' && !error && ( <Typography align="center" color="text.secondary">Enter details and click 'Trace Route' to see results.</Typography>
      )}
    </Paper>
  );
};

export default RouteVisualizer;

// ----- End File: src/components/RouteTrace/RouteVisualizer.jsx -----
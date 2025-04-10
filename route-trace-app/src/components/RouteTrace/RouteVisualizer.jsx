// src/components/RouteTrace/RouteVisualizer.jsx
// Ensure main route trace uses HopDisplay

import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay'; // Use the updated HopDisplay
import MacTraceDisplay from './MacTraceDisplay'; // Use the updated MacTraceDisplay

const RouteVisualizer = ({ trace }) => {
  const {
    sourceIp, destinationIp, sourceDg, destinationDg,
    mainRouteTrace, // Expected to be List[DetailedHop] or null
    sourceMacTrace, // Expected to be List[DetailedHop] or null
    destinationMacTrace, // Expected to be List[DetailedHop] or null
    traceStatus,
    error // Combined error string or specific error object
  } = trace;

  if (traceStatus === 'loading') {
    return <LoadingSpinner />;
  }

  // Show specific error related to the main trace failing or partial failures.
  // DG errors are handled in the input form.
  const displayError = error && (traceStatus === 'failed' || traceStatus === 'partial_success');

  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 1, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom align="center">Trace Results</Typography>

      {displayError && <ErrorMessage error={error} title="Trace Problem" />}

      {/* Display results only if trace has run (succeeded, failed, or partial) */}
      {(traceStatus === 'succeeded' || traceStatus === 'partial_success' || traceStatus === 'failed') && (
        <Box>
          {/* 1. Source IP Box */}
           <Paper elevation={1} sx={{ p: 1, mb: 1, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="overline" sx={{lineHeight: 1.2}}>Source</Typography>
              <Typography variant="body1" sx={{wordBreak: 'break-all'}}>{sourceIp}</Typography>
          </Paper>

          {/* 2. Source MAC Trace */}
          <MacTraceDisplay
            label={`${sourceIp || 'Src'} ↔ ${sourceDg || 'DG'}`}
            hops={sourceMacTrace} // Pass the array of DetailedHop objects
            isLoading={false} // Loading state handled globally above
            // Error is shown globally or if specifically only this part failed in partial success
            error={traceStatus === 'partial_success' && !sourceMacTrace ? "Failed to retrieve source MAC trace" : null}
           />

           {/* 3. Source DG Box */}
           <Paper elevation={1} sx={{ p: 1, my: 1, textAlign: 'center' }}>
              <Typography variant="overline" sx={{lineHeight: 1.2}}>Source DG</Typography>
              <Typography variant="body1" sx={{wordBreak: 'break-all'}}>{sourceDg}</Typography>
           </Paper>


          {/* 4. Main Route Hops */}
          {mainRouteTrace && mainRouteTrace.length > 0 ? (
            <Stack
              direction="row"
              spacing={0} // Handled by HopDisplay
              alignItems="center" // Vertically align items
              sx={{
                overflowX: 'auto', // Enable horizontal scrolling
                py: 2,
                px: 1, // Padding for scroll container
                borderTop: '2px dashed',
                borderBottom: '2px dashed',
                borderColor: 'divider',
                my: 2,
                minHeight: '100px', // Ensure some height
              }}
            >
              {mainRouteTrace.map((hop, index) => (
                <HopDisplay
                  key={`${hop.device_id || hop.ip}-${hop.hop}-${index}`} // More robust key
                  hopData={hop} // Pass the full detailed hop object
                  isFirst={index === 0}
                  isLast={index === mainRouteTrace.length - 1}
                />
              ))}
            </Stack>
          ) : (
             // Show message only if trace ran but returned no hops, and wasn't a total failure
             traceStatus !== 'idle' && traceStatus !== 'loading' && !displayError && (
                <Typography align="center" color="text.secondary" sx={{ my: 3 }}>
                    {mainRouteTrace === null ? 'Main route trace did not run or failed.' : 'No hops returned for main route.'}
                </Typography>
             )
          )}

           {/* 5. Destination DG Box */}
           <Paper elevation={1} sx={{ p: 1, my: 1, textAlign: 'center' }}>
              <Typography variant="overline" sx={{lineHeight: 1.2}}>Destination DG</Typography>
              <Typography variant="body1" sx={{wordBreak: 'break-all'}}>{destinationDg}</Typography>
           </Paper>

          {/* 6. Destination MAC Trace */}
          <MacTraceDisplay
            label={`${destinationDg || 'DG'} ↔ ${destinationIp || 'Dst'}`}
            hops={destinationMacTrace} // Pass the array of DetailedHop objects
            isLoading={false}
            error={traceStatus === 'partial_success' && !destinationMacTrace ? "Failed to retrieve destination MAC trace" : null}
           />

            {/* 7. Destination IP Box */}
           <Paper elevation={1} sx={{ p: 1, mt: 1, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography variant="overline" sx={{lineHeight: 1.2}}>Destination</Typography>
              <Typography variant="body1" sx={{wordBreak: 'break-all'}}>{destinationIp}</Typography>
           </Paper>

        </Box>
      )}

      {/* Initial state message */}
      {traceStatus === 'idle' && !error && (
        <Typography align="center" color="text.secondary">Enter details and click 'Trace Route' to see results.</Typography>
      )}
    </Paper>
  );
};

export default RouteVisualizer;
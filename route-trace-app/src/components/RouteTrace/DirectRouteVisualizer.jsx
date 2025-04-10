// ----- File: src/components/RouteTrace/DirectRouteVisualizer.jsx -----

import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay'; // Reuse HopDisplay

const DirectRouteVisualizer = ({ trace }) => {
  const {
    sourceIp, destinationIp, sourceDg, destinationDg, vrf,
    traceResult, // This will hold the List[DetailedHop] from get_route_trace
    traceStatus,
    error
  } = trace;

  if (traceStatus === 'loading') {
    return <LoadingSpinner />;
  }

  const displayError = error && traceStatus === 'failed';

  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 1, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom align="center">Direct Route Trace Results</Typography>
       {vrf && <Typography variant="caption" display="block" align="center" color="text.secondary" gutterBottom>VRF Context: {vrf}</Typography>}


      {displayError && <ErrorMessage error={error} title="Direct Route Trace Error" />}

      {/* Display results only if trace has run */}
      {(traceStatus === 'succeeded' || traceStatus === 'failed') && !displayError && (
        <Box>
          {/* Simple Header: Source IP/DG -> Dest IP/DG */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Paper elevation={1} sx={{ p: 1, textAlign: 'center', flexGrow: 1 }}>
                  <Typography variant="overline" sx={{lineHeight: 1.2}}>Source</Typography>
                  <Typography variant="body2" sx={{wordBreak: 'break-all'}}>{sourceIp}</Typography>
                  <Typography variant="caption" sx={{wordBreak: 'break-all'}}>DG: {sourceDg}</Typography>
              </Paper>
              <Typography variant="h5">→</Typography>
              <Paper elevation={1} sx={{ p: 1, textAlign: 'center', flexGrow: 1 }}>
                  <Typography variant="overline" sx={{lineHeight: 1.2}}>Destination</Typography>
                  <Typography variant="body2" sx={{wordBreak: 'break-all'}}>{destinationIp}</Typography>
                  <Typography variant="caption" sx={{wordBreak: 'break-all'}}>DG: {destinationDg}</Typography>
              </Paper>
          </Box>

          {/* Display Hops */}
          {traceResult && traceResult.length > 0 ? (
            <Stack
              direction="row"
              spacing={0} // Handled by HopDisplay
              alignItems="center"
              sx={{
                overflowX: 'auto',
                py: 2,
                px: 1,
                borderTop: '1px dashed',
                borderBottom: '1px dashed',
                borderColor: 'divider',
                my: 2,
                minHeight: '100px',
              }}
            >
              {traceResult.map((hop, index) => (
                <HopDisplay
                  key={`${hop.device_id || hop.ip}-${hop.hop}-${index}`}
                  hopData={hop}
                  isFirst={index === 0}
                  isLast={index === traceResult.length - 1}
                />
              ))}
            </Stack>
          ) : (
             traceStatus === 'succeeded' && (!traceResult || traceResult.length === 0) && (
                <Typography align="center" color="text.secondary" sx={{ my: 3 }}>
                    No route trace hops returned between the specified points.
                </Typography>
             )
          )}
        </Box>
      )}

      {/* Initial state message */}
      {traceStatus === 'idle' && !error && (
        <Typography align="center" color="text.secondary">Enter details and click 'Trace Direct Route' to see results.</Typography>
      )}
    </Paper>
  );
};

export default DirectRouteVisualizer;

// ----- End File: src/components/RouteTrace/DirectRouteVisualizer.jsx -----
// src/components/RouteTrace/RouteVisualizer.jsx

import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay';
import MacTraceDisplay from './MacTraceDisplay';

const RouteVisualizer = ({ trace }) => {
  const {
    sourceIp, destinationIp, sourceDg, destinationDg,
    mainRouteTrace,
    sourceMacTrace,
    destinationMacTrace,
    traceStatus,
    error
  } = trace;

  if (traceStatus === 'loading') {
    return <LoadingSpinner />;
  }

  const displayError = error && (traceStatus === 'failed' || traceStatus === 'partial_success');

  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 1, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom align="center">Trace Results</Typography>

      {displayError && <ErrorMessage error={error} title="Trace Problem" />}

      {(traceStatus === 'succeeded' || traceStatus === 'partial_success' || traceStatus === 'failed') && (
        <Box>
          {/* 1. Source IP Box */}
           <Paper elevation={1} sx={{ p: 1, mb: 1, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="overline" sx={{lineHeight: 1.2}}>Source</Typography>
              <Typography variant="body1" sx={{wordBreak: 'break-all'}}>{sourceIp}</Typography>
          </Paper>

          {/* 2. Source MAC Trace (already updated internally) */}
          <MacTraceDisplay
            label={`${sourceIp || 'Src'} ↔ ${sourceDg || 'DG'}`}
            hops={sourceMacTrace}
            isLoading={false}
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
              spacing={0}
              alignItems="center"
              sx={{
                overflowX: 'auto',
                minWidth: 0,
                maxWidth: '70vw', // <<<--- ADDED THIS LINE
                py: 2,
                px: 1,
                borderTop: '2px dashed',
                borderBottom: '2px dashed',
                borderColor: 'divider',
                my: 2,
                minHeight: '100px',
                // Optional: Center the stack if content is narrower than maxWidth
                // marginX: 'auto',
              }}
            >
              {mainRouteTrace.map((hop, index) => (
                <HopDisplay
                  key={`${hop.device_id || hop.ip}-${hop.hop}-${index}`}
                  hopData={hop}
                  isFirst={index === 0}
                  isLast={index === mainRouteTrace.length - 1}
                />
              ))}
            </Stack>
          ) : (
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

          {/* 6. Destination MAC Trace (already updated internally) */}
          <MacTraceDisplay
            label={`${destinationDg || 'DG'} ↔ ${destinationIp || 'Dst'}`}
            hops={destinationMacTrace}
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

// ----- End File: src/components/RouteTrace/RouteVisualizer.jsx -----
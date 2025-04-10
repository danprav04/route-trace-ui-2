// ----- File: src/components/RouteTrace/MacTraceVisualizer.jsx -----

import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay'; // Reuse HopDisplay

const MacTraceVisualizer = ({ trace }) => {
  const {
    ip, // Source IP
    dg, // Destination Gateway
    traceResult, // Renamed from macTrace in slice to avoid confusion
    traceStatus,
    error
  } = trace;

  if (traceStatus === 'loading') {
    return <LoadingSpinner />;
  }

  const displayError = error && traceStatus === 'failed';

  return (
    <Paper elevation={0} sx={{ mt: 3, p: { xs: 1, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom align="center">MAC Trace Results</Typography>

      {displayError && <ErrorMessage error={error} title="MAC Trace Error" />}

      {/* Display results only if trace has run */}
      {(traceStatus === 'succeeded' || traceStatus === 'failed') && !displayError && (
        <Box>
            {/* Simplified Display: IP <-> DG */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                 <Paper elevation={1} sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText', minWidth: '120px' }}>
                    <Typography variant="overline" sx={{lineHeight: 1.2}}>Endpoint</Typography>
                    <Typography variant="body1" sx={{wordBreak: 'break-all'}}>{ip || 'N/A'}</Typography>
                </Paper>
                <Typography variant="h5">↔</Typography>
                 <Paper elevation={1} sx={{ p: 1, textAlign: 'center', minWidth: '120px' }}>
                    <Typography variant="overline" sx={{lineHeight: 1.2}}>Gateway</Typography>
                    <Typography variant="body1" sx={{wordBreak: 'break-all'}}>{dg || 'N/A'}</Typography>
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
                    No MAC trace hops returned.
                </Typography>
             )
          )}
        </Box>
      )}

      {/* Initial state message */}
      {traceStatus === 'idle' && !error && (
        <Typography align="center" color="text.secondary">Enter details and click 'Trace MAC Path' to see results.</Typography>
      )}
    </Paper>
  );
};

export default MacTraceVisualizer;

// ----- End File: src/components/RouteTrace/MacTraceVisualizer.jsx -----
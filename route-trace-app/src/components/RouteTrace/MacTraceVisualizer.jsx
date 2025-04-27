// ----- File: src\components\RouteTrace\MacTraceVisualizer.jsx -----
import React from 'react';
import { Box, Typography, Stack, Paper, Divider } from '@mui/material';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay'; // Reuse HopDisplay

const MacTraceVisualizer = ({ trace }) => {
  const {
    ip, // Endpoint IP
    dg, // Default Gateway
    traceResult, // Array of DetailedHop objects
    traceStatus,
    error
  } = trace;

  const isLoading = traceStatus === 'loading';
  // Separate DG fetch errors from trace errors
  const isDgError = error && trace.dgStatus === 'failed';
  const isTraceError = error && traceStatus === 'failed' && !isDgError;
  const displayError = isTraceError; // Only display trace error here

  const hasResults = traceResult && traceResult.length > 0;

  // Don't render anything in idle state unless there's an error already
   if (traceStatus === 'idle' && !error) {
      return null; // Input form shows initial state message
   }

  return (
     <Box sx={{ mt: traceStatus !== 'idle' ? 2 : 0 }}>
      <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2 }}>
          MAC Trace Results
      </Typography>

      {isLoading && <LoadingSpinner message="Performing MAC trace..." />}

      {/* Display specific trace error */}
      {displayError && <ErrorMessage error={error} title="MAC Trace Error" />}

      {/* Display results container only if not loading and no specific trace error */}
      {!isLoading && !displayError && (
        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
            {/* Header: Endpoint <-> Gateway */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-around"
                alignItems="stretch"
                spacing={2}
                sx={{ mb: 2, textAlign: 'center' }}
            >
                 {/* Endpoint Box */}
                 <Paper elevation={0} sx={{ p: 1.5, flexGrow: 1, border: 1, borderColor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="overline" display="block" sx={{ lineHeight: 1.2, color: 'primary.main' }}>Endpoint</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{ip || 'N/A'}</Typography>
                 </Paper>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Typography variant="h5" sx={{ color: 'text.secondary', transform: { xs: 'rotate(90deg)', sm: 'none'} }}>↔</Typography>
                </Box>

                 {/* Gateway Box */}
                 <Paper elevation={0} sx={{ p: 1.5, flexGrow: 1, border: 1, borderColor: 'grey.400', borderRadius: 1 }}>
                    <Typography variant="overline" display="block" sx={{ lineHeight: 1.2 }}>Gateway</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{dg || 'N/A'}</Typography>
                 </Paper>
            </Stack>

            {/* Divider before hops */}
            <Divider sx={{ my: 2 }} />

          {/* Display Hops */}
          {hasResults ? (
             <Box sx={{ overflowX: 'auto', width: '100%', py: 1, px: 0.5 }}>
                <Stack
                  direction="row"
                  spacing={0} // Handled by HopDisplay
                  alignItems="center"
                  sx={{
                    minWidth: 'max-content',
                    minHeight: 100,
                    pb: 1,
                  }}
                >
                  {traceResult.map((hop, index) => (
                    <HopDisplay
                      key={`${hop.device_id || hop.ip || hop.mac || `hop-${hop.hop}`}-${index}`} // Robust key
                      hopData={hop}
                      isFirst={index === 0}
                      isLast={index === traceResult.length - 1}
                    />
                  ))}
                </Stack>
             </Box>
          ) : (
             // Show message only if trace succeeded but returned no hops
             traceStatus === 'succeeded' && (
                <Typography align="center" color="text.secondary" sx={{ my: 3, fontStyle: 'italic' }}>
                    No MAC trace hops were returned. The gateway might be directly connected or unreachable at Layer 2.
                </Typography>
             )
          )}
        </Paper>
      )}
    </Box>
  );
};

export default MacTraceVisualizer;
// ----- File: src\components\RouteTrace\DirectRouteVisualizer.jsx -----
import React from 'react';
import { Box, Typography, Stack, Paper, Chip, Divider } from '@mui/material';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay';

const DirectRouteVisualizer = ({ trace }) => {
  const {
    sourceIp, destinationIp, sourceDg, destinationDg, vrf,
    traceResult,
    traceStatus,
    error
  } = trace;

  const isLoading = traceStatus === 'loading';
  // Separate DG fetch errors from trace errors for display
  const isDgError = error && (trace.sourceDgStatus === 'failed' || trace.destinationDgStatus === 'failed');
  const isTraceError = error && traceStatus === 'failed' && !isDgError;
  const displayError = isTraceError; // Only display trace error here

  const hasResults = traceResult && traceResult.length > 0;

  // Don't render anything in idle state unless there's an error already
  if (traceStatus === 'idle' && !error) {
    return null; // Input form shows initial state message
  }

  return (
    <Box sx={{ mt: traceStatus !== 'idle' ? 2 : 0 }}> {/* Add margin top only if not idle */}
      <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2 }}>
          Trace Results
      </Typography>

       {/* Display VRF if specified */}
       {vrf && (
            <Chip
                label={`VRF: ${vrf}`}
                size="small"
                variant="outlined"
                sx={{ display: 'block', mx: 'auto', mb: 2, width: 'fit-content' }}
            />
       )}

      {isLoading && <LoadingSpinner message="Performing direct route trace..." />}

      {/* Display specific trace error */}
      {displayError && <ErrorMessage error={error} title="Direct Route Trace Error" />}

      {/* Display results container only if not loading and no specific trace error */}
      {!isLoading && !displayError && (
        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          {/* Header: Source Info -> Destination Info */}
          <Stack
             direction={{ xs: 'column', sm: 'row' }}
             justifyContent="space-around"
             alignItems="stretch" // Stretch items to equal height
             spacing={2}
             sx={{ mb: 2, textAlign: 'center' }}
          >
              {/* Source Box */}
              <Paper elevation={0} sx={{ p: 1.5, flexGrow: 1, border: 1, borderColor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="overline" display="block" sx={{ lineHeight: 1.2, color: 'primary.main' }}>Source</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{sourceIp || 'N/A'}</Typography>
                  <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all', color: 'text.secondary' }}>DG: {sourceDg || 'N/A'}</Typography>
              </Paper>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Typography variant="h5" sx={{ color: 'text.secondary', transform: { xs: 'rotate(90deg)', sm: 'none'} }}>→</Typography>
              </Box>

              {/* Destination Box */}
              <Paper elevation={0} sx={{ p: 1.5, flexGrow: 1, border: 1, borderColor: 'secondary.light', borderRadius: 1 }}>
                  <Typography variant="overline" display="block" sx={{ lineHeight: 1.2, color: 'secondary.main' }}>Destination</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{destinationIp || 'N/A'}</Typography>
                  <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all', color: 'text.secondary' }}>DG: {destinationDg || 'N/A'}</Typography>
              </Paper>
          </Stack>

          {/* Divider before hops */}
          <Divider sx={{ my: 2 }} />

          {/* Display Hops */}
          {hasResults ? (
             <Box sx={{ overflowX: 'auto', width: '100%', py: 1, px: 0.5 }}>
                <Stack
                  direction="row"
                  spacing={0} // Handled by HopDisplay arrows
                  alignItems="center"
                  sx={{
                    minWidth: 'max-content', // Ensure stack takes at least content width
                    minHeight: 100, // Minimum height for visual consistency
                    pb: 1 // Padding for scrollbar space
                  }}
                >
                  {traceResult.map((hop, index) => (
                    <HopDisplay
                      key={`${hop.device_id || hop.ip || hop.mac || `hop-${hop.hop}`}-${index}`} // More robust key
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
                    No route trace hops were returned between the specified points.
                </Typography>
             )
          )}
        </Paper>
      )}
    </Box>
  );
};

export default DirectRouteVisualizer;
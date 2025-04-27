// ----- File: src\components\RouteTrace\RouteVisualizer.jsx -----
import React from 'react';
import { Box, Typography, Stack, Paper, Divider, Chip } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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

  const isLoading = traceStatus === 'loading';
  // Separate DG fetch errors from trace/partial errors
  const isDgError = error && (trace.sourceDgStatus === 'failed' || trace.destinationDgStatus === 'failed');
  const isTraceError = error && (traceStatus === 'failed' || traceStatus === 'partial_success') && !isDgError;
  const displayError = isTraceError; // Only display trace/partial error here

  const hasMainHops = mainRouteTrace && mainRouteTrace.length > 0;

  // Don't render anything in idle state unless there's an error already
  if (traceStatus === 'idle' && !error) {
    return null; // Input form shows initial state message
  }

  return (
    <Box sx={{ mt: traceStatus !== 'idle' ? 2 : 0 }}>
      <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2 }}>
          Combined Trace Results
      </Typography>

      {isLoading && <LoadingSpinner message="Performing full trace..." />}

      {/* Display specific trace error or partial success message */}
      {displayError && <ErrorMessage error={error} title={traceStatus === 'partial_success' ? "Partial Trace Success" : "Trace Error"} />}

      {/* Display results container only if not loading and no critical DG error prevented trace */}
      {!isLoading && !isDgError && (
        <Box>
          {/* 1. Source IP Box */}
           <Paper elevation={1} variant='outlined' sx={{ p: 1.5, mb: 1, textAlign: 'center', borderColor: 'primary.light' }}>
              <Typography variant="overline" display="block" sx={{ lineHeight: 1.2, color: 'primary.main' }}>Source</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{sourceIp || 'N/A'}</Typography>
           </Paper>
           <Box textAlign="center"><ArrowDownwardIcon fontSize="small" color="action" /></Box>

          {/* 2. Source MAC Trace */}
          <MacTraceDisplay
            label={`${sourceIp || 'Src'} ↔ ${sourceDg || 'DG'}`}
            hops={sourceMacTrace}
            isLoading={false} // Loading handled globally
            // Pass specific error message if only this part failed in partial success
            error={traceStatus === 'partial_success' && !sourceMacTrace ? "Source MAC trace failed or returned no data." : null}
           />
           <Box textAlign="center"><ArrowDownwardIcon fontSize="small" color="action" /></Box>

           {/* 3. Source DG Box */}
           <Paper elevation={1} variant='outlined' sx={{ p: 1.5, my: 1, textAlign: 'center' }}>
              <Typography variant="overline" display="block" sx={{ lineHeight: 1.2 }}>Source DG</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{sourceDg || 'N/A'}</Typography>
           </Paper>
           <Box textAlign="center"><ArrowDownwardIcon fontSize="small" color="action" /></Box>


          {/* 4. Main Route Hops */}
          <Paper elevation={0} variant="outlined" sx={{ p: { xs: 1, sm: 1.5 }, my: 1.5 }}>
              <Typography variant="caption" fontWeight="medium" display="block" align="center" sx={{ color: 'text.secondary', mb: 1 }}>
                  Main Route Path (IP Hops)
              </Typography>
              <Divider sx={{ mb: 1 }}/>
              {hasMainHops ? (
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
                      {mainRouteTrace.map((hop, index) => (
                        <HopDisplay
                           key={`${hop.device_id || hop.ip || hop.mac || `hop-${hop.hop}`}-${index}`}
                           hopData={hop}
                          isFirst={index === 0}
                          isLast={index === mainRouteTrace.length - 1}
                        />
                      ))}
                    </Stack>
                </Box>
              ) : (
                 // Show message only if trace finished (success/partial) but no hops
                 (traceStatus === 'succeeded' || traceStatus === 'partial_success') && (
                    <Typography align="center" color="text.secondary" sx={{ my: 3, fontStyle: 'italic' }}>
                        {mainRouteTrace === null ? 'Main route trace did not run or failed.' : 'No hops returned for the main route path.'}
                    </Typography>
                 )
              )}
          </Paper>
           <Box textAlign="center"><ArrowDownwardIcon fontSize="small" color="action" /></Box>

           {/* 5. Destination DG Box */}
           <Paper elevation={1} variant='outlined' sx={{ p: 1.5, my: 1, textAlign: 'center' }}>
              <Typography variant="overline" display="block" sx={{ lineHeight: 1.2 }}>Destination DG</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{destinationDg || 'N/A'}</Typography>
           </Paper>
           <Box textAlign="center"><ArrowDownwardIcon fontSize="small" color="action" /></Box>

          {/* 6. Destination MAC Trace */}
          <MacTraceDisplay
            label={`${destinationDg || 'DG'} ↔ ${destinationIp || 'Dst'}`}
            hops={destinationMacTrace}
            isLoading={false} // Loading handled globally
            error={traceStatus === 'partial_success' && !destinationMacTrace ? "Destination MAC trace failed or returned no data." : null}
           />
           <Box textAlign="center"><ArrowDownwardIcon fontSize="small" color="action" /></Box>

            {/* 7. Destination IP Box */}
           <Paper elevation={1} variant='outlined' sx={{ p: 1.5, mt: 1, textAlign: 'center', borderColor: 'secondary.light' }}>
              <Typography variant="overline" display="block" sx={{ lineHeight: 1.2, color: 'secondary.main' }}>Destination</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{destinationIp || 'N/A'}</Typography>
           </Paper>

        </Box>
      )}

    </Box>
  );
};

export default RouteVisualizer;
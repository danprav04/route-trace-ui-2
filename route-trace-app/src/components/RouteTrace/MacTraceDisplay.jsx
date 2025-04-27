// ----- File: src\components\RouteTrace\MacTraceDisplay.jsx -----
import React from 'react';
import { Paper, Typography, Box, Stack, Chip, Divider } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay';

const MacTraceDisplay = ({ label, hops, isLoading, error }) => {
  // hops is an array of DetailedHop objects or null/undefined

  const hasHops = hops && hops.length > 0;

  return (
    // Use outlined Paper for a lighter look, integrate into the main visualizer flow
    <Paper elevation={0} variant="outlined" sx={{ p: 1.5, my: 1.5, bgcolor: 'action.hover' }}>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1.5 }}>
        <CompareArrowsIcon fontSize="small" color="action" />
        <Typography variant="caption" fontWeight="medium" sx={{ color: 'text.secondary' }}>{label}</Typography>
      </Stack>

      {isLoading && <LoadingSpinner size={25} message="Tracing MAC path..." />}
      {error && <ErrorMessage error={error} title="MAC Trace Error" />}

      {!isLoading && !error && (
        <>
          {hops === null || hops === undefined ? (
            <Typography variant="caption" display="block" align="center" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
                MAC Trace not initiated.
            </Typography>
          ) : !hasHops ? (
            <Typography variant="caption" display="block" align="center" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                No MAC trace hops found.
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto', width: '100%', pb: 1 }}>
                <Stack
                  direction="row"
                  spacing={0} // Spacing handled by arrows in HopDisplay
                  alignItems="center" // Center items vertically
                  sx={{
                    minWidth: 'max-content', // Fit content width
                    py: 1,
                    px: 0.5,
                    minHeight: 80, // Ensure minimum height even with few hops
                  }}
                >
                  {hops.map((hop, index) => (
                    <HopDisplay
                      // Use a more robust key including MAC if available
                      key={`${hop.device_id || hop.ip || hop.mac || `hop-${hop.hop}`}-${index}`}
                      hopData={hop} // Pass the full detailed hop object
                      isFirst={index === 0}
                      isLast={index === hops.length - 1}
                    />
                  ))}
                </Stack>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default MacTraceDisplay;
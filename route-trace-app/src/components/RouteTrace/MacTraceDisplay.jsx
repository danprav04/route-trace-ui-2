// src/components/RouteTrace/MacTraceDisplay.jsx
// No changes needed - it passes the detailed hops to HopDisplay

import React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay'; // HopDisplay now handles details

const MacTraceDisplay = ({ label, hops, isLoading, error }) => {
  // hops is now an array of DetailedHop objects

  return (
    <Paper elevation={0} sx={{ p: 1, my: 1, bgcolor: 'action.hover' }}> {/* Slightly different bg */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
        <CompareArrowsIcon fontSize="small" color="action" />
        <Typography variant="overline">{label}</Typography>
      </Box>

      {isLoading && <LoadingSpinner size={25} />}
      {error && <ErrorMessage error={error} title="MAC Trace Error" />}

      {!isLoading && !error && (
        <>
          {hops === null || hops === undefined ? (
            <Typography variant="caption" display="block" align="center">MAC Trace Pending</Typography>
          ) : hops.length === 0 ? (
            <Typography variant="caption" display="block" align="center">No MAC trace hops found.</Typography>
          ) : (
            <Stack
              direction="row"
              spacing={0} // Spacing handled by arrows in HopDisplay
              alignItems="center" // Center items vertically
              sx={{
                overflowX: 'auto', // Enable horizontal scrolling
                minWidth: 0, // <<<--- ADD THIS LINE TO PREVENT STACK FROM OVER-EXPANDING
                py: 1,
                px: 1,
                minHeight: '70px', // Ensure minimum height even with few hops
              }}
            >
              {hops.map((hop, index) => (
                <HopDisplay
                  // Use a more robust key if available (e.g., device_id + hop)
                  key={`${hop.device_id || hop.ip}-${hop.hop}-${index}`}
                  hopData={hop} // Pass the full detailed hop object
                  isFirst={index === 0}
                  isLast={index === hops.length - 1}
                />
              ))}
            </Stack>
          )}
        </>
      )}
    </Paper>
  );
};

export default MacTraceDisplay;

// ----- End File: src/components/RouteTrace/MacTraceDisplay.jsx -----
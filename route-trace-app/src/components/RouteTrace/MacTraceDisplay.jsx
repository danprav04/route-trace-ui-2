// ----- File: src/components/RouteTrace/MacTraceDisplay.jsx -----

import React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import HopDisplay from './HopDisplay'; // Reuse HopDisplay

const MacTraceDisplay = ({ label, hops, isLoading, error }) => {
  // hops is now expected to be an array like [{hop: 1, ip: 'mac/ip', name: 'dev', type: 'L2/L3'}, ...] or null/undefined

  return (
    <Paper elevation={1} sx={{ p: 2, my: 1, bgcolor: 'grey.100' }}>
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
              spacing={0} // Let HopDisplay handle spacing
              alignItems="flex-start"
              sx={{
                overflowX: 'auto', // Enable horizontal scrolling
                py: 1,
                px: 1,
              }}
            >
              {hops.map((hop, index) => (
                <HopDisplay
                  key={hop.hop || index} // Use hop number or index as key
                  hopData={hop}
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
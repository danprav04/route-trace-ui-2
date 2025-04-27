// ----- File: src\components\Common\LoadingSpinner.jsx -----
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ size = 40, message }) => (
  <Box sx={{
      display: 'flex',
      flexDirection: 'column', // Stack spinner and message vertically
      justifyContent: 'center',
      alignItems: 'center',
      p: 3, // Add more padding
      minHeight: 150, // Ensure it takes up some space
      color: 'text.secondary' // Use secondary text color for message
    }}>
    <CircularProgress size={size} sx={{ mb: message ? 2 : 0 }} />
    {message && <Typography variant="caption">{message}</Typography>}
  </Box>
);

export default LoadingSpinner;
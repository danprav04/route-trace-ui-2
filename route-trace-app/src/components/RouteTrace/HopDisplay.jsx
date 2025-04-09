import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HopDisplay = ({ hopData, isFirst, isLast }) => {
  // Assuming hopData structure like { hop: number, ip: string, name: string, type: string }
  // Type might indicate firewall, router etc. - adjust as needed based on backend output
  const { hop, ip, name, type } = hopData;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
       {!isFirst && <ArrowForwardIcon sx={{ mx: 1, color: 'text.secondary' }} />}
      <Paper elevation={2} sx={{ p: 1.5, minWidth: 150, textAlign: 'center' }}>
          <Typography variant="caption" display="block" gutterBottom>Hop {hop}</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{ip || 'N/A'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{name || 'Unknown Host'}</Typography>
          {type && <Chip label={type} size="small" sx={{ mt: 1 }} />}
      </Paper>
    </Box>
  );
};

export default HopDisplay;
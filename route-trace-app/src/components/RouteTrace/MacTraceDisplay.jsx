import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const MacTraceDisplay = ({ label, data, isLoading, error }) => {
  // Data could be a simple string/object indicating success/failure or detailed hops if backend provides it
  let content;
  if (isLoading) {
      content = <Typography variant="caption">Loading MAC Trace...</Typography>;
  } else if (error) {
      content = <Chip label={`MAC Trace Error: ${error}`} color="error" size="small" />;
  } else if (data) {
      // Simple success indication, or display actual data if available/needed
      content = <Chip label="MAC Trace OK" color="success" size="small" />;
      // Example if data was complex: <pre>{JSON.stringify(data, null, 2)}</pre>
  } else {
      content = <Typography variant="caption">MAC Trace Pending</Typography>;
  }

  return (
    <Paper elevation={1} sx={{ p: 1, textAlign: 'center', my: 1, bgcolor: 'grey.100' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1}}>
             <CompareArrowsIcon fontSize="small" color="action"/>
            <Typography variant="overline" >{label}</Typography>
        </Box>
        {content}
    </Paper>
  );
};

export default MacTraceDisplay;
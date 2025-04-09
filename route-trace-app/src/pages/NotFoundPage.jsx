import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => (
  <Box sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h3" component="h1" gutterBottom>
      404 - Page Not Found
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Sorry, the page you are looking for does not exist.
    </Typography>
    <Button variant="contained" component={RouterLink} to="/">
      Go to Homepage
    </Button>
  </Box>
);

export default NotFoundPage;
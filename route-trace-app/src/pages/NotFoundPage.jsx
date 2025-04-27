// ----- File: src\pages\NotFoundPage.jsx -----
import React from 'react';
import { Typography, Box, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Icon for visual cue

const NotFoundPage = () => (
  <Box
    sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)', // Adjust height calculation based on AppBar/Toolbar
        textAlign: 'center',
        px: 2,
    }}
   >
    <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2 }}>
        <ErrorOutlineIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Oops! The page you are looking for doesn't exist or may have been moved.
        </Typography>
        <Button
            variant="contained"
            component={RouterLink}
            to="/" // Link to the main dashboard or relevant starting page
            size="large"
        >
            Go to Homepage
        </Button>
    </Paper>
  </Box>
);

export default NotFoundPage;
// ----- File: src\components\History\HistoryList.jsx -----
import React from 'react';
import { List, Typography, Paper, Box, Alert } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import HistoryItem from './HistoryItem';

const HistoryList = ({ routes, title = "Route History" }) => {
  const hasRoutes = routes && routes.length > 0;

  return (
    <Paper elevation={2} sx={{ mt: 2, overflow: 'hidden' }}> {/* Hide overflow for clean corners */}
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <HistoryIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">{title}</Typography>
        </Box>

        {!hasRoutes ? (
            <Alert severity="info" sx={{ m: 2, mt: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                No history records found matching the criteria.
            </Alert>
        ) : (
            // Disable padding on List to allow HistoryItem full width for its divider
            <List component="nav" aria-label="route history" disablePadding>
                {routes.map((route) => (
                    <HistoryItem key={route.id} route={route} />
                ))}
            </List>
        )}
    </Paper>
  );
};

export default HistoryList;
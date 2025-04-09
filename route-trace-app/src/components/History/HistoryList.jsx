import React from 'react';
import { List, Typography, Paper } from '@mui/material';
import HistoryItem from './HistoryItem';

const HistoryList = ({ routes, title = "Route History" }) => {
  if (!routes || routes.length === 0) {
    return <Typography sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">No history found.</Typography>;
  }

  return (
    <Paper elevation={1} sx={{ mt: 2 }}>
        <Typography variant="h5" component="h2" sx={{ p: 2 }}>{title}</Typography>
        <List component="nav" aria-label="route history">
        {routes.map((route) => (
            <HistoryItem key={route.id} route={route} />
        ))}
        </List>
    </Paper>
  );
};

export default HistoryList;
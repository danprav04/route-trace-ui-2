import React, { useState } from 'react';
import { ListItem, ListItemText, Collapse, IconButton, Typography, Box, Paper, Stack, Chip } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HopDisplay from '../RouteTrace/HopDisplay'; // Reuse HopDisplay
import { formatTimestamp } from '../../utils/formatters';

const HistoryItem = ({ route }) => {
  const [open, setOpen] = useState(false);
  const { id, source, destination, timestamp, routeData, deviceInfo, user } = route; // Assuming 'user' field available in 'all routes'

  const handleClick = () => {
    setOpen(!open);
  };

  // Basic check if routeData looks like a valid trace array
  const hasValidRouteData = Array.isArray(routeData) && routeData.length > 0 && typeof routeData[0] === 'object';

  return (
    <>
      <ListItem button onClick={handleClick} divider>
        <ListItemText
          primary={
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">
                      <Chip label="Src" size="small" color="primary" sx={{ mr: 1}} />{source || 'N/A'}
                      <Typography component="span" sx={{ mx: 1 }}>→</Typography>
                      <Chip label="Dst" size="small" color="secondary" sx={{ mr: 1}} />{destination || 'N/A'}
                  </Typography>
                  {user && <Typography variant="caption" color="text.secondary">User: {user.username}</Typography>}
             </Stack>
            }
          secondary={`Traced on: ${formatTimestamp(timestamp)} (ID: ${id})`}
        />
        {hasValidRouteData ? (open ? <ExpandLess /> : <ExpandMore />) : null }
      </ListItem>
      {hasValidRouteData && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Paper sx={{ p: 2, m: 1, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>Detailed Route</Typography>
                {deviceInfo && (
                    <Box mb={2}>
                        <Typography variant="subtitle2">Device Info:</Typography>
                        <pre style={{fontSize: '0.8rem', background: '#eee', padding: '5px', borderRadius: '4px', overflowX: 'auto'}}>{JSON.stringify(deviceInfo, null, 2)}</pre>
                    </Box>
                )}
                <Stack
                  direction="row"
                  spacing={0}
                  alignItems="flex-start"
                  sx={{
                    overflowX: 'auto', // Enable horizontal scrolling
                    py: 2,
                    px: 1,
                    borderTop: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                 {routeData.map((hop, index) => (
                    <HopDisplay
                        key={hop.hop || index}
                        hopData={hop}
                        isFirst={index === 0}
                        isLast={index === routeData.length - 1}
                    />
                 ))}
                </Stack>
            </Paper>
          </Collapse>
      )}
      {!hasValidRouteData && open && (
           <Collapse in={open} timeout="auto" unmountOnExit>
                <Paper sx={{ p: 2, m: 1, bgcolor: 'grey.50' }}>
                    <Typography color="text.secondary">No detailed route hops available for this entry.</Typography>
                     {routeData && <pre style={{fontSize: '0.8rem', background: '#eee', padding: '5px', borderRadius: '4px', overflowX: 'auto'}}>{JSON.stringify(routeData, null, 2)}</pre>}
                </Paper>
           </Collapse>
      )}
    </>
  );
};

export default HistoryItem;
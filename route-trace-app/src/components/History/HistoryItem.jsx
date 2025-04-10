// src/components/History/HistoryItem.jsx
import React, { useState } from 'react';
import {
    ListItem,
    ListItemText,
    Collapse,
    IconButton,
    Typography,
    Box,
    Paper,
    Stack,
    Chip,
    Accordion, // Using Accordion for better grouping
    AccordionSummary,
    AccordionDetails,
    Divider // Keep Divider if used, otherwise remove
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown'; // Placeholder icon
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // <-- MOVED TO TOP
import HopDisplay from '../RouteTrace/HopDisplay'; // Reuse HopDisplay
import { formatTimestamp } from '../../utils/formatters';


const HistoryItem = ({ route }) => {
  const [open, setOpen] = useState(false);
  // routeData is now expected to be an array of DetailedHop objects
  // deviceInfo is expected to be an object or null
  const { id, source, destination, timestamp, routeData, deviceInfo, user } = route;

  const handleClick = () => {
    setOpen(!open);
  };

  // Check if routeData is a non-empty array
  const hasValidRouteData = Array.isArray(routeData) && routeData.length > 0;

  return (
    <>
      {/* Main List Item Header */}
      <ListItem button onClick={handleClick} divider>
        <ListItemText
          primary={
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip label="Src" size="small" color="primary" sx={{ mr: 0.5}} />
                      <Typography component="span" sx={{wordBreak: 'break-all'}}>{source || 'N/A'}</Typography>
                      <Typography component="span" sx={{ mx: 1 }}>→</Typography>
                      <Chip label="Dst" size="small" color="secondary" sx={{ mr: 0.5}} />
                      <Typography component="span" sx={{wordBreak: 'break-all'}}>{destination || 'N/A'}</Typography>
                  </Typography>
                  <Stack direction="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} sx={{ minWidth: '150px' }}>
                     {user && <Typography variant="caption" color="text.secondary">User: {user.username}</Typography>}
                     <Typography variant="caption" color="text.secondary">{formatTimestamp(timestamp)}</Typography>
                     <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.65rem'}}>(ID: {id})</Typography>
                  </Stack>
             </Stack>
            }
        />
        {hasValidRouteData ? (open ? <ExpandLess /> : <ExpandMore />) : null }
      </ListItem>

      {/* Collapsible Details Section */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Paper sx={{ p: 0, m: 1, bgcolor: 'background.default' }} elevation={0}> {/* Use default bg, no extra elevation */}

            {/* Device Info Accordion (if available) */}
            {deviceInfo && typeof deviceInfo === 'object' && Object.keys(deviceInfo).length > 0 && (
                 <Accordion elevation={1} sx={{mb: 1}}>
                     <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls={`panel-deviceinfo-${id}-content`}
                        id={`panel-deviceinfo-${id}-header`}
                     >
                         <DeviceUnknownIcon sx={{mr: 1, color: 'action.active'}}/>
                         <Typography variant="subtitle2">Additional Device Info</Typography>
                     </AccordionSummary>
                     <AccordionDetails sx={{bgcolor: 'grey.100', p: 1}}>
                         <pre style={{fontSize: '0.8rem', margin: 0, padding: '5px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                             {JSON.stringify(deviceInfo, null, 2)}
                         </pre>
                     </AccordionDetails>
                 </Accordion>
            )}

            {/* Route Trace Accordion */}
            {hasValidRouteData && (
                <Accordion defaultExpanded elevation={1}>
                     <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls={`panel-routedata-${id}-content`}
                        id={`panel-routedata-${id}-header`}
                     >
                         <AccountTreeIcon sx={{mr: 1, color: 'action.active'}} /> {/* Use appropriate icon */}
                         <Typography variant="subtitle2">Detailed Route Hops ({routeData.length})</Typography>
                     </AccordionSummary>
                     <AccordionDetails sx={{ p: 1 }}> {/* Padding for scroll container */}
                         <Stack
                             direction="row"
                             spacing={0} // Handled by HopDisplay
                             alignItems="center"
                             sx={{
                                 overflowX: 'auto', // Enable horizontal scrolling
                                 py: 1,
                                 px: 1,
                                 border: '1px dashed',
                                 borderColor: 'divider',
                                 borderRadius: 1,
                                 minHeight: '90px', // Ensure some height
                             }}
                         >
                             {routeData.map((hop, index) => (
                                 <HopDisplay
                                     key={`${hop.device_id || hop.ip}-${hop.hop}-${index}`} // More robust key
                                     hopData={hop} // Pass the detailed hop object
                                     isFirst={index === 0}
                                     isLast={index === routeData.length - 1}
                                 />
                             ))}
                         </Stack>
                    </AccordionDetails>
                </Accordion>
            )}

            {/* Message if no valid route data */}
            {!hasValidRouteData && (
                 <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No detailed route hops available for this history entry.
                 </Typography>
            )}

            {/* Display raw routeData if parsing failed but original was string */}
             {typeof route.route === 'string' && (!Array.isArray(routeData) || routeData.length === 0) && (
                  <Accordion elevation={1} sx={{mt: 1}}> {/* Added margin top */}
                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`panel-raw-${id}-content`} id={`panel-raw-${id}-header`}>
                        <Typography variant="caption">Raw Route Data (Parsing Failed or Empty)</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{bgcolor: 'grey.100', p: 1}}>
                        <pre style={{fontSize: '0.8rem', margin: 0, padding: '5px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                            {route.route}
                        </pre>
                    </AccordionDetails>
                  </Accordion>
             )}
        </Paper>
      </Collapse>
    </>
  );
};

// Removed the import from the bottom

export default HistoryItem;
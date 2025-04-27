// ----- File: src\components\History\HistoryItem.jsx -----
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    useTheme, // Import useTheme hook
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore'; // <-- Correct import name is ExpandMore
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code'; // Icon for Raw Data
import HopDisplay from '../RouteTrace/HopDisplay';
import { formatTimestamp } from '../../utils/formatters';

const HistoryItem = ({ route }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme(); // Access theme for colors/spacing
  const { id, source, destination, timestamp, routeData, deviceInfo, user } = route;

  const handleClick = () => {
    setOpen(!open);
  };

  // Check if routeData is valid (should be parsed array)
  const hasValidRouteData = Array.isArray(routeData) && routeData.length > 0;
  // Check if there's raw route data to display (string format and not successfully parsed/empty)
  const hasRawRouteString = typeof route.route === 'string' && route.route.trim() !== '' && !hasValidRouteData;
  const hasDeviceInfo = deviceInfo && typeof deviceInfo === 'object' && Object.keys(deviceInfo).length > 0;

  // Determine if there's any expandable content
  const hasDetails = hasValidRouteData || hasDeviceInfo || hasRawRouteString;

  return (
    <>
      {/* Main List Item Header */}
      <ListItem
         // Use button prop only if there are details to expand
         button={hasDetails}
         onClick={hasDetails ? handleClick : undefined} // Only allow click if expandable
         divider
         aria-expanded={open}
         aria-controls={hasDetails ? `history-item-details-${id}` : undefined}
         sx={{
             alignItems: 'flex-start', // Align items to top for multi-line content
             '&:hover': hasDetails ? {} : { bgcolor: 'transparent', cursor: 'default' }, // No hover effect if not clickable
            }}
      >
        <ListItemText
          disableTypography // Allow custom typography components
          primary={
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 0.5, sm: 2 }}
                sx={{ width: '100%', mb: 0.5 }} // Ensure stack takes full width
              >
                  {/* Source -> Destination */}
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, minWidth: 0, flexGrow: 1 }}>
                      <Chip label="Src" size="small" color="primary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                      <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{source || 'N/A'}</Typography>
                      <Typography component="span" sx={{ mx: 1 }}>→</Typography>
                      <Chip label="Dst" size="small" color="secondary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                      <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{destination || 'N/A'}</Typography>
                  </Typography>
                  {/* User/Timestamp/ID */}
                  <Stack direction="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} sx={{ minWidth: '160px', textAlign: {xs: 'left', sm: 'right'} }}>
                     {user && <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>User: {user.username}</Typography>}
                     <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>{formatTimestamp(timestamp, 'PPp')}</Typography> {/* Readable format */}
                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.7, lineHeight: 1.3 }}>(ID: {id})</Typography>
                  </Stack>
             </Stack>
            }
            // Optional: Secondary text for brief summary if needed
            // secondary={ ... }
        />
        {/* Show expand icon only if details exist */}
        {hasDetails && (
            <IconButton size="small" sx={{ mt: 1 }}> {/* Align icon vertically */}
                {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
        )}
      </ListItem>

      {/* Collapsible Details Section */}
      <Collapse in={open} timeout="auto" unmountOnExit id={`history-item-details-${id}`}>
        {/* Use Box with padding instead of Paper for less visual weight */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
            {/* Device Info Accordion (Conditional) */}
            {hasDeviceInfo && (
                 <Accordion elevation={0} variant="outlined" sx={{ mb: 1 }} slotProps={{ transition: { unmountOnExit: true } }}>
                     <AccordionSummary
                        expandIcon={<ExpandMore />} 
                        aria-controls={`panel-deviceinfo-${id}-content`}
                        id={`panel-deviceinfo-${id}-header`}
                        sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                     >
                         <DeviceUnknownIcon sx={{ mr: 1, color: 'action.active', fontSize: '1.2rem' }}/>
                         <Typography variant="caption" fontWeight="medium">Additional Device Info</Typography>
                     </AccordionSummary>
                     <AccordionDetails sx={{ bgcolor: 'background.default', p: 1, borderTop: 1, borderColor: 'divider' }}>
                         <pre style={{ fontSize: '0.75rem', margin: 0, padding: '8px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '200px' }}>
                             {JSON.stringify(deviceInfo, null, 2)}
                         </pre>
                     </AccordionDetails>
                 </Accordion>
            )}

            {/* Route Trace Accordion (Conditional) */}
            {hasValidRouteData && (
                <Accordion defaultExpanded elevation={0} variant="outlined" sx={{ mb: hasRawRouteString ? 1 : 0 }} slotProps={{ transition: { unmountOnExit: true } }}>
                     <AccordionSummary
                        expandIcon={<ExpandMore />} 
                        aria-controls={`panel-routedata-${id}-content`}
                        id={`panel-routedata-${id}-header`}
                        sx={{ minHeight: '48px', '&.Mui-expanded': { minHeight: '48px' }, '& .MuiAccordionSummary-content': { my: 1 } }}
                     >
                         <AccountTreeIcon sx={{ mr: 1, color: 'action.active' }} />
                         <Typography variant="subtitle2">Detailed Route Hops ({routeData.length})</Typography>
                     </AccordionSummary>
                     <AccordionDetails sx={{ p: 1, overflow: 'hidden', display: 'flex' }}>
                         <Box sx={{ overflowX: 'auto', width: '100%', py: 1, px: 0.5 }}>
                             <Stack
                                 direction="row"
                                 spacing={0}
                                 alignItems="center"
                                 sx={{ minWidth: 'max-content', minHeight: 100, pb: 1 }}
                             >
                                 {routeData.map((hop, index) => (
                                     <HopDisplay
                                         key={`${hop.device_id || hop.ip || hop.mac || `hop-${hop.hop}`}-${index}`} // More robust key
                                         hopData={hop}
                                         isFirst={index === 0}
                                         isLast={index === routeData.length - 1}
                                     />
                                 ))}
                             </Stack>
                         </Box>
                    </AccordionDetails>
                </Accordion>
            )}

            {/* Raw Route Data Accordion (Conditional) */}
             {hasRawRouteString && (
                  <Accordion elevation={0} variant="outlined" slotProps={{ transition: { unmountOnExit: true } }}>
                    <AccordionSummary
                        expandIcon={<ExpandMore />} 
                        aria-controls={`panel-raw-${id}-content`}
                        id={`panel-raw-${id}-header`}
                        sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                    >
                         <CodeIcon sx={{ mr: 1, color: 'action.active', fontSize: '1.2rem' }}/>
                        <Typography variant="caption" fontWeight="medium">Raw Route Data (Parsing Failed or Empty)</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'background.default', p: 1, borderTop: 1, borderColor: 'divider' }}>
                        <pre style={{ fontSize: '0.75rem', margin: 0, padding: '8px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '200px' }}>
                            {route.route} {/* Display the raw string */}
                        </pre>
                    </AccordionDetails>
                  </Accordion>
             )}

            {/* Message if no details at all */}
            {!hasDetails && ( // Should not happen if button logic is correct, but as fallback
                 <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>
                    No details available for this entry.
                 </Typography>
            )}
        </Box>
      </Collapse>
    </>
  );
};

export default HistoryItem;
// ----- End File: src\components\History\HistoryItem.jsx -----
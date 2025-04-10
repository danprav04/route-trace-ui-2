// ----- File: src/components/Comparison/HistoryRouteVisualizer.jsx -----

import React from 'react';
import { Box, Typography, Stack, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import HopDisplay from '../RouteTrace/HopDisplay'; // Reuse the hop display component
import { formatTimestamp } from '../../utils/formatters';

const HistoryRouteVisualizer = ({ route }) => {
    const { id, source, destination, timestamp, routeData, deviceInfo, user } = route;

    // Check if routeData is valid (should be an array from historySlice parsing)
    const hasValidRouteData = Array.isArray(routeData) && routeData.length > 0;
    const hasDeviceInfo = deviceInfo && typeof deviceInfo === 'object' && Object.keys(deviceInfo).length > 0;

    return (
        <Box>
            {/* Header Info */}
            <Paper elevation={0} sx={{ p: 1, mb: 2, border: 1, borderColor: 'divider' }}>
                 <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} flexWrap="wrap">
                    <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip label="Src" size="small" color="primary" sx={{ mr: 0.5}} />
                            <Typography component="span" sx={{wordBreak: 'break-all'}}>{source || 'N/A'}</Typography>
                            <Typography component="span" sx={{ mx: 1 }}>→</Typography>
                            <Chip label="Dst" size="small" color="secondary" sx={{ mr: 0.5}} />
                            <Typography component="span" sx={{wordBreak: 'break-all'}}>{destination || 'N/A'}</Typography>
                        </Typography>
                    </Box>
                     <Stack direction="column" alignItems={'flex-end'} sx={{ minWidth: '120px' }}>
                         {user && <Typography variant="caption" color="text.secondary">User: {user.username}</Typography>}
                         <Typography variant="caption" color="text.secondary">{formatTimestamp(timestamp)}</Typography>
                         <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.65rem'}}>(ID: {id})</Typography>
                    </Stack>
                </Stack>
            </Paper>

            {/* Device Info Accordion (if available) */}
            {hasDeviceInfo && (
                 <Accordion elevation={1} sx={{mb: 1}} TransitionProps={{ unmountOnExit: true }}>
                     <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel-deviceinfo-${id}-content`}
                        id={`panel-deviceinfo-${id}-header`}
                        sx={{minHeight: '36px', '&.Mui-expanded': { minHeight: '36px' }}}
                     >
                         <DeviceUnknownIcon sx={{mr: 1, color: 'action.active', fontSize: '1.1rem'}}/>
                         <Typography variant="caption">Additional Device Info</Typography>
                     </AccordionSummary>
                     <AccordionDetails sx={{bgcolor: 'action.hover', p: 1}}>
                         <pre style={{fontSize: '0.75rem', margin: 0, padding: '5px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                             {JSON.stringify(deviceInfo, null, 2)}
                         </pre>
                     </AccordionDetails>
                 </Accordion>
            )}

            {/* Route Trace Accordion */}
            <Accordion defaultExpanded elevation={1} TransitionProps={{ unmountOnExit: true }}>
                 <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-routedata-${id}-content`}
                    id={`panel-routedata-${id}-header`}
                     sx={{minHeight: '48px', '&.Mui-expanded': { minHeight: '48px' }}}
                 >
                     <AccountTreeIcon sx={{mr: 1, color: 'action.active'}} />
                     <Typography variant="subtitle2">Detailed Hops ({routeData?.length ?? 0})</Typography>
                 </AccordionSummary>
                 <AccordionDetails sx={{ p: 1 }}>
                    {hasValidRouteData ? (
                        <Stack
                            direction="row"
                            spacing={0}
                            alignItems="center"
                            sx={{
                                overflowX: 'auto',
                                minWidth: 0,
                                maxWidth: '100%', // Adjust based on container
                                py: 1,
                                px: 1,
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                                minHeight: '90px',
                            }}
                        >
                            {routeData.map((hop, index) => (
                                <HopDisplay
                                    key={`${hop.device_id || hop.ip}-${hop.hop}-${index}`}
                                    hopData={hop}
                                    isFirst={index === 0}
                                    isLast={index === routeData.length - 1}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>
                            No detailed route hops available in this history entry.
                        </Typography>
                    )}
                </AccordionDetails>
            </Accordion>


        </Box>
    );
};

export default HistoryRouteVisualizer;
// ----- End File: src/components/Comparison/HistoryRouteVisualizer.jsx -----
// ----- File: src\components\Comparison\HistoryRouteVisualizer.jsx -----
import React from 'react';
import { Box, Typography, Stack, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info'; // Keep info icon for consistency
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown'; // Keep icon for device info
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HopDisplay from '../RouteTrace/HopDisplay'; // Reuse the hop display component
import { formatTimestamp } from '../../utils/formatters';

const HistoryRouteVisualizer = ({ route }) => {
    if (!route) return <Typography color="error">Invalid route data provided.</Typography>;

    const { id, source, destination, timestamp, routeData, deviceInfo, user } = route;

    // Validate data (assuming routeData is parsed array from historySlice)
    const hasValidRouteData = Array.isArray(routeData) && routeData.length > 0;
    const hasDeviceInfo = deviceInfo && typeof deviceInfo === 'object' && Object.keys(deviceInfo).length > 0;

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}> {/* Allow vertical growth */}
            {/* Header Info - More compact and aligned */}
            <Paper elevation={0} variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                 <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={{ xs: 1, sm: 2 }}
                    flexWrap="wrap"
                 >
                    {/* Source/Destination */}
                    <Box sx={{ minWidth: 0 }}> {/* Prevent text overflow issues */}
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                             <Chip label="Src" size="small" color="primary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                             <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{source || 'N/A'}</Typography>
                             <Typography component="span" sx={{ mx: 1 }}>→</Typography>
                             <Chip label="Dst" size="small" color="secondary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                             <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{destination || 'N/A'}</Typography>
                        </Typography>
                    </Box>
                     {/* Timestamp/User/ID */}
                     <Stack direction="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                         {user && (
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                User: {user.username}
                            </Typography>
                         )}
                         <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                             {formatTimestamp(timestamp, 'PPp')} {/* Readable format */}
                         </Typography>
                         <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.7, lineHeight: 1.3 }}>
                            (ID: {id})
                         </Typography>
                    </Stack>
                </Stack>
            </Paper>

            {/* Device Info Accordion (Conditional) */}
            {hasDeviceInfo && (
                 <Accordion
                    elevation={0} variant="outlined" // Subtle look
                    sx={{ mb: 1 }}
                    slotProps={{ transition: { unmountOnExit: true } }} // More performant transition
                  >
                     <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel-deviceinfo-${id}-content`}
                        id={`panel-deviceinfo-${id}-header`}
                        sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                     >
                         <DeviceUnknownIcon sx={{ mr: 1, color: 'action.active', fontSize: '1.2rem' }}/>
                         <Typography variant="caption" fontWeight="medium">Additional Device Info</Typography>
                     </AccordionSummary>
                     <AccordionDetails sx={{ bgcolor: 'action.hover', p: 1, borderTop: 1, borderColor: 'divider' }}>
                         {/* Use pre for formatted JSON, ensure it's scrollable */}
                         <pre style={{
                             fontSize: '0.75rem',
                             margin: 0,
                             padding: '8px',
                             borderRadius: '4px',
                             overflowX: 'auto',
                             whiteSpace: 'pre-wrap',
                             wordBreak: 'break-all',
                             maxHeight: '200px', // Limit height
                             backgroundColor: (theme) => theme.palette.background.default, // Match background
                             }}>
                             {JSON.stringify(deviceInfo, null, 2)}
                         </pre>
                     </AccordionDetails>
                 </Accordion>
            )}

            {/* Route Trace Accordion */}
            <Accordion
                defaultExpanded // Keep hops expanded by default
                elevation={0} variant="outlined" // Consistent subtle look
                slotProps={{ transition: { unmountOnExit: true } }}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} // Allow accordion to fill space
             >
                 <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-routedata-${id}-content`}
                    id={`panel-routedata-${id}-header`}
                     sx={{ minHeight: '48px', '&.Mui-expanded': { minHeight: '48px' }, '& .MuiAccordionSummary-content': { my: 1 } }}
                 >
                     <AccountTreeIcon sx={{ mr: 1, color: 'action.active' }} />
                     <Typography variant="subtitle2">Detailed Hops ({routeData?.length ?? 0})</Typography>
                 </AccordionSummary>
                 <AccordionDetails sx={{ p: 1, flexGrow: 1, overflow: 'hidden', display: 'flex' }}> {/* Let details grow and manage overflow */}
                    {hasValidRouteData ? (
                        <Box // Wrapper to handle overflow for the Stack
                            sx={{
                                overflowX: 'auto',
                                width: '100%', // Take full width of details area
                                py: 1,
                                px: 0.5,
                                // Optional border removed, Accordion border is sufficient
                                // border: '1px dashed', borderColor: 'divider', borderRadius: 1,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={0} // Spacing handled by HopDisplay arrows
                                alignItems="center" // Align hops vertically
                                sx={{
                                    minWidth: 'max-content', // Ensure stack takes at least content width
                                    minHeight: 100, // Ensure minimum height
                                    pb: 1, // Padding bottom for scrollbar space if needed
                                }}
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
                    ) : (
                        <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic', alignSelf: 'center' }}>
                            No detailed route hops available in this history entry.
                        </Typography>
                    )}
                </AccordionDetails>
            </Accordion>

        </Box>
    );
};

export default HistoryRouteVisualizer;
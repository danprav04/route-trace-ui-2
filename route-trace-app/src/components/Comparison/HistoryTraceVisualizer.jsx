// ----- File: src\components\Comparison\HistoryTraceVisualizer.jsx -----

import React from 'react';
import { Box, Typography, Stack, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code'; // For input details
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Main Route
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'; // MAC Route
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // For MAC trace display
import HopDisplay from '../RouteTrace/HopDisplay'; // Reuse the hop display component
import { formatTimestamp } from '../../utils/formatters';

// Helper to render a hop section (reusable for main, source mac, dest mac)
// NOW includes horizontal scrolling wrapper - Adjusted Structure
const renderHopSection = (hops, title, icon, defaultExpanded = false) => {
    // Assumes hops is a non-empty array

    return (
        <Accordion
            defaultExpanded={defaultExpanded}
            elevation={0} variant="outlined"
            sx={{ mb: 1 }}
            slotProps={{ transition: { unmountOnExit: true } }}
         >
             <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${title.replace(/\s+/g, '-')}-content`}
                id={`panel-${title.replace(/\s+/g, '-')}-header`}
                sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center' } }}
             >
                 {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'action.active', fontSize: '1.2rem' } })}
                 <Typography variant="caption" fontWeight="medium">{title} ({hops.length} hops)</Typography>
             </AccordionSummary>
             {/* AccordionDetails now acts as the scrolling container */}
             <AccordionDetails sx={{
                bgcolor: 'action.hover',
                p: 1.5, // Add padding here
                py: 2, // More vertical padding
                borderTop: 1,
                borderColor: 'divider',
                overflowX: 'auto', // Enable horizontal scroll on the details area itself
                '&::-webkit-scrollbar': { // Basic scrollbar styling (optional)
                    height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: (theme) => theme.palette.action.disabled,
                    borderRadius: '4px',
                },
             }}>
                 {/* Stack directly inside the scrollable details */}
                 <Stack
                     direction="row"
                     spacing={0} // Spacing handled by HopDisplay arrows
                     alignItems="center" // Align hops vertically
                     sx={{
                         minWidth: 'max-content', // Crucial: Force Stack wider than container
                         minHeight: 80,
                         // Removed py here, handled by AccordionDetails padding
                     }}
                 >
                     {hops.map((hop, index) => (
                         <HopDisplay
                             key={`${hop.device_id || hop.ip || hop.mac || `hop-${hop.hop}`}-${index}`} // More robust key
                             hopData={hop}
                             isFirst={index === 0}
                             isLast={index === hops.length - 1}
                         />
                     ))}
                 </Stack>
             </AccordionDetails>
         </Accordion>
    );
};


const HistoryTraceVisualizer = ({ route, isMinimalView = false }) => { // Accept isMinimalView prop
    if (!route) return <Typography color="error">Invalid route data provided.</Typography>;

    const {
        id, source, destination, timestamp, user, trace_type,
        mainRouteTrace, sourceMacTrace, destinationMacTrace, inputDetails
    } = route;

    // Determine primary identifiers based on trace type for header display
    const primarySourceLabel = trace_type === 'direct' ? "Src GW" : (trace_type === 'mac' ? "Endpoint" : "Src IP");
    const primaryDestLabel = trace_type === 'direct' ? "Dst GW" : (trace_type === 'mac' ? "Gateway" : "Dst IP");
    const separator = trace_type === 'mac' ? '↔' : '→';


    // Check if data exists for different sections
    const hasMainRoute = mainRouteTrace && mainRouteTrace.length > 0;
    const hasSourceMac = sourceMacTrace && sourceMacTrace.length > 0;
    const hasDestMac = destinationMacTrace && destinationMacTrace.length > 0;
    const hasInputs = inputDetails && typeof inputDetails === 'object' && Object.keys(inputDetails).length > 0;
    const vrf = inputDetails?.vrf; // Extract VRF if present in inputs

    return (
        // Conditionally adjust padding/margins based on minimal view
        <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            // Remove vertical padding in minimal view if ComparisonItem provides it
            // py: isMinimalView ? 0 : 1,
        }}>
            {/* Header Info - Conditionally Rendered */}
            { !isMinimalView && (
                 <Paper elevation={0} variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                     <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={{ xs: 1, sm: 2 }}
                        flexWrap="wrap"
                     >
                        {/* Source/Destination */}
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                 <Chip label={primarySourceLabel} size="small" color="primary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                                 <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{source || 'N/A'}</Typography>
                                 <Typography component="span" sx={{ mx: 1 }}>{separator}</Typography>
                                 <Chip label={primaryDestLabel} size="small" color="secondary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                                 <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{destination || 'N/A'}</Typography>
                            </Typography>
                            {/* Display Trace Type and VRF if applicable */}
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Chip label={trace_type?.toUpperCase()} size="small" variant='filled' color="default" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'medium' }} />
                                {vrf && <Chip label={`VRF: ${vrf}`} size="small" variant='outlined' color="info" sx={{ height: 20, fontSize: '0.7rem' }} />}
                            </Stack>
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
            )}

            {/* Input Details Accordion - Conditionally Rendered */}
            { !isMinimalView && hasInputs && (
                 <Accordion
                    elevation={0} variant="outlined"
                    sx={{ mb: 1 }}
                    slotProps={{ transition: { unmountOnExit: true } }}
                  >
                     <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel-inputs-${id}-content`}
                        id={`panel-inputs-${id}-header`}
                        sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center' } }}
                     >
                         <CodeIcon sx={{ mr: 1, color: 'action.active', fontSize: '1.2rem' }}/>
                         <Typography variant="caption" fontWeight="medium">Trace Input Parameters</Typography>
                     </AccordionSummary>
                     <AccordionDetails sx={{ bgcolor: 'action.hover', p: 1, borderTop: 1, borderColor: 'divider' }}>
                         <pre style={{
                             fontSize: '0.75rem', margin: 0, padding: '8px', borderRadius: '4px',
                             overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                             maxHeight: '200px', backgroundColor: (theme) => theme.palette.background.default,
                         }}>
                             {JSON.stringify(inputDetails, null, 2)}
                         </pre>
                     </AccordionDetails>
                 </Accordion>
            )}

            {/* --- Trace Specific Visualizations (Always Rendered) --- */}

            {/* Combined Trace */}
            {trace_type === 'combined' && (
                <>
                    {/* Source L2 Path - Render only if data exists */}
                    {hasSourceMac && renderHopSection(sourceMacTrace, "Source MAC Path", <SettingsEthernetIcon />)}
                    {/* Divider/Indicator - Render only if both sections exist AND not minimal view */}
                    {hasSourceMac && hasMainRoute && !isMinimalView && (
                        <Box textAlign="center" sx={{ my: -0.5 }}><ArrowDownwardIcon fontSize="small" color="action" sx={{ opacity: 0.5 }} /></Box>
                    )}
                    {/* Main IP Path - Render only if data exists */}
                    {hasMainRoute && renderHopSection(mainRouteTrace, "Main Route Path (IP Hops)", <AccountTreeIcon />, !isMinimalView)} {/* Expand by default only if not minimal */}
                     {/* Divider/Indicator - Render only if both sections exist AND not minimal view */}
                    {hasMainRoute && hasDestMac && !isMinimalView && (
                        <Box textAlign="center" sx={{ my: -0.5 }}><ArrowDownwardIcon fontSize="small" color="action" sx={{ opacity: 0.5 }} /></Box>
                    )}
                    {/* Destination L2 Path - Render only if data exists */}
                    {hasDestMac && renderHopSection(destinationMacTrace, "Destination MAC Path", <SettingsEthernetIcon />)}
                    {/* Show message if no parts have data */}
                    {!hasSourceMac && !hasMainRoute && !hasDestMac && (
                         <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>
                            No detailed hop data available for this combined trace entry.
                         </Typography>
                    )}
                </>
            )}

            {/* Direct Trace */}
            {trace_type === 'direct' && (
                 <>
                    {/* Only show Main Route Path - Render only if data exists */}
                    {hasMainRoute ? (
                        renderHopSection(mainRouteTrace, "Direct Route Path", <AccountTreeIcon />, !isMinimalView) // Expand by default only if not minimal
                    ) : (
                         <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>
                             No detailed hop data available for this direct trace entry.
                         </Typography>
                    )}
                 </>
            )}

            {/* MAC Trace */}
            {trace_type === 'mac' && (
                <>
                    {/* Only show Source MAC Path (renamed for clarity) - Render only if data exists */}
                    {hasSourceMac ? (
                        renderHopSection(sourceMacTrace, "MAC Trace Path", <SettingsEthernetIcon />, !isMinimalView) // Expand by default only if not minimal
                    ) : (
                         <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>
                             No detailed hop data available for this MAC trace entry.
                         </Typography>
                    )}
                </>
            )}

            {/* Fallback if trace type is unknown */}
            {trace_type !== 'combined' && trace_type !== 'direct' && trace_type !== 'mac' && (
                <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic', alignSelf: 'center' }}>
                    No detailed visualization available for this trace type ({trace_type || 'Unknown'}).
                </Typography>
            )}


        </Box>
    );
};

export default HistoryTraceVisualizer;

// ----- End File: src\components\Comparison\HistoryTraceVisualizer.jsx -----
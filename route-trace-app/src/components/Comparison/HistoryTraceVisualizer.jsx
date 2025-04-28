// ----- File: src\components\Comparison\HistoryTraceVisualizer.jsx -----

import React from 'react';
import { Box, Typography, Stack, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Divider, Tooltip, alpha } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HopDisplay from '../RouteTrace/HopDisplay';
import { formatTimestamp } from '../../utils/formatters';

// Accepts and passes down ipColorMap to HopDisplay
const renderHopSection = (
    hops,
    title,
    icon,
    defaultExpanded = false,
    isReversed = false,
    isHighlightingActive = false,
    highlightedIPs = new Set(), // Keep this for quick check if needed
    ipColorMap = new Map()      // New: IP to Color map
) => {
    if (!hops || hops.length === 0) return null;

    const hopsToRender = isReversed ? [...hops].reverse() : hops;

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
                 {isReversed && (
                    <Tooltip title="Hop order visually reversed">
                        <SwapHorizIcon fontSize="inherit" sx={{ ml: 0.5, color: 'warning.main', verticalAlign: 'middle' }} />
                    </Tooltip>
                 )}
             </AccordionSummary>
             <AccordionDetails sx={{
                bgcolor: (theme) => alpha(theme.palette.action.selected, 0.3),
                p: 1.5,
                py: 2,
                borderTop: 1,
                borderColor: 'divider',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { height: '8px' },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: (theme) => theme.palette.action.disabled,
                    borderRadius: '4px',
                },
             }}>
                 <Stack
                     direction="row"
                     spacing={0}
                     alignItems="center"
                     sx={{ minWidth: 'max-content', minHeight: 80 }}
                 >
                     {hopsToRender.map((hop, index) => (
                         <HopDisplay
                             key={`${hop.device_id || hop.ip || hop.mac || `hop-${hop.hop}`}-${index}-${isReversed}`}
                             hopData={hop}
                             isFirst={index === 0}
                             isLast={index === hopsToRender.length - 1}
                             isReversed={isReversed}
                             isHighlightingActive={isHighlightingActive} // Pass down highlight state
                             highlightedIPs={highlightedIPs}             // Pass down IP set (optional now)
                             ipColorMap={ipColorMap}                     // Pass down color map
                         />
                     ))}
                 </Stack>
             </AccordionDetails>
         </Accordion>
    );
};

// Accepts and passes down ipColorMap
const HistoryTraceVisualizer = ({
    route,
    isMinimalView = false,
    isReversed = false,
    isHighlightingActive = false,
    highlightedIPs = new Set(), // Keep for consistency if needed
    ipColorMap = new Map(),     // New: Accept color map
}) => {
    if (!route) return <Typography color="error">Invalid route data provided.</Typography>;

    const {
        id, source, destination, timestamp, user, trace_type,
        mainRouteTrace, sourceMacTrace, destinationMacTrace, inputDetails
    } = route;

    let primarySourceLabel = trace_type === 'direct' ? "Src GW" : (trace_type === 'mac' ? "Endpoint" : "Src IP");
    let primaryDestLabel = trace_type === 'direct' ? "Dst GW" : (trace_type === 'mac' ? "Gateway" : "Dst IP");
    const separator = trace_type === 'mac' ? '↔' : '→';

    let displaySource = source;
    let displayDest = destination;
    if (isReversed) {
        [displaySource, displayDest] = [destination, source];
        [primarySourceLabel, primaryDestLabel] = [primaryDestLabel, primarySourceLabel];
    }

    const hasMainRoute = mainRouteTrace && mainRouteTrace.length > 0;
    const hasSourceMac = sourceMacTrace && sourceMacTrace.length > 0;
    const hasDestMac = destinationMacTrace && destinationMacTrace.length > 0;
    const hasInputs = inputDetails && typeof inputDetails === 'object' && Object.keys(inputDetails).length > 0;
    const vrf = inputDetails?.vrf;
    const defaultExpandMain = !isMinimalView && !isReversed;

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: isMinimalView ? 3 : 0 }}>
            {/* Header Info */}
            { !isMinimalView && (
                 <Paper elevation={0} variant="outlined" sx={{ p: 1.5, mb: 2, position: 'relative' }}>
                     <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 1, sm: 2 }} flexWrap="wrap">
                        {/* Source/Destination */}
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                 <Chip label={primarySourceLabel} size="small" color="primary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                                 <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{displaySource || 'N/A'}</Typography>
                                 <Typography component="span" sx={{ mx: 1 }}>{separator}</Typography>
                                 <Chip label={primaryDestLabel} size="small" color="secondary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                                 <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{displayDest || 'N/A'}</Typography>
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Chip label={trace_type?.toUpperCase()} size="small" variant='filled' color="default" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'medium' }} />
                                {vrf && <Chip label={`VRF: ${vrf}`} size="small" variant='outlined' color="info" sx={{ height: 20, fontSize: '0.7rem' }} />}
                                {isReversed && <Chip label="Reversed Display" size="small" variant='outlined' color="warning" sx={{ height: 20, fontSize: '0.65rem', fontStyle:'italic' }} icon={<SwapHorizIcon fontSize='inherit' />} />}
                            </Stack>
                        </Box>
                         {/* Timestamp/User/ID */}
                         <Stack direction="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                             {user && <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>User: {user.username}</Typography>}
                             <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>{formatTimestamp(timestamp, 'PPp')}</Typography>
                             <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.7, lineHeight: 1.3 }}>(ID: {id})</Typography>
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {/* Input Details Accordion */}
            { !isMinimalView && hasInputs && (
                 <Accordion elevation={0} variant="outlined" sx={{ mb: 1 }} slotProps={{ transition: { unmountOnExit: true } }}>
                     <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-inputs-${id}-content`} id={`panel-inputs-${id}-header`} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center' } }}>
                         <CodeIcon sx={{ mr: 1, color: 'action.active', fontSize: '1.2rem' }}/>
                         <Typography variant="caption" fontWeight="medium">Trace Input Parameters</Typography>
                     </AccordionSummary>
                     <AccordionDetails sx={{ bgcolor: 'action.hover', p: 1, borderTop: 1, borderColor: 'divider' }}>
                         <pre style={{ fontSize: '0.75rem', margin: 0, padding: '8px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '200px', backgroundColor: (theme) => theme.palette.background.default }}>
                             {JSON.stringify(inputDetails, null, 2)}
                         </pre>
                     </AccordionDetails>
                 </Accordion>
            )}

            {/* --- Trace Specific Visualizations --- */}
            {/* Pass highlighting info and color map down */}
            {trace_type === 'combined' && (
                <>
                    {renderHopSection(sourceMacTrace, isReversed ? "Visually Reversed Source MAC Path" : "Source MAC Path", <SettingsEthernetIcon />, false, isReversed, isHighlightingActive, highlightedIPs, ipColorMap)}
                    {hasSourceMac && hasMainRoute && !isMinimalView && <Box textAlign="center" sx={{ my: -0.5 }}><ArrowDownwardIcon fontSize="small" color="action" sx={{ opacity: 0.5 }} /></Box>}
                    {renderHopSection(mainRouteTrace, isReversed ? "Visually Reversed Main Route Path" : "Main Route Path (IP Hops)", <AccountTreeIcon />, defaultExpandMain, isReversed, isHighlightingActive, highlightedIPs, ipColorMap)}
                    {hasMainRoute && hasDestMac && !isMinimalView && <Box textAlign="center" sx={{ my: -0.5 }}><ArrowDownwardIcon fontSize="small" color="action" sx={{ opacity: 0.5 }} /></Box>}
                    {renderHopSection(destinationMacTrace, isReversed ? "Visually Reversed Destination MAC Path" : "Destination MAC Path", <SettingsEthernetIcon />, false, isReversed, isHighlightingActive, highlightedIPs, ipColorMap)}
                    {!hasSourceMac && !hasMainRoute && !hasDestMac && <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>No detailed hop data available for this combined trace entry.</Typography>}
                </>
            )}
            {trace_type === 'direct' && (
                 <>
                    {renderHopSection(mainRouteTrace, isReversed ? "Visually Reversed Direct Route Path" : "Direct Route Path", <AccountTreeIcon />, defaultExpandMain, isReversed, isHighlightingActive, highlightedIPs, ipColorMap)}
                    {!hasMainRoute && <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>No detailed hop data available for this direct trace entry.</Typography>}
                 </>
            )}
            {trace_type === 'mac' && (
                <>
                    {renderHopSection(sourceMacTrace, isReversed ? "Visually Reversed MAC Trace Path" : "MAC Trace Path", <SettingsEthernetIcon />, defaultExpandMain, isReversed, isHighlightingActive, highlightedIPs, ipColorMap)}
                    {!hasSourceMac && <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic' }}>No detailed hop data available for this MAC trace entry.</Typography>}
                </>
            )}
            {trace_type !== 'combined' && trace_type !== 'direct' && trace_type !== 'mac' && (
                <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic', alignSelf: 'center' }}>No detailed visualization available for this trace type ({trace_type || 'Unknown'}).</Typography>
            )}
        </Box>
    );
};

export default HistoryTraceVisualizer;
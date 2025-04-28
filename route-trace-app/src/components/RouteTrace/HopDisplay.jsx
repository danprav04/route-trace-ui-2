// ----- File: src\components\RouteTrace\HopDisplay.jsx -----

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Paper, Typography, Box, Chip, IconButton, Popover, List, ListItem,
    ListItemText, Divider, Tooltip, Stack, alpha, useTheme // Added useTheme
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RouterIcon from '@mui/icons-material/Router';
import ComputerIcon from '@mui/icons-material/Computer';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SecurityIcon from '@mui/icons-material/Security';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi';


const formatDetailKey = (key) => {
    if (typeof key !== 'string' || !key) return '';
    return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
};

const getTypeIcon = (type) => {
    const lowerType = type?.toLowerCase() || '';
    const iconMap = {
        router: <RouterIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        gateway: <RouterIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        firewall: <SecurityIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        host: <ComputerIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        endpoint: <ComputerIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        server: <ComputerIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        switch: <SettingsEthernetIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        bridge: <SettingsEthernetIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        'l3 switch': <SettingsEthernetIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        wifi: <NetworkWifiIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
    };
    const matchedKey = Object.keys(iconMap).find(key => lowerType.includes(key));
    return matchedKey ? iconMap[matchedKey] : <DeviceUnknownIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />;
};

/**
 * Displays a single hop, handling reversed display and highlighting matching IPs
 * with unique colors in comparison mode.
 */
const HopDisplay = ({
    hopData,
    isFirst,
    isLast,
    isReversed = false,
    isHighlightingActive = false,
    // highlightedIPs = new Set(), // This set is implicitly represented by ipColorMap keys
    ipColorMap = new Map()        // New: Map of IP -> color string
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme(); // Access theme for mode-aware colors

    const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
    const handlePopoverClose = () => setAnchorEl(null);
    const open = Boolean(anchorEl);

    if (!hopData) {
        console.warn('HopDisplay received null or undefined hopData.');
        return null;
    }

    const { hop, ip, type, hostname, device_id, mac, rtt, ...otherDetails } = hopData;
    const hopNumber = typeof hop === 'number' ? hop : '?';

    const allDetails = { IP: ip, MAC: mac, Type: type, Hostname: hostname, RTT: rtt ? `${rtt} ms` : undefined, Device_ID: device_id, ...otherDetails };
    const detailsToShow = Object.entries(allDetails).filter(([_, value]) => value != null && value !== '');

    const primaryDisplay = hostname || ip || mac || 'Unknown Device';
    let secondaryDisplay = null;
    if (hostname && (ip || mac)) { secondaryDisplay = ip || mac; }
    else if ((ip || mac) && type) { secondaryDisplay = type; }

    const popoverId = open ? `hop-popover-${hopNumber}-${ip || mac || 'unknown'}` : undefined;

    const showForwardArrow = !isReversed && !isFirst;
    const showBackwardArrow = isReversed && !isLast;
    const arrowProps = { 'aria-hidden': "true", sx: { mx: { xs: 0.5, sm: 1 }, color: 'text.secondary', fontSize: { xs: '1rem', sm: '1.2rem' }, flexShrink: 0 } };

    // --- Highlighting Logic ---
    const highlightColor = isHighlightingActive && ip && ipColorMap.has(ip) ? ipColorMap.get(ip) : null;

    // Use alpha blending for background, ensure sufficient contrast
    // Adjust alpha value (0.2 - 0.4 is usually reasonable)
    const highlightBgColor = highlightColor ? alpha(highlightColor, 0.3) : undefined;
    // Use the direct color for the border
    const highlightBorderColor = highlightColor || undefined;


    return (
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {showForwardArrow && <ArrowForwardIcon {...arrowProps} />}
            <Paper
                elevation={1}
                variant="outlined"
                sx={{
                    p: 1.5,
                    minWidth: 180,
                    maxWidth: 250,
                    textAlign: 'center',
                    position: 'relative',
                    borderRadius: 1.5,
                    flexShrink: 0,
                    overflow: 'hidden',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease',
                    // Apply specific highlight color if active and IP matches
                    bgcolor: highlightBgColor,
                    borderColor: highlightBorderColor,
                    // Optionally enhance border width when highlighted
                    borderWidth: highlightBorderColor ? 2 : 1,
                }}
            >
                {detailsToShow.length > 0 && (
                    <Tooltip title="Show Details">
                        <span>
                            <IconButton aria-label={`Show details for hop ${hopNumber}`} size="small" onClick={handlePopoverOpen} aria-describedby={popoverId} sx={{ position: 'absolute', top: 4, right: 4, p: '2px', color: 'action.active' }}>
                                <InfoOutlinedIcon fontSize="inherit" />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
                <Stack spacing={0.5} alignItems="center" sx={{ pt: detailsToShow.length > 0 ? 1.5 : 0 }}>
                    <Chip label={`Hop ${hopNumber}`} size="small" variant="outlined" color="primary" sx={{ mb: 0.5, height: 20, fontSize: '0.7rem', fontWeight: 'medium' }} />
                    <Tooltip title={primaryDisplay} enterDelay={1000}>
                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.3 }}> {primaryDisplay} </Typography>
                    </Tooltip>
                    {secondaryDisplay && (
                        <Tooltip title={secondaryDisplay} enterDelay={1000}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', wordBreak: 'break-all', lineHeight: 1.2 }}> {secondaryDisplay} </Typography>
                        </Tooltip>
                    )}
                    {type && secondaryDisplay !== type && (
                        <Chip icon={getTypeIcon(type)} label={type} size="small" variant="filled" color="default" sx={{ mt: 0.5, fontSize: '0.7rem', height: 'auto', maxWidth: 'calc(100% - 16px)', '& .MuiChip-icon': { fontSize: '0.8rem', ml: 0.5 }, '& .MuiChip-label': { px: 0.8, py: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' } }} />
                    )}
                </Stack>
            </Paper>
            {showBackwardArrow && <ArrowBackIcon {...arrowProps} />}
            <Popover
                id={popoverId} open={open} anchorEl={anchorEl} onClose={handlePopoverClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                slotProps={{ paper: { elevation: 4, sx: { maxWidth: 350, p: 0, borderRadius: 1.5, border: (theme) => `1px solid ${theme.palette.divider}` } } }}
            >
                <Box>
                    <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 1, fontWeight: 'bold' }}> Hop {hopNumber} Details </Typography>
                    <Divider />
                    <List dense disablePadding sx={{ maxHeight: 350, overflowY: 'auto' }}>
                        {detailsToShow.map(([key, value]) => (
                            <ListItem key={key} dense divider sx={{ py: 0.8, alignItems: 'flex-start' }}>
                                <ListItemText
                                    primary={formatDetailKey(key)}
                                    secondary={typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                    primaryTypographyProps={{ variant: 'caption', fontWeight: 'medium', color: 'text.secondary', component: 'div' }}
                                    secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', sx: { whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.3 } }}
                                    sx={{ my: 0 }}
                                />
                            </ListItem>
                        ))}
                        {detailsToShow.length === 0 && <ListItem dense><ListItemText secondary="No additional details available." secondaryTypographyProps={{ variant: 'caption', fontStyle: 'italic', textAlign: 'center' }} /></ListItem>}
                    </List>
                </Box>
            </Popover>
        </Box>
    );
};

HopDisplay.propTypes = {
    hopData: PropTypes.shape({
        hop: PropTypes.number.isRequired,
        ip: PropTypes.string,
        mac: PropTypes.string,
        hostname: PropTypes.string,
        type: PropTypes.string,
        rtt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool,
    isReversed: PropTypes.bool,
    isHighlightingActive: PropTypes.bool,
    ipColorMap: PropTypes.instanceOf(Map), // Map of IP -> color string
};

HopDisplay.defaultProps = {
    isFirst: false,
    isLast: false,
    isReversed: false,
    isHighlightingActive: false,
    ipColorMap: new Map(),
};

export default HopDisplay;
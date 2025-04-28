// ----- File: src\components\RouteTrace\HopDisplay.jsx -----

// ----- File: src\components\RouteTrace\HopDisplay.jsx -----

import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Recommended for component documentation and validation
import {
    Paper,
    Typography,
    Box,
    Chip,
    IconButton,
    Popover,
    List,
    ListItem,
    ListItemText,
    Divider,
    Tooltip,
    Stack, // Use Stack for better internal layout
    alpha // Import alpha for transparent colors
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Arrow for normal direction
import ArrowBackIcon from '@mui/icons-material/ArrowBack';     // Arrow for reversed direction display
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi'; // Keep for potential future use or different types
import RouterIcon from '@mui/icons-material/Router';
import ComputerIcon from '@mui/icons-material/Computer';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown'; // Default icon
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'; // Switch/Bridge icon
import SecurityIcon from '@mui/icons-material/Security'; // Potential Firewall icon

// Helper to format keys for display in Popover (improved robustness)
const formatDetailKey = (key) => {
    if (typeof key !== 'string' || !key) return '';
    return key
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/([A-Z])/g, ' $1') // Add space before capitals (for camelCase)
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .trim(); // Remove potential leading/trailing whitespace
};

// Helper to get an icon based on hop type (enhanced with more types and map)
const getTypeIcon = (type) => {
    const lowerType = type?.toLowerCase() || '';

    // Map for clearer association and easier extension
    const iconMap = {
        router: <RouterIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        gateway: <RouterIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        firewall: <SecurityIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />, // Dedicated FW icon
        host: <ComputerIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        endpoint: <ComputerIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        server: <ComputerIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />, // Alias for host/endpoint
        switch: <SettingsEthernetIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        bridge: <SettingsEthernetIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />,
        'l3 switch': <SettingsEthernetIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />, // Handle multi-word types
        wifi: <NetworkWifiIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />, // Example for Wifi type
        // Add more specific checks based on your network device types
    };

    // Find the first matching key in the map
    const matchedKey = Object.keys(iconMap).find(key => lowerType.includes(key));

    return matchedKey ? iconMap[matchedKey] : <DeviceUnknownIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />;
};

/**
 * Displays information for a single hop in a network trace visualization.
 * Shows primary identifier (hostname/IP/MAC), secondary info (IP/MAC/Type),
 * and provides a popover for detailed information. Handles reversed display
 * and highlights matching IPs in comparison mode.
 */
const HopDisplay = ({
    hopData,
    isFirst,
    isLast,
    isReversed = false,
    isHighlightingActive = false, // Is highlighting mode enabled?
    highlightedIPs = new Set()    // Set of IPs to highlight if mode is active
}) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    // --- Validate hopData ---
    if (!hopData) {
        console.warn('HopDisplay received null or undefined hopData.');
        return null; // Or render an error/placeholder state
    }

    // --- Extract Data ---
    const { hop, ip, type, hostname, device_id, mac, rtt, ...otherDetails } = hopData;
    const hopNumber = typeof hop === 'number' ? hop : '?';

    // --- Prepare Details for Popover ---
    const allDetails = {
        IP: ip, MAC: mac, Type: type, Hostname: hostname, RTT: rtt ? `${rtt} ms` : undefined, Device_ID: device_id,
        // Include other details from hopData, potentially filtering known ones already displayed
        ...otherDetails,
    };
    const detailsToShow = Object.entries(allDetails).filter(([key, value]) => value != null && value !== '');

    // --- Determine Display Text ---
    const primaryDisplay = hostname || ip || mac || 'Unknown Device';
    let secondaryDisplay = null;
    if (hostname && (ip || mac)) { secondaryDisplay = ip || mac; }
    else if ((ip || mac) && type) { secondaryDisplay = type; }

    const popoverId = open ? `hop-popover-${hopNumber}-${ip || mac || 'unknown'}` : undefined;

    // --- Arrow Rendering Logic ---
    // Determine which arrow to show and whether to show it based on isReversed
    const showForwardArrow = !isReversed && !isFirst;
    const showBackwardArrow = isReversed && !isLast; // Show after if reversed and not the last *visual* item

    const arrowProps = {
        'aria-hidden': "true", // Decorative element
        sx: {
            mx: { xs: 0.5, sm: 1 },
            color: 'text.secondary',
            fontSize: { xs: '1rem', sm: '1.2rem' },
            flexShrink: 0,
        }
    };

    // --- Highlighting Logic ---
    const shouldHighlight = isHighlightingActive && ip && highlightedIPs.has(ip);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {/* Arrow Connector BEFORE (Normal Mode) */}
            {showForwardArrow && <ArrowForwardIcon {...arrowProps} />}

            {/* Hop Information Paper */}
            <Paper
                elevation={1}
                variant="outlined"
                sx={{
                    p: 1.5,
                    minWidth: 180,
                    maxWidth: 250,
                    textAlign: 'center',
                    position: 'relative', // For absolute positioning of button
                    borderRadius: 1.5, // Slightly more rounded corners
                    flexShrink: 0, // Prevent paper from shrinking excessively
                    overflow: 'hidden', // Ensure content fits
                    transition: 'background-color 0.3s ease, border-color 0.3s ease', // Smooth transition for highlight
                    // Apply highlight styles conditionally using theme-aware colors
                    bgcolor: shouldHighlight ? (theme) => alpha(theme.palette.warning.light, 0.4) : undefined, // Use light warning bg from theme
                    borderColor: shouldHighlight ? 'warning.main' : undefined, // Use main warning color for border
                    // Optional: Add more emphasis like box shadow
                    // boxShadow: shouldHighlight ? (theme) => `0 0 0 2px ${theme.palette.warning.main}` : undefined,
                }}
            >
                {/* Details Button (only show if there are details) */}
                {detailsToShow.length > 0 && (
                    <Tooltip title="Show Details">
                        <span>
                            <IconButton
                                aria-label={`Show details for hop ${hopNumber}`}
                                size="small"
                                onClick={handlePopoverOpen}
                                aria-describedby={popoverId}
                                sx={{
                                    position: 'absolute', top: 4, right: 4, p: '2px', color: 'action.active',
                                }}
                            >
                                <InfoOutlinedIcon fontSize="inherit" />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {/* Stack for vertical layout of hop info */}
                <Stack spacing={0.5} alignItems="center" sx={{ pt: detailsToShow.length > 0 ? 1.5 : 0 }}>
                    {/* Hop Number Chip */}
                    <Chip label={`Hop ${hopNumber}`} size="small" variant="outlined" color="primary" sx={{ mb: 0.5, height: 20, fontSize: '0.7rem', fontWeight: 'medium' }} />
                    {/* Primary Display */}
                    <Tooltip title={primaryDisplay} enterDelay={1000}>
                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.3 }}> {primaryDisplay} </Typography>
                    </Tooltip>
                    {/* Secondary Display */}
                    {secondaryDisplay && (
                        <Tooltip title={secondaryDisplay} enterDelay={1000}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', wordBreak: 'break-all', lineHeight: 1.2 }}> {secondaryDisplay} </Typography>
                        </Tooltip>
                    )}
                    {/* Type Chip */}
                    {type && secondaryDisplay !== type && (
                        <Chip icon={getTypeIcon(type)} label={type} size="small" variant="filled" color="default" sx={{ mt: 0.5, fontSize: '0.7rem', height: 'auto', maxWidth: 'calc(100% - 16px)', '& .MuiChip-icon': { fontSize: '0.8rem', ml: 0.5 }, '& .MuiChip-label': { px: 0.8, py: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' } }} />
                    )}
                </Stack>
            </Paper>

            {/* Arrow Connector AFTER (Reversed Mode) */}
            {showBackwardArrow && <ArrowBackIcon {...arrowProps} />}

            {/* Popover for Additional Details */}
            <Popover
                id={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                slotProps={{ paper: { elevation: 4, sx: { maxWidth: 350, p: 0, borderRadius: 1.5, border: (theme) => `1px solid ${theme.palette.divider}`, } } }}
            >
                <Box>
                    <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 1, fontWeight: 'bold' }}> Hop {hopNumber} Details </Typography>
                    <Divider />
                    <List dense disablePadding sx={{ maxHeight: 350, overflowY: 'auto' }}>
                        {detailsToShow.map(([key, value]) => (
                            <ListItem key={key} dense divider sx={{ py: 0.8, alignItems: 'flex-start' }}>
                                <ListItemText
                                    primary={formatDetailKey(key)}
                                    secondary={ typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value) }
                                    primaryTypographyProps={{ variant: 'caption', fontWeight: 'medium', color: 'text.secondary', component: 'div', }}
                                    secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', sx: { whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.3, } }}
                                    sx={{ my: 0 }}
                                />
                            </ListItem>
                        ))}
                        {detailsToShow.length === 0 && (
                            <ListItem dense> <ListItemText secondary="No additional details available." secondaryTypographyProps={{ variant: 'caption', fontStyle: 'italic', textAlign: 'center' }} /> </ListItem>
                        )}
                    </List>
                </Box>
            </Popover>
        </Box>
    );
};

// Define PropTypes for type checking and documentation
HopDisplay.propTypes = {
    hopData: PropTypes.shape({
        hop: PropTypes.number.isRequired,
        ip: PropTypes.string,
        mac: PropTypes.string,
        hostname: PropTypes.string,
        type: PropTypes.string,
        rtt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        // Add other expected fields if possible
    }).isRequired,
    isFirst: PropTypes.bool, // Is it the first *visual* item in the current sequence?
    isLast: PropTypes.bool,  // Is it the last *visual* item in the current sequence?
    isReversed: PropTypes.bool, // Is the overall trace display reversed?
    isHighlightingActive: PropTypes.bool, // Is IP highlighting mode active?
    highlightedIPs: PropTypes.instanceOf(Set), // Set of IPs to potentially highlight
};

// Default props for flags
HopDisplay.defaultProps = {
    isFirst: false,
    isLast: false,
    isReversed: false,
    isHighlightingActive: false,
    highlightedIPs: new Set(),
};


export default HopDisplay;

// ----- End File: src\components\RouteTrace\HopDisplay.jsx -----
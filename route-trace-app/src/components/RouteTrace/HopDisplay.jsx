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
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
 * and provides a popover for detailed information.
 */
const HopDisplay = ({ hopData, isFirst, isLast }) => {
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
        // Optionally return null or a placeholder if data is missing
        console.warn('HopDisplay received null or undefined hopData.');
        return null; // Or render an error/placeholder state
    }

    // --- Extract Data ---
    // Destructure known fields and collect the rest
    const {
        hop, // Required: The hop number
        ip,
        type,
        hostname,
        destination_network,
        vrf,
        destination_dg_ip,
        mpls_label,
        passed_firewall,
        device_id,
        destination_mac,
        next_hop_interface,
        nexthop_int_ip,
        mac,
        rtt, // Example: Include round-trip time if available
        // Collect any other properties passed in hopData
        ...otherDetails
    } = hopData;

    // Ensure hop number is present, default if necessary (though ideally it should always exist)
    const hopNumber = typeof hop === 'number' ? hop : '?';

    // --- Prepare Details for Popover ---
    // Combine explicitly listed fields (for order/importance) with other details
    const allDetails = {
        // Explicitly list fields likely to be useful in popover, controlling order
        IP: ip,
        MAC: mac,
        Type: type,
        Hostname: hostname,
        RTT: rtt ? `${rtt} ms` : undefined, // Format RTT if present
        Device_ID: device_id,
        VRF: vrf,
        Destination_Network: destination_network,
        Next_Hop_Interface: next_hop_interface,
        Nexthop_Interface_IP: nexthop_int_ip,
        Destination_MAC: destination_mac,
        Destination_DG_IP: destination_dg_ip,
        MPLS_Label: mpls_label,
        Passed_Firewall: passed_firewall, // Booleans will be handled later
        ...otherDetails, // Include any other non-null/empty fields dynamically
    };

    // Filter out null, undefined, or empty string values
    const detailsToShow = Object.entries(allDetails)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '');


    // --- Determine Display Text ---
    // Primary: Hostname > IP > MAC > 'Unknown Device'
    const primaryDisplay = hostname || ip || mac || 'Unknown Device';
    // Secondary:
    // - If hostname is primary: Show IP or MAC
    // - If IP/MAC is primary: Show Type if available
    // - Otherwise: null
    let secondaryDisplay = null;
    if (hostname && (ip || mac)) {
        secondaryDisplay = ip || mac; // Show IP first if both exist
    } else if ((ip || mac) && type) {
        secondaryDisplay = type;
    }

    // Unique ID for ARIA attributes
    const popoverId = open ? `hop-popover-${hopNumber}-${ip || mac || 'unknown'}` : undefined;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {/* Arrow Connector (conditionally rendered) */}
            {!isFirst && (
                <ArrowForwardIcon
                    aria-hidden="true" // Decorative element
                    sx={{
                        mx: { xs: 0.5, sm: 1 }, // Responsive margin
                        color: 'text.secondary',
                        fontSize: { xs: '1rem', sm: '1.2rem' }, // Responsive size
                        flexShrink: 0, // Prevent arrow from shrinking
                    }}
                />
            )}

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
                }}
            >
                {/* Details Button (only show if there are details) */}
                {detailsToShow.length > 0 && (
                    <Tooltip title="Show Details">
                        {/* Position wrapper for Tooltip when button is disabled */}
                        <span>
                            <IconButton
                                aria-label={`Show details for hop ${hopNumber}`}
                                size="small"
                                onClick={handlePopoverOpen}
                                aria-describedby={popoverId}
                                // disabled={detailsToShow.length === 0} // Disabled state handled by conditional render
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    p: '2px',
                                    color: 'action.active', // Use theme color
                                    '&:hover': {
                                        // Optional: slightly darker on hover
                                        // backgroundColor: 'action.hover',
                                    },
                                }}
                            >
                                <InfoOutlinedIcon fontSize="inherit" />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {/* Stack for vertical layout of hop info */}
                <Stack spacing={0.5} alignItems="center" sx={{ pt: detailsToShow.length > 0 ? 1.5 : 0 }}> {/* Add padding top if info icon exists */}
                    {/* Hop Number Chip */}
                    <Chip
                        label={`Hop ${hopNumber}`}
                        size="small"
                        variant="outlined"
                        color="primary" // Add subtle color
                        sx={{ mb: 0.5, height: 20, fontSize: '0.7rem', fontWeight: 'medium' }}
                    />

                    {/* Primary Display (Hostname or IP/MAC) */}
                    <Tooltip title={primaryDisplay} enterDelay={1000}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 500,
                                wordBreak: 'break-all', // Important for long names/IPs
                                lineHeight: 1.3,
                                // Optional: Add ellipsis for overflow if preferred
                                // whiteSpace: 'nowrap',
                                // overflow: 'hidden',
                                // textOverflow: 'ellipsis',
                                // maxWidth: '100%', // Needed for ellipsis
                            }}
                        >
                            {primaryDisplay}
                        </Typography>
                    </Tooltip>

                    {/* Secondary Display (IP/MAC or Type) */}
                    {secondaryDisplay && (
                        <Tooltip title={secondaryDisplay} enterDelay={1000}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    display: 'block',
                                    wordBreak: 'break-all',
                                    lineHeight: 1.2,
                                    // Optional: Ellipsis for secondary display too
                                    // whiteSpace: 'nowrap',
                                    // overflow: 'hidden',
                                    // textOverflow: 'ellipsis',
                                    // maxWidth: '100%',
                                }}
                            >
                                {secondaryDisplay}
                            </Typography>
                        </Tooltip>
                    )}

                    {/* Chip for Type (if type exists and wasn't shown as secondary) */}
                    {type && secondaryDisplay !== type && (
                        <Chip
                            icon={getTypeIcon(type)}
                            label={type}
                            size="small"
                            variant="filled" // Filled emphasizes type info
                            color="default" // Or another appropriate color
                            sx={{
                                mt: 0.5,
                                fontSize: '0.7rem',
                                height: 'auto', // Auto height for variable content
                                maxWidth: 'calc(100% - 16px)', // Prevent chip overflowing Paper padding
                                '& .MuiChip-icon': { fontSize: '0.8rem', ml: 0.5 },
                                '& .MuiChip-label': {
                                    px: 0.8,
                                    py: 0.2,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block', // Ensure label respects width
                                }
                            }}
                        />
                    )}
                </Stack>
            </Paper>

            {/* Popover for Additional Details */}
            <Popover
                id={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                slotProps={{
                    paper: {
                        elevation: 4,
                        sx: {
                            maxWidth: 350,
                            p: 0, // Padding handled by ListItems
                            borderRadius: 1.5,
                            border: (theme) => `1px solid ${theme.palette.divider}`, // Subtle border
                        }
                    }
                }}
            >
                {/* Box containing Popover content */}
                <Box>
                    <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 1, fontWeight: 'bold' }}>
                        Hop {hopNumber} Details
                    </Typography>
                    <Divider />
                    <List dense disablePadding sx={{ maxHeight: 350, overflowY: 'auto' }}> {/* Increased max height */}
                        {detailsToShow.map(([key, value]) => (
                            <ListItem key={key} dense divider sx={{ py: 0.8, alignItems: 'flex-start' }}> {/* Align items start for long secondary text */}
                                <ListItemText
                                    primary={formatDetailKey(key)}
                                    secondary={
                                        // Handle boolean display explicitly
                                        typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value) // Ensure value is string for display
                                    }
                                    primaryTypographyProps={{
                                        variant: 'caption',
                                        fontWeight: 'medium',
                                        color: 'text.secondary',
                                        component: 'div', // Allow wrapping if needed
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'body2',
                                        color: 'text.primary',
                                        sx: {
                                            whiteSpace: 'pre-wrap', // Preserve whitespace and wrap
                                            wordBreak: 'break-all', // Break long strings
                                            lineHeight: 1.3, // Adjust line height for readability
                                        }
                                    }}
                                    sx={{ my: 0 }} // Reset default margins
                                />
                            </ListItem>
                        ))}
                        {/* Fallback message if filtering somehow removed all details (unlikely with current logic) */}
                        {detailsToShow.length === 0 && (
                            <ListItem dense>
                                <ListItemText secondary="No additional details available." secondaryTypographyProps={{ variant: 'caption', fontStyle: 'italic', textAlign: 'center' }} />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Popover>
        </Box>
    );
};

// Define PropTypes for type checking and documentation
HopDisplay.propTypes = {
    /**
     * The data object for the hop. Requires at least a 'hop' number.
     * Other fields like 'ip', 'hostname', 'type', etc., are used if present.
     */
    hopData: PropTypes.shape({
        hop: PropTypes.number.isRequired,
        ip: PropTypes.string,
        mac: PropTypes.string,
        hostname: PropTypes.string,
        type: PropTypes.string,
        rtt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        // Add other expected fields as needed
    }).isRequired,
    /**
     * Flag indicating if this is the first hop in the sequence (hides the preceding arrow).
     */
    isFirst: PropTypes.bool,
    /**
     * Flag indicating if this is the last hop in the sequence (currently unused but good practice).
     */
    isLast: PropTypes.bool,
};

// Default props for flags
HopDisplay.defaultProps = {
    isFirst: false,
    isLast: false,
};


export default HopDisplay;
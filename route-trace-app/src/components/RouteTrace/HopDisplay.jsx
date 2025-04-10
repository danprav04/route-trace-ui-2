// src/components/RouteTrace/HopDisplay.jsx
import React, { useState } from 'react';
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
    Tooltip
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Helper to format keys for display
const formatDetailKey = (key) => {
  return key
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/([A-Z])/g, ' $1') // Add space before capitals (for camelCase)
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

const HopDisplay = ({ hopData, isFirst, isLast }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? `hop-popover-${hopData.hop}-${hopData.ip}` : undefined;

  // --- Extract Data ---
  // Destructure all potential fields from the DetailedHop model
  const {
    hop,
    ip,
    type,
    hostname,
    destination_network,
    vrf,
    destination_dg_ip,
    mpls_label,
    passed_firewall,
    device_id, // Note: comes from 'id_' alias in backend model
    destination_mac,
    next_hop_interface,
    nexthop_int_ip,
    ...otherDetails // Collect any unexpected extra fields
  } = hopData;

  // --- Prepare Details for Popover ---
  // Filter out null/undefined and primary display fields
  const detailsToShow = Object.entries({
    hostname, // Show hostname again in details if it exists
    destination_network,
    vrf,
    destination_dg_ip,
    mpls_label,
    passed_firewall,
    device_id,
    destination_mac,
    next_hop_interface,
    nexthop_int_ip,
    ...otherDetails
  }).filter(([key, value]) => value !== null && value !== undefined && value !== '');

  // Determine primary display text (Hostname if available, otherwise IP/MAC)
  const primaryDisplay = hostname || ip || 'N/A';
  const secondaryDisplay = hostname && ip ? ip : (type || 'Unknown Type'); // Show IP/MAC if hostname is primary, else show Type

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      {!isFirst && <ArrowForwardIcon sx={{ mx: 0.5, color: 'text.secondary', fontSize: '1.2rem' }} />}
      <Paper
        elevation={2}
        sx={{
          p: 1, // Reduced padding slightly
          minWidth: 160, // Slightly wider min-width
          textAlign: 'center',
          position: 'relative', // Needed for absolute positioning of button
          mr: 0.5, // Margin between paper and next arrow
        }}
      >
        {/* Hop Number Chip */}
        <Chip label={`Hop ${hop}`} size="small" variant="outlined" sx={{ mb: 0.5 }} />

        {/* Primary Display (Hostname or IP/MAC) */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            wordBreak: 'break-all', // Break long hostnames/IPs
            lineHeight: 1.2,
            mb: 0.2,
          }}
        >
          {primaryDisplay}
        </Typography>

        {/* Secondary Display (IP/MAC or Type) */}
        <Typography
          variant="caption" // Smaller font for secondary info
          sx={{
            color: 'text.secondary',
            display: 'block',
            wordBreak: 'break-all',
            lineHeight: 1.1,
          }}
        >
          {secondaryDisplay}
        </Typography>

         {/* Chip for Type if not already shown */}
         {type && secondaryDisplay !== type && (
             <Chip label={type} size="small" sx={{ mt: 0.5, fontSize: '0.65rem', height: '18px' }} />
         )}


        {/* Details Button */}
        {detailsToShow.length > 0 && (
          <Tooltip title="Show Details">
            <IconButton
              aria-label="show details"
              size="small"
              onClick={handlePopoverOpen}
              aria-describedby={id}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                p: '2px', // Small padding
              }}
            >
              <InfoOutlinedIcon fontSize="inherit" sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Paper>

      {/* Popover for Details */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{ // Use slotProps for Paper styling
             paper: {
                sx: { maxWidth: 350, p: 0 } // Padding handled by ListItems
             }
        }}
      >
        <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ px: 2, pt: 1, pb: 0.5 }}>Hop {hop} Details</Typography>
            <Divider />
            <List dense disablePadding>
            {detailsToShow.map(([key, value]) => (
                <ListItem key={key} dense divider sx={{py: 0.5}}>
                    <ListItemText
                        primary={formatDetailKey(key)}
                        secondary={
                            // Handle boolean display
                            typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                            // Handle potentially long strings
                            (typeof value === 'string' && value.length > 50 ? `${value.substring(0, 50)}...` : value)
                        }
                        primaryTypographyProps={{ variant: 'caption', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption', color: 'text.primary', sx: { whiteSpace: 'pre-wrap', wordBreak: 'break-all' } }}
                        sx={{ my: 0 }}
                     />
                </ListItem>
            ))}
             {detailsToShow.length === 0 && (
                 <ListItem dense>
                     <ListItemText secondary="No additional details available." secondaryTypographyProps={{ variant: 'caption' }} />
                 </ListItem>
             )}
            </List>
        </Box>
      </Popover>
    </Box>
  );
};

export default HopDisplay;
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
    Tooltip, // Added Tooltip
    useTheme, // Import useTheme hook
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
// Icons for trace types
import RouteIcon from '@mui/icons-material/Route'; // Combined Trace
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'; // MAC Trace
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'; // Direct Route Trace
// Use the universal visualizer for details
import HistoryTraceVisualizer from '../Comparison/HistoryTraceVisualizer'; // Adjusted path if needed
import { formatTimestamp } from '../../utils/formatters';

const getTraceTypeIcon = (type) => {
    switch (type) {
        case 'combined': return <Tooltip title="Combined Trace"><RouteIcon fontSize="inherit" color="primary" /></Tooltip>;
        case 'direct': return <Tooltip title="Direct Trace"><NetworkCheckIcon fontSize="inherit" color="secondary" /></Tooltip>;
        case 'mac': return <Tooltip title="MAC Trace"><SettingsEthernetIcon fontSize="inherit" color="success" /></Tooltip>;
        default: return null;
    }
};

const HistoryItem = ({ route }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme(); // Access theme for colors/spacing
  const {
      id, source, destination, timestamp, user, trace_type,
      mainRouteTrace, sourceMacTrace, destinationMacTrace, inputDetails
    } = route; // Use processed data

  const handleClick = () => {
    setOpen(!open);
  };

  // Check if there are details to expand
  const hasDetails = (mainRouteTrace && mainRouteTrace.length > 0) ||
                     (sourceMacTrace && sourceMacTrace.length > 0) ||
                     (destinationMacTrace && destinationMacTrace.length > 0) ||
                     (inputDetails && Object.keys(inputDetails).length > 0);

  // Determine primary identifiers based on trace type for header display
  const primarySourceLabel = trace_type === 'direct' ? "Src GW" : (trace_type === 'mac' ? "Endpoint" : "Src IP");
  const primaryDestLabel = trace_type === 'direct' ? "Dst GW" : (trace_type === 'mac' ? "Gateway" : "Dst IP");
  const separator = trace_type === 'mac' ? '↔' : '→';

  return (
    <>
      {/* Main List Item Header */}
      <ListItem
         button={hasDetails} // Use button prop only if there are details to expand
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
                  {/* Source -> Destination & Type */}
                  <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                       <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                           {/* Trace Type Icon */}
                            {getTraceTypeIcon(trace_type)}
                            {/* Source */}
                            <Chip label={primarySourceLabel} size="small" color="primary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                            <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{source || 'N/A'}</Typography>
                             {/* Arrow / Separator */}
                            <Typography component="span" sx={{ mx: 1 }}>{separator}</Typography>
                             {/* Destination */}
                            <Chip label={primaryDestLabel} size="small" color="secondary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                            <Typography component="span" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>{destination || 'N/A'}</Typography>
                       </Typography>
                       {/* Optional: Display VRF from inputDetails if present */}
                       {inputDetails?.vrf && (
                           <Chip label={`VRF: ${inputDetails.vrf}`} size="small" variant='outlined' color="info" sx={{ height: 20, fontSize: '0.7rem', alignSelf: 'flex-start' }} />
                       )}
                  </Stack>

                  {/* User/Timestamp/ID */}
                  <Stack direction="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} sx={{ minWidth: '160px', textAlign: {xs: 'left', sm: 'right'} }}>
                     {user && <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>User: {user.username}</Typography>}
                     <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>{formatTimestamp(timestamp, 'PPp')}</Typography> {/* Readable format */}
                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.7, lineHeight: 1.3 }}>(ID: {id})</Typography>
                  </Stack>
             </Stack>
            }
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
        <Box sx={{ px: {xs: 1, sm: 2}, py: 1.5, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
            {/* Render the universal visualizer with the full route object */}
            <HistoryTraceVisualizer route={route} />
        </Box>
      </Collapse>
    </>
  );
};

export default HistoryItem;
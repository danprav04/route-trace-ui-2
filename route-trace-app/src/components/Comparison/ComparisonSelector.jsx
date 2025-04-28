import React from 'react';
import { Autocomplete, TextField, Checkbox, Box, Typography, Chip, Stack, Paper, Tooltip } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RouteIcon from '@mui/icons-material/Route'; // Combined Trace
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'; // MAC Trace
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'; // Direct Route Trace
import { formatTimestamp } from '../../utils/formatters';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const getTraceTypeIcon = (type) => {
    switch (type) {
        case 'combined': return <Tooltip title="Combined Trace"><RouteIcon fontSize="inherit" color="primary" /></Tooltip>;
        case 'direct': return <Tooltip title="Direct Trace"><NetworkCheckIcon fontSize="inherit" color="secondary" /></Tooltip>;
        case 'mac': return <Tooltip title="MAC Trace"><SettingsEthernetIcon fontSize="inherit" color="success" /></Tooltip>;
        default: return null;
    }
};

const ComparisonSelector = ({ availableRoutes, selectedIds, onChange }) => {

    // Find the full route objects corresponding to the selected IDs for the Autocomplete value prop
    const selectedRoutes = availableRoutes.filter(route => selectedIds.includes(route.id));

    // Sort available routes: Create a copy first! Sort newest first.
    const sortedOptions = [...availableRoutes].sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : 0;
        const dateB = b.timestamp ? new Date(b.timestamp) : 0;
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA; // Newest first
    });

    const getOptionLabel = (option) => {
        // Label primarily used for filtering/searching, keep it concise and include type
        const user = option.user ? `${option.user.username}` : 'N/A';
        return `[${option.trace_type?.toUpperCase()}] ${option.source || '?'} -> ${option.destination || '?'} (${user}, ID: ${option.id})`;
    };

    const handleChange = (event, newValue) => {
        // Extract just the IDs from the selected route objects
        const newSelectedIds = newValue.map(route => route.id);
        onChange(newSelectedIds);
    };

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Select Historical Traces to Compare
            </Typography>
            <Autocomplete
                multiple
                id="route-comparison-selector"
                options={sortedOptions} // Use the sorted COPY
                value={selectedRoutes} // Pass the selected route *objects*
                getOptionLabel={getOptionLabel} // Function for text value and filtering
                isOptionEqualToValue={(option, value) => option.id === value.id} // Crucial for matching objects
                onChange={handleChange}
                disableCloseOnSelect // Keep dropdown open when selecting multiple items
                renderOption={(props, option, { selected }) => (
                    // Use the li element provided by props for accessibility
                    <li {...props} key={option.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 16px' }}>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8, marginTop: -6 }} // Align checkbox nicely
                            checked={selected}
                            size="small"
                        />
                        {/* Use Stack for better layout of option details */}
                        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                             {/* Main route identifier with Chips */}
                             <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                {/* Indicate Trace Type */}
                                {getTraceTypeIcon(option.trace_type)}
                                {/* Source */}
                                <Chip label={option.trace_type === 'direct' ? "Src GW" : (option.trace_type === 'mac' ? "Endpoint" : "Src IP")} size="small" color="primary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                                <Typography component="span" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>{option.source || '?'}</Typography>
                                {/* Arrow / Separator */}
                                <Typography component="span" sx={{ mx: 0.5 }}>{option.trace_type === 'mac' ? '↔' : '→'}</Typography>
                                 {/* Destination */}
                                <Chip label={option.trace_type === 'direct' ? "Dst GW" : (option.trace_type === 'mac' ? "Gateway" : "Dst IP")} size="small" color="secondary" variant="outlined" sx={{ height: 'auto', '& .MuiChip-label': { px: 0.8, py: 0.2, fontSize: '0.7rem' } }} />
                                <Typography component="span" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>{option.destination || '?'}</Typography>
                             </Typography>
                             {/* Secondary details: Timestamp, User, ID */}
                             <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(option.timestamp, 'PPp')} {/* More readable format */}
                                {option.user ? ` • ${option.user.username}` : ''}
                                <span style={{ marginLeft: '8px', opacity: 0.7 }}>(ID: {option.id})</span>
                             </Typography>
                        </Stack>
                    </li>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Search or Select Traces (Combined, Direct, MAC)"
                        placeholder={selectedRoutes.length > 0 ? `${selectedRoutes.length} selected` : "Select from history..."}
                        InputLabelProps={{ shrink: true }} // Keep label shrunk
                    />
                )}
                sx={{ width: '100%' }} // Make Autocomplete full width
            />
            {selectedRoutes.length > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    Currently comparing {selectedRoutes.length} trace{selectedRoutes.length > 1 ? 's' : ''}.
                </Typography>
            )}
        </Paper>
    );
};

export default ComparisonSelector;
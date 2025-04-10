// ----- File: src/components/Comparison/ComparisonSelector.jsx -----

import React from 'react';
import { Autocomplete, TextField, Checkbox, Box, Typography, Chip } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { formatTimestamp } from '../../utils/formatters';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ComparisonSelector = ({ availableRoutes, selectedIds, onChange }) => {

    // Find the route objects corresponding to the selected IDs
    const selectedRoutes = availableRoutes.filter(route => selectedIds.includes(route.id));

    // --- FIX: Create a copy before sorting ---
    // Use the spread syntax (...) to create a shallow copy of the array
    const sortedOptions = [...availableRoutes].sort((a, b) => {
        // Robust date comparison
        const dateA = a.timestamp ? new Date(a.timestamp) : 0;
        const dateB = b.timestamp ? new Date(b.timestamp) : 0;
        // Ensure valid dates are compared; handle potential invalid dates gracefully
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1; // Put invalid dates last
        if (isNaN(dateB)) return -1; // Put invalid dates last
        return dateB - dateA; // Sort newest first
    });
    // --- End FIX ---

    const getOptionLabel = (option) => {
        // Generate a descriptive label for each route in the dropdown
        const user = option.user ? `User: ${option.user.username}` : 'N/A';
        const time = formatTimestamp(option.timestamp, 'MMM d, HH:mm');
        return `${option.source || 'N/A'} → ${option.destination || 'N/A'} (${time}, ${user}, ID: ${option.id})`;
    };

    const handleChange = (event, newValue) => {
        // Extract just the IDs from the selected route objects
        const newSelectedIds = newValue.map(route => route.id);
        onChange(newSelectedIds);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Select Routes to Compare</Typography>
            <Autocomplete
                multiple
                id="route-comparison-selector"
                options={sortedOptions} // <-- Use the sorted COPY
                disableCloseOnSelect
                value={selectedRoutes} // Pass the selected route *objects* to Autocomplete
                getOptionLabel={getOptionLabel} // Function to display each option
                isOptionEqualToValue={(option, value) => option.id === value.id} // How to compare options
                onChange={handleChange} // Handle changes
                renderOption={(props, option, { selected }) => (
                    // Ensure the key is unique and stable if possible, using option.id
                    <li {...props} key={option.id} style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                            // Add aria-labelledby or similar for accessibility if needed
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                             {/* Main route identifier */}
                             <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.3 }}>
                                <Chip label="Src" size="small" color="primary" sx={{ mr: 0.5, height: '18px', verticalAlign: 'middle' }} />
                                <Typography component="span" sx={{ fontWeight: 'medium', verticalAlign: 'middle' }}>{option.source || 'N/A'}</Typography>
                                <Typography component="span" sx={{ mx: 1, verticalAlign: 'middle' }}>→</Typography>
                                <Chip label="Dst" size="small" color="secondary" sx={{ mr: 0.5, height: '18px', verticalAlign: 'middle' }} />
                                <Typography component="span" sx={{ fontWeight: 'medium', verticalAlign: 'middle' }}>{option.destination || 'N/A'}</Typography>
                             </Typography>
                             {/* Secondary details: Timestamp, User, ID */}
                             <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(option.timestamp)} {option.user ? `(${option.user.username})` : ''} (ID: {option.id})
                             </Typography>
                        </Box>
                    </li>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Search and Select Historical Traces"
                        placeholder="Select Routes..."
                        // InputLabelProps={{ shrink: true }} // Optional: always show label shrunk
                    />
                )}
                sx={{ width: '100%' }} // Make it full width
            />
        </Box>
    );
};

export default ComparisonSelector;

// ----- End File: src/components/Comparison/ComparisonSelector.jsx -----
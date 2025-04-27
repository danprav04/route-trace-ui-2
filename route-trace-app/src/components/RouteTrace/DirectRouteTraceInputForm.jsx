// ----- File: src\components\RouteTrace\DirectRouteTraceInputForm.jsx -----
// ----- File: src\components\RouteTrace\DirectRouteTraceInputForm.jsx -----
import React from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Grid, CircularProgress, Tooltip, Typography, Paper } from '@mui/material'; // Added Paper
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import { updateDirectTraceInput, performDirectRouteTrace } from '../../store/slices/directRouteSlice';
import ErrorMessage from '../Common/ErrorMessage';

const DirectRouteTraceInputForm = ({ trace }) => {
  const dispatch = useDispatch();
  const {
    id: traceId,
    sourceDg, destinationDg, vrf,
    traceStatus, error
  } = trace;

  const handleInputChange = (field) => (event) => {
    dispatch(updateDirectTraceInput({ traceId, field, value: event.target.value }));
  };

  const handleTrace = () => {
    if (!sourceDg || !destinationDg || !vrf) {
        return;
    }
    dispatch(performDirectRouteTrace({ traceId, sourceDg, destinationDg, vrf }));
  };

  const isTracing = traceStatus === 'loading';
  const traceError = error && traceStatus === 'failed';

  // Validation checks for visual error state and button disabling
  const canTrace = sourceDg && destinationDg && vrf && !isTracing;
  const vrfError = (!vrf && (sourceDg || destinationDg)) || (!!error && error.includes("VRF Name"));
  const sourceDgError = !!error && error.includes("Source Gateway IP");
  const destDgError = !!error && error.includes("Destination Gateway IP");

  // Use a consistent helper text space or remove it entirely if not needed often
  const defaultHelperText = " "; // Reserve space even when no text

  return (
    // Wrap form content in Paper for visual grouping like the image
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 1.5, backgroundColor: 'action.hover' }}>
        <Box component="form" noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); if(canTrace) handleTrace(); }}>
            {/* Display general trace errors inside the Paper, above the inputs */}
            {traceError && <ErrorMessage error={error} title="Trace Error" />}

            {/* Grid container for Source/Destination Gateway side-by-side */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 2 }}> {/* Add bottom margin */}
                {/* Source Gateway Column */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                        Source Gateway
                    </Typography>
                    <TextField
                        label="Source Gateway IP *" // Add asterisk in label
                        value={sourceDg}
                        onChange={handleInputChange('sourceDg')}
                        variant="outlined"
                        fullWidth
                        required // HTML5 required (though validation mainly in JS/Thunk)
                        disabled={isTracing}
                        margin="dense"
                        error={sourceDgError}
                        helperText={sourceDgError ? "Required" : "Enter the starting Gateway IP for the trace"}
                    />
                </Grid>

                {/* Destination Gateway Column */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'secondary.main', fontWeight: 'medium' }}>
                        Destination Gateway
                    </Typography>
                    <TextField
                        label="Destination Gateway IP *" // Add asterisk in label
                        value={destinationDg}
                        onChange={handleInputChange('destinationDg')}
                        variant="outlined"
                        fullWidth
                        required
                        disabled={isTracing}
                        margin="dense"
                        error={destDgError}
                        helperText={destDgError ? "Required" : "Enter the ending Gateway IP for the trace"}
                    />
                </Grid>
            </Grid>

            {/* VRF Input - Full width below the gateway columns */}
            <Box sx={{ mb: 3 }}> {/* Add bottom margin before button */}
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
                     VRF Name
                </Typography>
                <TextField
                    label="VRF Name *" // Add asterisk in label
                    value={vrf || ''}
                    onChange={handleInputChange('vrf')}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                    margin="dense"
                    error={vrfError}
                    helperText={vrfError ? "Required" : "Specify the VRF context for this trace (Required)"}
                />
            </Box>

            {/* Trace Button - Centered */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Tooltip title={!canTrace ? "Please fill in all required fields (Source/Dest Gateway IP, VRF)" : "Run direct trace"}>
                    <span> {/* Wrap button for tooltip when disabled */}
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={isTracing ? <CircularProgress size={20} color="inherit" /> : <NetworkCheckIcon />}
                            onClick={handleTrace}
                            disabled={!canTrace}
                            type="submit" // Allow form submission via Enter key
                            sx={{ minWidth: 180 }} // Give button a minimum width
                        >
                            {isTracing ? 'Tracing...' : 'Trace Direct Route'}
                        </Button>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    </Paper>
  );
};

export default DirectRouteTraceInputForm;
// ----- End File: src\components\RouteTrace\DirectRouteTraceInputForm.jsx -----
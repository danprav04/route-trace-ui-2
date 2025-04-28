// ----- File: src\components\RouteTrace\DirectRouteTraceInputForm.jsx -----

// ----- File: src\components\RouteTrace\DirectRouteTraceInputForm.jsx -----
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Grid, CircularProgress, Tooltip, Typography, Paper } from '@mui/material';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import { updateDirectTraceInput, performDirectRouteTrace } from '../../store/slices/directRouteSlice';
import ErrorMessage from '../Common/ErrorMessage';
import { isValidIPv4 } from '../../utils/validators'; // Import the validator

const DirectRouteTraceInputForm = ({ trace }) => {
  const dispatch = useDispatch();
  const {
    id: traceId,
    sourceDg: reduxSourceDg, // Rename Redux state variables
    destinationDg: reduxDestDg,
    vrf: reduxVrf,
    traceStatus,
    error: reduxError // Rename Redux error
  } = trace;

  // --- Local State for Input and Validation ---
  const [sourceDg, setSourceDg] = useState(reduxSourceDg || '');
  const [destinationDg, setDestinationDg] = useState(reduxDestDg || '');
  const [vrf, setVrf] = useState(reduxVrf || '');
  const [errors, setErrors] = useState({}); // Local validation errors: { sourceDg: '...', destinationDg: '...', vrf: '...' }

  // Keep local state in sync with Redux state if it changes externally (e.g., reset)
  useEffect(() => {
    setSourceDg(reduxSourceDg || '');
    setDestinationDg(reduxDestDg || '');
    setVrf(reduxVrf || '');
  }, [reduxSourceDg, reduxDestDg, reduxVrf]);


  // --- Validation Function ---
  const validateField = (name, value) => {
      let error = '';
      if (!value.trim()) {
          error = 'This field is required';
      } else if (name === 'sourceDg' || name === 'destinationDg') {
          if (!isValidIPv4(value)) {
              error = 'Invalid IPv4 address format';
          }
      }
      // VRF specific validation could be added here if needed (e.g., length, characters)
      return error;
  };

  // --- Input Change Handler ---
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    let currentError = '';

    // Update local state immediately
    if (name === 'sourceDg') setSourceDg(value);
    if (name === 'destinationDg') setDestinationDg(value);
    if (name === 'vrf') setVrf(value);

    // Validate on change
    currentError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: currentError }));

    // Dispatch update to Redux store (debouncing could be added for performance if needed)
    dispatch(updateDirectTraceInput({ traceId, field: name, value }));
  };

   // --- Blur Handler for final validation check ---
   const handleBlur = (event) => {
       const { name, value } = event.target;
       const fieldError = validateField(name, value);
       setErrors(prev => ({ ...prev, [name]: fieldError }));
   };

  // --- Form Submission Handler ---
  const handleTrace = () => {
      // Final validation check before submitting
      const newErrors = {
          sourceDg: validateField('sourceDg', sourceDg),
          destinationDg: validateField('destinationDg', destinationDg),
          vrf: validateField('vrf', vrf)
      };
      setErrors(newErrors);

      // Check if any local errors exist
      if (Object.values(newErrors).some(e => e !== '')) {
         console.log("Local validation errors", newErrors);
         return; // Prevent submission if local validation fails
      }

      // Dispatch trace action if all local validation passes
      dispatch(performDirectRouteTrace({ traceId, sourceDg, destinationDg, vrf }));
  };

  const isTracing = traceStatus === 'loading';
  const traceError = reduxError && traceStatus === 'failed'; // Use renamed Redux error

  // Determine if trace button should be disabled
  const hasLocalErrors = Object.values(errors).some(e => e !== '');
  const canTrace = sourceDg && destinationDg && vrf && !isTracing && !hasLocalErrors;

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 1.5, backgroundColor: 'action.hover' }}>
        <Box component="form" noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); if (canTrace) handleTrace(); }}>
            {/* Display Redux trace errors */}
            {traceError && <ErrorMessage error={reduxError} title="Trace Error" />}

            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 2 }}>
                {/* Source Gateway */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                        Source Gateway
                    </Typography>
                    <TextField
                        name="sourceDg" // Added name attribute
                        label="Source Gateway IP *"
                        value={sourceDg}
                        onChange={handleInputChange}
                        onBlur={handleBlur} // Validate on blur
                        variant="outlined"
                        fullWidth
                        required
                        disabled={isTracing}
                        margin="dense"
                        error={!!errors.sourceDg} // Use local validation error
                        helperText={errors.sourceDg || "Enter the starting Gateway IP for the trace"}
                    />
                </Grid>

                {/* Destination Gateway */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'secondary.main', fontWeight: 'medium' }}>
                        Destination Gateway
                    </Typography>
                    <TextField
                        name="destinationDg" // Added name attribute
                        label="Destination Gateway IP *"
                        value={destinationDg}
                        onChange={handleInputChange}
                        onBlur={handleBlur} // Validate on blur
                        variant="outlined"
                        fullWidth
                        required
                        disabled={isTracing}
                        margin="dense"
                        error={!!errors.destinationDg} // Use local validation error
                        helperText={errors.destinationDg || "Enter the ending Gateway IP for the trace"}
                    />
                </Grid>
            </Grid>

            {/* VRF Input */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
                     VRF Name
                </Typography>
                <TextField
                    name="vrf" // Added name attribute
                    label="VRF Name *"
                    value={vrf}
                    onChange={handleInputChange}
                    onBlur={handleBlur} // Validate on blur
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                    margin="dense"
                    error={!!errors.vrf} // Use local validation error
                    helperText={errors.vrf || "Specify the VRF context for this trace (Required)"}
                />
            </Box>

            {/* Trace Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Tooltip title={!sourceDg || !destinationDg || !vrf ? "Please fill in all required fields" : (hasLocalErrors ? "Please fix the validation errors above" : "Run direct trace")}>
                    <span> {/* Wrap button for tooltip when disabled */}
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={isTracing ? <CircularProgress size={20} color="inherit" /> : <NetworkCheckIcon />}
                            onClick={handleTrace} // Use the enhanced handler
                            disabled={!canTrace} // Disable based on local validation too
                            type="submit"
                            sx={{ minWidth: 180 }}
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
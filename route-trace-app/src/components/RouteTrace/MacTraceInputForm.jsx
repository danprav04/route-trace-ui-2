// ----- File: src\components\RouteTrace\MacTraceInputForm.jsx -----

// ----- File: src\components\RouteTrace\MacTraceInputForm.jsx -----
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Grid, CircularProgress, Tooltip, IconButton, InputAdornment, Typography } from '@mui/material';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { updateMacTraceInput, fetchMacDefaultGateway, performMacTrace } from '../../store/slices/macTraceSlice';
import ErrorMessage from '../Common/ErrorMessage';
import { isValidIPv4 } from '../../utils/validators'; // Import the validator

const MacTraceInputForm = ({ trace }) => {
  const dispatch = useDispatch();
  const {
    id: traceId,
    ip: reduxIp, // Rename redux state vars
    dg: reduxDg,
    dgStatus,
    traceStatus,
    error: reduxError // Rename redux error
  } = trace;

  // --- Local State for Input and Validation ---
  const [ip, setIp] = useState(reduxIp || '');
  const [dg, setDg] = useState(reduxDg || '');
  const [errors, setErrors] = useState({}); // Local validation errors: { ip: '...', dg: '...' }

  // Keep local state in sync with Redux state if it changes externally
  useEffect(() => {
    setIp(reduxIp || '');
  }, [reduxIp]);
  // Sync DG only if not manually entered or loading (to preserve fetched/manual data)
  useEffect(() => {
    if (dgStatus !== 'manual' && dgStatus !== 'loading') {
        setDg(reduxDg || '');
    }
  }, [reduxDg, dgStatus])


  // --- Validation Function ---
  const validateField = (name, value) => {
      let error = '';
      if (!value.trim()) {
          error = 'This field is required';
      } else if (name === 'ip' || name === 'dg') {
           if (!isValidIPv4(value)) {
               error = 'Invalid IPv4 address format';
           }
      }
      return error;
  };

  // --- Input Change Handler ---
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    let currentError = '';

    // Update local state immediately
    if (name === 'ip') setIp(value);
    if (name === 'dg') setDg(value);

    // Validate on change
    currentError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: currentError }));

    // Dispatch update to Redux store
    dispatch(updateMacTraceInput({ traceId, field: name, value }));
  };

   // --- Blur Handler for final validation check and DG fetch ---
   const handleBlur = (event) => {
       const { name, value } = event.target;
       const fieldError = validateField(name, value);
       setErrors(prev => ({ ...prev, [name]: fieldError }));

        // Trigger DG fetch on IP blur only if IP is valid
        if (name === 'ip' && value.trim() && !fieldError) {
            handleFetchDg();
        }
   };

  const handleFetchDg = () => {
    // Fetch DG only if IP is locally valid
    const ipError = validateField('ip', ip);
    if (ip && !ipError) {
      dispatch(fetchMacDefaultGateway({ ip, traceId }));
    } else {
        // Optionally set an error if IP is invalid when trying to fetch DG
        if (!ipError) { // Ensure IP error is set if field is empty etc.
             setErrors(prev => ({ ...prev, ip: 'Valid IP required to fetch Gateway' }));
        }
    }
  };

  const handleTrace = () => {
      // Final validation check before submitting
      const newErrors = {
          ip: validateField('ip', ip),
          dg: validateField('dg', dg)
      };
      setErrors(newErrors);

      // Check if any local errors exist
      if (Object.values(newErrors).some(e => e !== '')) {
          return; // Prevent submission if local validation fails
      }

      // Dispatch trace action if all local validation passes
      dispatch(performMacTrace({ traceId, ip, dg }));
  };

  const isFetchingDg = dgStatus === 'loading';
  const isTracing = traceStatus === 'loading';
  const dgDisabled = isFetchingDg; // Only disable DG field if actively fetching it

  const renderDgStatusIcon = () => {
    switch (dgStatus) {
      case 'loading':
        return <InputAdornment position="end"><CircularProgress size={20} sx={{ mr: 1 }} /></InputAdornment>;
      case 'succeeded':
        return <InputAdornment position="end"><Tooltip title="Gateway automatically fetched"><CheckCircleIcon color="success" sx={{ mr: 1 }} /></Tooltip></InputAdornment>;
      case 'failed':
        return (
            <InputAdornment position="end">
                <Tooltip title="Failed to fetch gateway. Click to retry.">
                     {/* Button enabled only if IP is valid */}
                     <IconButton onClick={handleFetchDg} size="small" disabled={!ip || !!errors.ip || isTracing} sx={{ mr: 0.5 }}>
                        <SyncProblemIcon color="error" />
                    </IconButton>
                </Tooltip>
            </InputAdornment>
        );
      case 'manual':
         return <InputAdornment position="end"><Tooltip title="Gateway manually entered"><EditIcon color="action" sx={{ mr: 1 }} /></Tooltip></InputAdornment>;
      default: // idle
        return ( // Show refresh button when idle and IP exists and is valid
             (ip && !errors.ip) ? <InputAdornment position="end">
                 <Tooltip title="Fetch Gateway">
                     <IconButton onClick={handleFetchDg} size="small" disabled={isTracing || isFetchingDg} sx={{ mr: 0.5 }}> <SyncIcon /> </IconButton>
                 </Tooltip>
             </InputAdornment> : null
        );
    }
  };

  // Check for specific errors from Redux
  const dgFetchError = reduxError && dgStatus === 'failed';
  const traceError = reduxError && traceStatus === 'failed' && !dgFetchError;

  // Disable trace button checks
  const hasLocalErrors = Object.values(errors).some(e => e !== '');
  const canTrace = ip && dg && !isTracing && !isFetchingDg && !hasLocalErrors;

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); if(canTrace) handleTrace(); }}>
        {/* Display Redux fetch/trace errors */}
        {dgFetchError && <ErrorMessage error={reduxError} title="Gateway Fetch Error" />}
        {traceError && <ErrorMessage error={reduxError} title="MAC Trace Error" />}

        <Grid container spacing={2} alignItems="flex-start">
            {/* Endpoint IP */}
            <Grid xs={12} sm={6}>
                 <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary' }}>Endpoint</Typography>
                <TextField
                    name="ip" // Added name
                    label="Endpoint IP Address *"
                    value={ip}
                    onChange={handleInputChange}
                    onBlur={handleBlur} // Fetch DG on blur
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                    margin="dense"
                    error={!!errors.ip || !!dgFetchError} // Show error for local validation OR redux DG fetch error
                    helperText={errors.ip || (dgFetchError ? "Check IP and connectivity" : "Enter the device IP")}
                />
            </Grid>

             {/* Default Gateway (DG) */}
            <Grid xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary' }}>Gateway</Typography>
                 <TextField
                    name="dg" // Added name
                    label="Endpoint Default Gateway *"
                    value={dg}
                    onChange={handleInputChange}
                    onBlur={handleBlur} // Validate DG format on blur
                    variant="outlined"
                    fullWidth
                    required
                    disabled={dgDisabled || isTracing}
                    margin="dense"
                    InputProps={{
                        endAdornment: renderDgStatusIcon(),
                    }}
                    error={!!errors.dg || !!dgFetchError} // Show error for local validation OR redux DG fetch error
                    helperText={errors.dg || (dgFetchError ? "Failed to fetch/validate DG" : "Enter DG or fetch automatically")}
                 />
            </Grid>
        </Grid>

        {/* Trace Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
             <Tooltip title={!ip || !dg ? "Please fill in IP and Gateway" : (hasLocalErrors ? "Please fix validation errors" : "Run MAC trace")}>
                    <span> {/* Wrap button for tooltip when disabled */}
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={isTracing ? <CircularProgress size={20} color="inherit" /> : <SettingsEthernetIcon />}
                            onClick={handleTrace} // Use enhanced handler
                            disabled={!canTrace} // Use enhanced check
                            type="submit"
                        >
                            {isTracing ? 'Tracing...' : 'Trace MAC Path'}
                        </Button>
                    </span>
              </Tooltip>
        </Box>
    </Box>
  );
};

export default MacTraceInputForm;
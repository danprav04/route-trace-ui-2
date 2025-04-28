// ----- File: src\components\RouteTrace\RouteInputForm.jsx -----

// ----- File: src\components\RouteTrace\RouteInputForm.jsx -----
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Grid, CircularProgress, Tooltip, IconButton, InputAdornment, Typography } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { updateTraceInput, fetchDefaultGateway, performFullTrace } from '../../store/slices/routeTraceSlice';
import ErrorMessage from '../Common/ErrorMessage';
import { isValidIPv4 } from '../../utils/validators'; // Import the validator

const RouteInputForm = ({ trace }) => {
  const dispatch = useDispatch();
  const {
    id: traceId,
    sourceIp: reduxSourceIp, // Rename redux vars
    destinationIp: reduxDestinationIp,
    sourceDg: reduxSourceDg,
    destinationDg: reduxDestinationDg,
    sourceDgStatus,
    destinationDgStatus,
    traceStatus,
    error: reduxError // Rename redux error
  } = trace;

  // --- Local State for Input and Validation ---
  const [sourceIp, setSourceIp] = useState(reduxSourceIp || '');
  const [destinationIp, setDestinationIp] = useState(reduxDestinationIp || '');
  const [sourceDg, setSourceDg] = useState(reduxSourceDg || '');
  const [destinationDg, setDestinationDg] = useState(reduxDestinationDg || '');
  const [errors, setErrors] = useState({}); // Local validation: { sourceIp: '', destinationIp: '', sourceDg: '', destinationDg: '' }

  // Keep local state in sync with Redux state if it changes externally
   useEffect(() => { setSourceIp(reduxSourceIp || ''); }, [reduxSourceIp]);
   useEffect(() => { setDestinationIp(reduxDestinationIp || ''); }, [reduxDestinationIp]);
   // Sync DGs only if not manually entered or loading
   useEffect(() => {
       if (sourceDgStatus !== 'manual' && sourceDgStatus !== 'loading') {
           setSourceDg(reduxSourceDg || '');
       }
   }, [reduxSourceDg, sourceDgStatus]);
    useEffect(() => {
       if (destinationDgStatus !== 'manual' && destinationDgStatus !== 'loading') {
            setDestinationDg(reduxDestinationDg || '');
       }
   }, [reduxDestinationDg, destinationDgStatus]);

  // --- Validation Function ---
  const validateField = (name, value) => {
      let error = '';
      if (!value.trim()) {
          error = 'This field is required';
      } else if (['sourceIp', 'destinationIp', 'sourceDg', 'destinationDg'].includes(name)) {
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
     if (name === 'sourceIp') setSourceIp(value);
     if (name === 'destinationIp') setDestinationIp(value);
     if (name === 'sourceDg') setSourceDg(value);
     if (name === 'destinationDg') setDestinationDg(value);

     // Validate on change
     currentError = validateField(name, value);
     setErrors(prev => ({ ...prev, [name]: currentError }));

     // Dispatch update to Redux store
     dispatch(updateTraceInput({ traceId, field: name, value }));
   };

   // --- Blur Handler for final validation check and DG fetch ---
   const handleBlur = (event) => {
        const { name, value } = event.target;
        const fieldError = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: fieldError }));

         // Trigger DG fetch on IP blur only if IP is valid
        if (name === 'sourceIp' && value.trim() && !fieldError) {
             handleFetchDg('source')(); // Call the fetch function for source
        }
        if (name === 'destinationIp' && value.trim() && !fieldError) {
             handleFetchDg('destination')(); // Call the fetch function for destination
        }
   };

  const handleFetchDg = (type) => () => {
    const ip = type === 'source' ? sourceIp : destinationIp;
    const ipFieldName = type === 'source' ? 'sourceIp' : 'destinationIp';
    const ipError = validateField(ipFieldName, ip);

    if (ip && !ipError) {
      dispatch(fetchDefaultGateway({ ip, type, traceId }));
    } else {
        // Set error if IP is invalid when trying to fetch DG
         if (!ipError) { // Ensure IP error is set if field is empty etc.
             setErrors(prev => ({ ...prev, [ipFieldName]: `Valid ${type} IP required to fetch Gateway` }));
        }
    }
  };

  const handleTrace = () => {
       // Final validation check before submitting
       const newErrors = {
           sourceIp: validateField('sourceIp', sourceIp),
           destinationIp: validateField('destinationIp', destinationIp),
           sourceDg: validateField('sourceDg', sourceDg),
           destinationDg: validateField('destinationDg', destinationDg)
       };
       setErrors(newErrors);

       // Check if any local errors exist
       if (Object.values(newErrors).some(e => e !== '')) {
           return; // Prevent submission if local validation fails
       }

      // Dispatch trace action if all local validation passes
      dispatch(performFullTrace({ traceId, sourceIp, destinationIp, sourceDg, destinationDg }));
  };

  const isFetchingSourceDg = sourceDgStatus === 'loading';
  const isFetchingDestDg = destinationDgStatus === 'loading';
  const isTracing = traceStatus === 'loading';

  // Disable DG field only when actively fetching that specific DG
  const sourceDgDisabled = isFetchingSourceDg;
  const destDgDisabled = isFetchingDestDg;

  const renderDgStatusIcon = (status, type) => {
    const ip = type === 'source' ? sourceIp : destinationIp;
    const ipFieldName = type === 'source' ? 'sourceIp' : 'destinationIp';
    const ipError = errors[ipFieldName]; // Get local error for the relevant IP field
    const handleRetry = handleFetchDg(type);

    switch (status) {
      case 'loading':
        return <InputAdornment position="end"><CircularProgress size={20} sx={{ mr: 1 }} /></InputAdornment>;
      case 'succeeded':
        return <InputAdornment position="end"><Tooltip title="Gateway automatically fetched"><CheckCircleIcon color="success" sx={{ mr: 1 }} /></Tooltip></InputAdornment>;
      case 'failed':
        return (
            <InputAdornment position="end">
                <Tooltip title="Failed to fetch gateway. Click to retry.">
                    {/* Enable retry only if relevant IP is valid */}
                     <IconButton onClick={handleRetry} size="small" disabled={!ip || !!ipError || isTracing} sx={{ mr: 0.5 }}>
                        <SyncProblemIcon color="error" />
                    </IconButton>
                </Tooltip>
            </InputAdornment>
        );
      case 'manual':
         return <InputAdornment position="end"><Tooltip title="Gateway manually entered"><EditIcon color="action" sx={{ mr: 1 }} /></Tooltip></InputAdornment>;
      default: // idle
        return ( // Show refresh button when idle and relevant IP exists and is valid
             (ip && !ipError) ? <InputAdornment position="end">
                 <Tooltip title="Fetch Gateway">
                     <IconButton onClick={handleRetry} size="small" disabled={isTracing || (type === 'source' ? isFetchingSourceDg : isFetchingDestDg)} sx={{ mr: 0.5 }}> <SyncIcon /> </IconButton>
                 </Tooltip>
             </InputAdornment> : null
        );
    }
  };

  // Check for specific errors from Redux
  const dgFetchError = reduxError && (sourceDgStatus === 'failed' || destinationDgStatus === 'failed');
  const traceError = reduxError && (traceStatus === 'failed' || traceStatus === 'partial_success') && !dgFetchError;

  // Disable trace button checks
  const hasLocalErrors = Object.values(errors).some(e => e !== '');
  const canTrace = sourceIp && destinationIp && sourceDg && destinationDg && !isTracing && !isFetchingSourceDg && !isFetchingDestDg && !hasLocalErrors;

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); if(canTrace) handleTrace(); }}>
        {/* Display Redux DG fetch errors prominently */}
        {dgFetchError && <ErrorMessage error={reduxError} title="Gateway Fetch Error" />}
        {/* Display Redux general trace errors separately */}
        {traceError && <ErrorMessage error={reduxError} title={traceStatus === 'partial_success' ? 'Partial Trace Success' : 'Trace Error'} />}

        <Grid container spacing={2} alignItems="flex-start">
            {/* Source Column */}
            <Grid xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>Source</Typography>
                <TextField
                    name="sourceIp" // Added name
                    label="Source IP Address *"
                    value={sourceIp}
                    onChange={handleInputChange}
                    onBlur={handleBlur} // Validate and fetch DG
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                    margin="dense"
                    error={!!errors.sourceIp || !!(dgFetchError && sourceDgStatus === 'failed')} // Use local OR redux DG error
                    helperText={errors.sourceIp || (dgFetchError && sourceDgStatus === 'failed' ? "Check IP/Connectivity" : "Enter the source device IP")}
                />
                <TextField
                    name="sourceDg" // Added name
                    label="Source Default Gateway *"
                    value={sourceDg}
                    onChange={handleInputChange}
                    onBlur={handleBlur} // Validate DG format
                    variant="outlined"
                    fullWidth
                    required
                    disabled={sourceDgDisabled || isTracing}
                    margin="dense"
                    InputProps={{
                        endAdornment: renderDgStatusIcon(sourceDgStatus, 'source'),
                    }}
                    error={!!errors.sourceDg || !!(dgFetchError && sourceDgStatus === 'failed')} // Use local OR redux DG error
                    helperText={errors.sourceDg || (sourceDgStatus === 'failed' ? "Failed to fetch/validate DG" : "Enter DG or fetch automatically")}
                />
            </Grid>

            {/* Destination Column */}
            <Grid xs={12} md={6}>
                 <Typography variant="subtitle2" gutterBottom sx={{ color: 'secondary.main' }}>Destination</Typography>
                 <TextField
                    name="destinationIp" // Added name
                    label="Destination IP Address *"
                    value={destinationIp}
                    onChange={handleInputChange}
                    onBlur={handleBlur} // Validate and fetch DG
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                    margin="dense"
                    error={!!errors.destinationIp || !!(dgFetchError && destinationDgStatus === 'failed')} // Use local OR redux DG error
                    helperText={errors.destinationIp || (dgFetchError && destinationDgStatus === 'failed' ? "Check IP/Connectivity" : "Enter the destination device IP")}
                 />
                 <TextField
                    name="destinationDg" // Added name
                    label="Destination Default Gateway *"
                    value={destinationDg}
                    onChange={handleInputChange}
                    onBlur={handleBlur} // Validate DG format
                    variant="outlined"
                    fullWidth
                    required
                    disabled={destDgDisabled || isTracing}
                    margin="dense"
                    InputProps={{
                         endAdornment: renderDgStatusIcon(destinationDgStatus, 'destination'),
                    }}
                     error={!!errors.destinationDg || !!(dgFetchError && destinationDgStatus === 'failed')} // Use local OR redux DG error
                     helperText={errors.destinationDg || (destinationDgStatus === 'failed' ? "Failed to fetch/validate DG" : "Enter DG or fetch automatically")}
                />
            </Grid>
        </Grid>

        {/* Trace Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
             <Tooltip title={!sourceIp || !destinationIp || !sourceDg || !destinationDg ? "Please fill all fields" : (hasLocalErrors ? "Please fix validation errors" : "Run combined trace")}>
                    <span> {/* Wrap button for tooltip when disabled */}
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={isTracing ? <CircularProgress size={20} color="inherit" /> : <TravelExploreIcon />}
                            onClick={handleTrace} // Use enhanced handler
                            disabled={!canTrace} // Use enhanced check
                            type="submit"
                        >
                            {isTracing ? 'Tracing...' : 'Trace Full Route'}
                        </Button>
                    </span>
             </Tooltip>
        </Box>
    </Box>
  );
};

export default RouteInputForm;
// ----- File: src\components\RouteTrace\DirectRouteTraceInputForm.jsx -----
// Update Grid component to use Grid v2 API
import React from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Grid, CircularProgress, Tooltip, IconButton, InputAdornment, Typography } from '@mui/material';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { updateDirectTraceInput, fetchDirectDefaultGateway, performDirectRouteTrace } from '../../store/slices/directRouteSlice';
import ErrorMessage from '../Common/ErrorMessage';

const DirectRouteTraceInputForm = ({ trace }) => {
  const dispatch = useDispatch();
  const {
    id: traceId,
    sourceIp, destinationIp, sourceDg, destinationDg, vrf,
    sourceDgStatus, destinationDgStatus, traceStatus, error
  } = trace;

  const handleInputChange = (field) => (event) => {
    dispatch(updateDirectTraceInput({ traceId, field, value: event.target.value }));
  };

  const handleFetchDg = (type) => () => {
    const ip = type === 'source' ? sourceIp : destinationIp;
    if (ip) {
      dispatch(fetchDirectDefaultGateway({ ip, type, traceId }));
    }
  };

  const handleTrace = () => {
    dispatch(performDirectRouteTrace({ traceId, sourceIp, destinationIp, sourceDg, destinationDg, vrf }));
  };

  const isFetchingSourceDg = sourceDgStatus === 'loading';
  const isFetchingDestDg = destinationDgStatus === 'loading';
  const isTracing = traceStatus === 'loading';

  // Disable DG field only when actively fetching that specific DG
  const sourceDgDisabled = isFetchingSourceDg;
  const destDgDisabled = isFetchingDestDg;

  const renderDgStatusIcon = (status, type) => {
    const ip = type === 'source' ? sourceIp : destinationIp;
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
                    <IconButton onClick={handleRetry} size="small" disabled={!ip || isTracing} sx={{ mr: 0.5 }}>
                        <SyncProblemIcon color="error" />
                    </IconButton>
                </Tooltip>
            </InputAdornment>
        );
      case 'manual':
         return <InputAdornment position="end"><Tooltip title="Gateway manually entered"><EditIcon color="action" sx={{ mr: 1 }} /></Tooltip></InputAdornment>;
      default: // idle
        return ( // Show refresh button when idle and IP exists
             ip ? <InputAdornment position="end">
                 <Tooltip title="Fetch Gateway">
                     <IconButton onClick={handleRetry} size="small" disabled={isTracing} sx={{ mr: 0.5 }}> <SyncIcon /> </IconButton>
                 </Tooltip>
             </InputAdornment> : null
        );
    }
  };

  // Check if there's a general DG fetch error to display
  const dgFetchError = error && (sourceDgStatus === 'failed' || destinationDgStatus === 'failed');
  // Check if trace failed (but not DG fetch error)
  const traceError = error && traceStatus === 'failed' && !dgFetchError;

  const canTrace = sourceIp && destinationIp && sourceDg && destinationDg && !isTracing && !isFetchingSourceDg && !isFetchingDestDg;

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); if(canTrace) handleTrace(); }}>
        {/* Display DG fetch errors prominently */}
        {dgFetchError && <ErrorMessage error={error} title="Gateway Fetch Error" />}
        {/* Display general trace errors separately */}
        {traceError && <ErrorMessage error={error} title="Trace Error" />}

        {/* Grid v2: No 'item' prop, use direct breakpoint props */}
        <Grid container spacing={2} alignItems="flex-start">
            {/* Source Column */}
            {/* Removed 'item' prop */}
            <Grid xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>Source</Typography>
                <TextField
                    label="Source IP Address"
                    value={sourceIp}
                    onChange={handleInputChange('sourceIp')}
                    onBlur={handleFetchDg('source')} // Fetch DG when field loses focus
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                    margin="dense" // Use dense margin
                    error={!!(dgFetchError && sourceDgStatus === 'failed')} // Highlight if source DG fetch failed
                />
                <TextField
                    label="Source Default Gateway"
                    value={sourceDg}
                    onChange={handleInputChange('sourceDg')}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={sourceDgDisabled || isTracing}
                    margin="dense" // Use dense margin
                    InputProps={{
                        endAdornment: renderDgStatusIcon(sourceDgStatus, 'source'),
                    }}
                    error={!!(dgFetchError && sourceDgStatus === 'failed')} // Highlight if source DG fetch failed
                    helperText={sourceDgStatus === 'failed' ? "Check IP and network connectivity" : "Enter DG or fetch automatically"}
                />
            </Grid>

            {/* Destination Column */}
            {/* Removed 'item' prop */}
            <Grid xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'secondary.main' }}>Destination</Typography>
                 <TextField
                    label="Destination IP Address"
                    value={destinationIp}
                    onChange={handleInputChange('destinationIp')}
                    onBlur={handleFetchDg('destination')}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                    margin="dense" // Use dense margin
                    error={!!(dgFetchError && destinationDgStatus === 'failed')} // Highlight if dest DG fetch failed
                 />
                 <TextField
                    label="Destination Default Gateway"
                    value={destinationDg}
                    onChange={handleInputChange('destinationDg')}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={destDgDisabled || isTracing}
                    margin="dense" // Use dense margin
                    InputProps={{
                         endAdornment: renderDgStatusIcon(destinationDgStatus, 'destination'),
                    }}
                    error={!!(dgFetchError && destinationDgStatus === 'failed')} // Highlight if dest DG fetch failed
                    helperText={destinationDgStatus === 'failed' ? "Check IP and network connectivity" : "Enter DG or fetch automatically"}
                />
            </Grid>

             {/* VRF Input - spans full width below */}
             {/* Removed 'item' prop */}
             <Grid xs={12}>
                 <TextField
                    label="VRF Name (Optional)"
                    value={vrf || ''} // Ensure controlled component
                    onChange={handleInputChange('vrf')}
                    variant="outlined"
                    fullWidth
                    disabled={isTracing}
                    margin="dense" // Use dense margin
                    helperText="Specify VRF context for the trace if applicable"
                 />
            </Grid>
        </Grid>

        {/* Trace Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
            <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={isTracing ? <CircularProgress size={20} color="inherit" /> : <NetworkCheckIcon />}
                onClick={handleTrace}
                disabled={!canTrace}
                type="submit" // Allow form submission via Enter key
            >
                {isTracing ? 'Tracing...' : 'Trace Direct Route'}
            </Button>
        </Box>
    </Box>
  );
};

export default DirectRouteTraceInputForm;
// ----- End File: src\components\RouteTrace\DirectRouteTraceInputForm.jsx -----
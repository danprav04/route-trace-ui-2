// ----- File: src\components\RouteTrace\MacTraceInputForm.jsx -----
// Update Grid component to use Grid v2 API
import React from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Grid, CircularProgress, Tooltip, IconButton, InputAdornment, Typography } from '@mui/material';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { updateMacTraceInput, fetchMacDefaultGateway, performMacTrace } from '../../store/slices/macTraceSlice';
import ErrorMessage from '../Common/ErrorMessage';

const MacTraceInputForm = ({ trace }) => {
  const dispatch = useDispatch();
  const {
    id: traceId,
    ip, // Endpoint IP
    dg, // Endpoint Default Gateway
    dgStatus,
    traceStatus,
    error
  } = trace;

  const handleInputChange = (field) => (event) => {
    dispatch(updateMacTraceInput({ traceId, field, value: event.target.value }));
  };

  const handleFetchDg = () => {
    if (ip) {
      dispatch(fetchMacDefaultGateway({ ip, traceId }));
    }
  };

  const handleTrace = () => {
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
                     <IconButton onClick={handleFetchDg} size="small" disabled={!ip || isTracing} sx={{ mr: 0.5 }}>
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
                     <IconButton onClick={handleFetchDg} size="small" disabled={isTracing} sx={{ mr: 0.5 }}> <SyncIcon /> </IconButton>
                 </Tooltip>
             </InputAdornment> : null
        );
    }
  };

  // Check for specific errors
  const dgFetchError = error && dgStatus === 'failed';
  const traceError = error && traceStatus === 'failed' && !dgFetchError;

  const canTrace = ip && dg && !isTracing && !isFetchingDg;

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); if(canTrace) handleTrace(); }}>
        {dgFetchError && <ErrorMessage error={error} title="Gateway Fetch Error" />}
        {traceError && <ErrorMessage error={error} title="MAC Trace Error" />}

        {/* Grid v2: No 'item' prop, use direct breakpoint props */}
        <Grid container spacing={2} alignItems="flex-start">
            {/* Endpoint IP */}
            {/* Removed 'item' prop */}
            <Grid xs={12} sm={6}>
                 <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary' }}>Endpoint</Typography>
                <TextField
                    label="Endpoint IP Address"
                    value={ip}
                    onChange={handleInputChange('ip')}
                    onBlur={handleFetchDg} // Fetch DG when IP field loses focus
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                    margin="dense"
                    error={!!dgFetchError} // Highlight if related DG fetch failed
                />
            </Grid>

             {/* Default Gateway (DG) */}
             {/* Removed 'item' prop */}
            <Grid xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary' }}>Gateway</Typography>
                 <TextField
                    label="Endpoint Default Gateway"
                    value={dg}
                    onChange={handleInputChange('dg')}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={dgDisabled || isTracing}
                    margin="dense"
                    InputProps={{
                        endAdornment: renderDgStatusIcon(),
                    }}
                    error={!!dgFetchError} // Highlight if DG fetch failed
                    helperText={dgStatus === 'failed' ? "Check IP and network connectivity" : "Enter DG or fetch automatically"}
                 />
            </Grid>
        </Grid>

        {/* Trace Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
            <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={isTracing ? <CircularProgress size={20} color="inherit" /> : <SettingsEthernetIcon />}
                onClick={handleTrace}
                disabled={!canTrace}
                type="submit" // Allow form submission via Enter key
            >
                {isTracing ? 'Tracing...' : 'Trace MAC Path'}
            </Button>
        </Box>
    </Box>
  );
};

export default MacTraceInputForm;
// ----- End File: src\components\RouteTrace\MacTraceInputForm.jsx -----
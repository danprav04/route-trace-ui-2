// ----- File: src/components/RouteTrace/MacTraceInputForm.jsx -----

import React from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Grid, CircularProgress, Tooltip, IconButton } from '@mui/material';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { updateMacTraceInput, fetchMacDefaultGateway, performMacTrace } from '../../store/slices/macTraceSlice'; // Use macTraceSlice actions
import ErrorMessage from '../Common/ErrorMessage';

const MacTraceInputForm = ({ trace }) => {
  const dispatch = useDispatch();
  const {
    id: traceId,
    ip, // MAC trace needs IP and DG
    dg,
    dgStatus, // Only one DG status needed
    traceStatus,
    error
  } = trace;

  const handleInputChange = (field) => (event) => {
    dispatch(updateMacTraceInput({ traceId, field, value: event.target.value }));
  };

  const handleFetchDg = () => {
    if (ip) {
      // Pass traceId for linking state updates
      dispatch(fetchMacDefaultGateway({ ip, traceId }));
    }
  };

  const handleTrace = () => {
    dispatch(performMacTrace({ traceId, ip, dg }));
  };

  const isFetchingDg = dgStatus === 'loading';
  const isTracing = traceStatus === 'loading';
  const dgDisabled = isFetchingDg;

  const renderDgStatusIcon = (status) => {
    switch (status) {
      case 'loading':
        return <CircularProgress size={20} />;
      case 'succeeded':
        return <Tooltip title="Gateway Fetched"><CheckCircleIcon color="success" /></Tooltip>;
      case 'failed':
        return <Tooltip title="Failed to Fetch Gateway"><SyncProblemIcon color="error" /></Tooltip>;
      case 'manual':
         return <Tooltip title="Manually Entered"><EditIcon color="action" /></Tooltip>;
      default: // idle
        return null;
    }
  };

  const dgError = error && dgStatus === 'failed';

  return (
    <Box sx={{ mb: 3 }}>
        {dgError && <ErrorMessage error={error} title="Gateway Fetch Error" />}
        <Grid container spacing={2} alignItems="flex-start">
            {/* Endpoint IP */}
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Endpoint IP"
                    value={ip}
                    onChange={handleInputChange('ip')}
                    onBlur={handleFetchDg} // Trigger fetch on blur
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                />
            </Grid>

             {/* Default Gateway (DG) */}
            <Grid item xs={10} sm={5}>
                 <TextField
                    label="Endpoint Default Gateway"
                    value={dg}
                    onChange={handleInputChange('dg')}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={dgDisabled || isTracing}
                    InputProps={{
                        endAdornment: renderDgStatusIcon(dgStatus),
                    }}
                 />
            </Grid>
            <Grid item xs={2} sm={1} sx={{display: 'flex', alignItems: 'center', height: '56px' }}>
                 <Tooltip title="Re-fetch Gateway">
                     <span>
                        <IconButton onClick={handleFetchDg} disabled={!ip || isFetchingDg || isTracing} size="small">
                            <SyncIcon />
                        </IconButton>
                     </span>
                 </Tooltip>
            </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={isTracing ? <CircularProgress size={20} color="inherit" /> : <SettingsEthernetIcon />}
                onClick={handleTrace}
                disabled={!ip || !dg || isTracing || isFetchingDg}
            >
                {isTracing ? 'Tracing...' : 'Trace MAC Path'}
            </Button>
        </Box>
    </Box>
  );
};

export default MacTraceInputForm;

// ----- End File: src/components/RouteTrace/MacTraceInputForm.jsx -----
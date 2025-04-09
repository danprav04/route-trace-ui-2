import React from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box, Grid, CircularProgress, Tooltip, IconButton } from '@mui/material'; // Remove Typography from here later
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { updateTraceInput, fetchDefaultGateway, performFullTrace } from '../../store/slices/routeTraceSlice';
import ErrorMessage from '../Common/ErrorMessage'; // <<<--- ADD THIS LINE

const RouteInputForm = ({ trace }) => {
  const dispatch = useDispatch();
  const {
    id: traceId,
    sourceIp, destinationIp, sourceDg, destinationDg,
    sourceDgStatus, destinationDgStatus, traceStatus, error
  } = trace;

  const handleInputChange = (field) => (event) => {
    dispatch(updateTraceInput({ traceId, field, value: event.target.value }));
  };

  const handleFetchDg = (type) => () => {
    const ip = type === 'source' ? sourceIp : destinationIp;
    if (ip) {
      dispatch(fetchDefaultGateway({ ip, type, traceId }));
    }
  };

  const handleTrace = () => {
    dispatch(performFullTrace({ traceId, sourceIp, destinationIp, sourceDg, destinationDg }));
  };

  const isFetchingSourceDg = sourceDgStatus === 'loading';
  const isFetchingDestDg = destinationDgStatus === 'loading';
  const isTracing = traceStatus === 'loading';

  // Determine if DG field should be disabled
  // Disable if loading, allow edit if succeeded, failed, or manual
  const sourceDgDisabled = isFetchingSourceDg;
  const destDgDisabled = isFetchingDestDg;

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

   // Show DG fetch error specifically
   const dgError = error && (sourceDgStatus === 'failed' || destinationDgStatus === 'failed');

  return (
    <Box sx={{ mb: 3 }}>
        {dgError && <ErrorMessage error={error} title="Gateway Fetch Error" />}
        <Grid container spacing={2} alignItems="flex-start"> {/* Use alignItems="flex-start" */}
            {/* Source IP */}
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    label="Source IP"
                    value={sourceIp}
                    onChange={handleInputChange('sourceIp')}
                    onBlur={handleFetchDg('source')} // Trigger fetch on blur
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                />
            </Grid>

             {/* Source DG */}
            <Grid item xs={10} sm={5} md={2}>
                 <TextField
                    label="Source DG"
                    value={sourceDg}
                    onChange={handleInputChange('sourceDg')}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={sourceDgDisabled || isTracing}
                    InputProps={{
                        endAdornment: renderDgStatusIcon(sourceDgStatus),
                    }}
                 />
            </Grid>
            <Grid item xs={2} sm={1} md={1} sx={{display: 'flex', alignItems: 'center', height: '56px' }}> {/* Match TextField height */}
                 <Tooltip title="Re-fetch Source Gateway">
                     <span> {/* Span needed for tooltip on disabled button */}
                        <IconButton onClick={handleFetchDg('source')} disabled={!sourceIp || isFetchingSourceDg || isTracing} size="small">
                            <SyncIcon />
                        </IconButton>
                     </span>
                 </Tooltip>
            </Grid>


            {/* Destination IP */}
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    label="Destination IP"
                    value={destinationIp}
                    onChange={handleInputChange('destinationIp')}
                    onBlur={handleFetchDg('destination')} // Trigger fetch on blur
                    variant="outlined"
                    fullWidth
                    required
                    disabled={isTracing}
                 />
            </Grid>

             {/* Destination DG */}
            <Grid item xs={10} sm={5} md={2}>
                 <TextField
                    label="Destination DG"
                    value={destinationDg}
                    onChange={handleInputChange('destinationDg')}
                    variant="outlined"
                    fullWidth
                    required
                    disabled={destDgDisabled || isTracing}
                    InputProps={{
                         endAdornment: renderDgStatusIcon(destinationDgStatus),
                    }}
                />
            </Grid>
             <Grid item xs={2} sm={1} md={1} sx={{display: 'flex', alignItems: 'center', height: '56px'}}>
                 <Tooltip title="Re-fetch Destination Gateway">
                     <span>
                        <IconButton onClick={handleFetchDg('destination')} disabled={!destinationIp || isFetchingDestDg || isTracing} size="small">
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
                startIcon={isTracing ? <CircularProgress size={20} color="inherit" /> : <TravelExploreIcon />}
                onClick={handleTrace}
                disabled={!sourceIp || !destinationIp || !sourceDg || !destinationDg || isTracing || isFetchingSourceDg || isFetchingDestDg}
            >
                {isTracing ? 'Tracing...' : 'Trace Route'}
            </Button>
        </Box>
    </Box>
  );
};

export default RouteInputForm;
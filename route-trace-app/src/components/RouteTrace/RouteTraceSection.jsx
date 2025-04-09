import React from 'react';
import { Paper, Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RouteInputForm from './RouteInputForm';
import RouteVisualizer from './RouteVisualizer';
import { useDispatch } from 'react-redux';
import { removeTraceSection } from '../../store/slices/routeTraceSlice';

const RouteTraceSection = ({ trace, canRemove }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
      if (canRemove) {
          dispatch(removeTraceSection(trace.id));
      }
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, position: 'relative' }}>
        {canRemove && (
            <Tooltip title="Remove this trace section">
                <IconButton
                    onClick={handleRemove}
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </Tooltip>
        )}
        <RouteInputForm trace={trace} />
        <RouteVisualizer trace={trace} />
    </Paper>
  );
};

export default RouteTraceSection;
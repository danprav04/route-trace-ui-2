// ----- File: src\components\RouteTrace\DirectRouteTraceSection.jsx -----
import React from 'react';
import { Paper, Box, IconButton, Tooltip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DirectRouteTraceInputForm from './DirectRouteTraceInputForm';
import DirectRouteVisualizer from './DirectRouteVisualizer';
import { useDispatch } from 'react-redux';
import { removeDirectTraceSection } from '../../store/slices/directRouteSlice';

const DirectRouteTraceSection = ({ trace, canRemove }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
      if (canRemove) {
          dispatch(removeDirectTraceSection(trace.id));
      }
  }

  return (
    <Paper
        elevation={3} // Slightly more pronounced elevation
        sx={{
            p: { xs: 2, sm: 3 }, // Responsive padding
            mb: 3,
            position: 'relative',
            borderRadius: 2, // Softer corners
            // Add a subtle border
            // border: (theme) => `1px solid ${theme.palette.divider}`
        }}
    >
        {canRemove && (
            <Tooltip title="Remove this trace section">
                <IconButton
                    onClick={handleRemove}
                    size="small"
                    aria-label="Remove trace section"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'action.active',
                        '&:hover': { color: 'error.main' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}

        {/* Input Form */}
        <DirectRouteTraceInputForm trace={trace} />

        {/* Divider before results (only if trace has started or finished) */}
        {(trace.traceStatus !== 'idle' || trace.error) && (
            <Divider sx={{ my: 3 }} />
        )}

        {/* Visualizer */}
        <DirectRouteVisualizer trace={trace} />
    </Paper>
  );
};

export default DirectRouteTraceSection;
// ----- File: src\components\RouteTrace\MacTraceSection.jsx -----
import React from 'react';
import { Paper, Box, IconButton, Tooltip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MacTraceInputForm from './MacTraceInputForm';
import MacTraceVisualizer from './MacTraceVisualizer';
import { useDispatch } from 'react-redux';
import { removeMacTraceSection } from '../../store/slices/macTraceSlice';

const MacTraceSection = ({ trace, canRemove }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
      if (canRemove) {
          dispatch(removeMacTraceSection(trace.id));
      }
  }

  return (
    <Paper
        elevation={3}
        sx={{
            p: { xs: 2, sm: 3 }, // Responsive padding
            mb: 3,
            position: 'relative',
            borderRadius: 2, // Softer corners
        }}
    >
        {canRemove && (
            <Tooltip title="Remove this trace section">
                <IconButton
                    onClick={handleRemove}
                    size="small"
                    aria-label="Remove MAC trace section"
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
        <MacTraceInputForm trace={trace} />

        {/* Divider before results (only if trace has started or finished) */}
        {(trace.traceStatus !== 'idle' || trace.error) && (
            <Divider sx={{ my: 3 }} />
        )}

        {/* Visualizer */}
        <MacTraceVisualizer trace={trace} />
    </Paper>
  );
};

export default MacTraceSection;
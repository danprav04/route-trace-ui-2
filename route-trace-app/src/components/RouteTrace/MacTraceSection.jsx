// ----- File: src/components/RouteTrace/MacTraceSection.jsx -----

import React from 'react';
import { Paper, Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MacTraceInputForm from './MacTraceInputForm';
import MacTraceVisualizer from './MacTraceVisualizer';
import { useDispatch } from 'react-redux';
import { removeMacTraceSection } from '../../store/slices/macTraceSlice'; // Use correct slice action

const MacTraceSection = ({ trace, canRemove }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
      if (canRemove) {
          dispatch(removeMacTraceSection(trace.id));
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
        <MacTraceInputForm trace={trace} />
        <MacTraceVisualizer trace={trace} />
    </Paper>
  );
};

export default MacTraceSection;

// ----- End File: src/components/RouteTrace/MacTraceSection.jsx -----
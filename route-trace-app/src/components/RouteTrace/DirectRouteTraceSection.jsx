// ----- File: src/components/RouteTrace/DirectRouteTraceSection.jsx -----

import React from 'react';
import { Paper, Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DirectRouteTraceInputForm from './DirectRouteTraceInputForm';
import DirectRouteVisualizer from './DirectRouteVisualizer';
import { useDispatch } from 'react-redux';
import { removeDirectTraceSection } from '../../store/slices/directRouteSlice'; // Use correct slice action

const DirectRouteTraceSection = ({ trace, canRemove }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
      if (canRemove) {
          dispatch(removeDirectTraceSection(trace.id));
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
        <DirectRouteTraceInputForm trace={trace} />
        <DirectRouteVisualizer trace={trace} />
    </Paper>
  );
};

export default DirectRouteTraceSection;

// ----- End File: src/components/RouteTrace/DirectRouteTraceSection.jsx -----
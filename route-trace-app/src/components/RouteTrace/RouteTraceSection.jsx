// ----- File: src\components\RouteTrace\RouteTraceSection.jsx -----
import React from 'react';
import { Paper, Box, IconButton, Tooltip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RouteInputForm from './RouteInputForm';
import RouteVisualizer from './RouteVisualizer';
import { useDispatch } from 'react-redux';
import { removeTraceSection } from '../../store/slices/routeTraceSlice'; // Assuming this exists if comparison is needed

// NOTE: This component seems designed for comparison, but the associated
// RouteTracePage and routeTraceSlice were simplified to handle only *one* trace.
// If comparison is needed for the *Combined Trace*, the slice and page need refactoring.
// For now, this component assumes it *might* be used in a comparison context,
// but the remove functionality won't work with the current single-trace slice.

const RouteTraceSection = ({ trace, canRemove }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
      // This dispatch will likely cause an error or do nothing with the current
      // single-trace routeTraceSlice. Refactor slice if removal is needed.
      if (canRemove) {
        //   dispatch(removeTraceSection(trace.id)); // Requires slice modification
          console.warn("RemoveTraceSection action requires routeTraceSlice to handle multiple traces.");
      }
  }

  return (
     <Paper
        elevation={3}
        sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            position: 'relative',
            borderRadius: 2,
        }}
    >
        {/* Conditionally render remove button - requires slice changes to work */}
        {canRemove && (
            <Tooltip title="Remove this trace section (Requires Slice Update)">
                <IconButton
                    onClick={handleRemove}
                    size="small"
                    aria-label="Remove combined trace section"
                     sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'action.active',
                        '&:hover': { color: 'error.main' }
                    }}
                    // disabled // Disable until slice supports removal
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}

        {/* Input Form */}
        <RouteInputForm trace={trace} />

         {/* Divider before results (only if trace has started or finished) */}
         {(trace.traceStatus !== 'idle' || trace.error) && (
             <Divider sx={{ my: 3 }} />
         )}

        {/* Visualizer */}
        <RouteVisualizer trace={trace} />
    </Paper>
  );
};

export default RouteTraceSection;
// ----- File: src\components\RouteTrace\RouteComparisonContainer.jsx -----

import React from 'react';
import { Box, Grid, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Generic container for side-by-side comparison of trace sections
// Now accepts and forwards view modes, reverse states, and highlighting info (including ipColorMap)
const RouteComparisonContainer = ({
    traces = [],
    SectionComponent,
    isMinimalView = false,
    reversedStates = {},
    onToggleReverse,
    isHighlightingActive = false,
    highlightedIPs = new Set(), // Keep this for potential quick checks if needed downstream
    ipColorMap = new Map()      // New: Accept IP to Color mapping
}) => {
  if (!SectionComponent) {
    console.error("RouteComparisonContainer requires a valid SectionComponent prop.");
    return (
        <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ mt: 2 }}>
            Configuration Error: Cannot display comparison items. SectionComponent is missing.
        </Alert>
    );
  }

  const canRemove = traces.length > 1;

  let columnProps = {};
  if (traces.length === 1) columnProps = { xs: 12 };
  else if (traces.length === 2) columnProps = { xs: 12, md: 6 };
  else if (traces.length === 3) columnProps = { xs: 12, md: 6, lg: 4 };
  else columnProps = { xs: 12, sm: 6, md: 4, lg: 3 };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {traces.map((trace) => (
          <Grid {...columnProps} key={trace.id}>
             <SectionComponent
                trace={trace}
                canRemove={canRemove}
                isMinimalView={isMinimalView}
                isReversed={reversedStates[trace.id] || false}
                onToggleReverse={onToggleReverse}
                isHighlightingActive={isHighlightingActive} // Pass down highlight state
                highlightedIPs={highlightedIPs}             // Pass down IP set
                ipColorMap={ipColorMap}                     // Pass down color map
              />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RouteComparisonContainer;
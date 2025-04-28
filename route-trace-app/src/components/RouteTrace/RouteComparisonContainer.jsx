// ----- File: src\components\RouteTrace\RouteComparisonContainer.jsx -----

// Update Grid component to use Grid v2 API
import React from 'react';
import { Box, Grid, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Generic container for side-by-side comparison of trace sections
// Now accepts and forwards isMinimalView, reversedStates, and onToggleReverse props
const RouteComparisonContainer = ({
    traces = [],
    SectionComponent,
    isMinimalView = false,
    reversedStates = {}, // Default to empty object
    onToggleReverse // Handler function
}) => {
  // Check if a valid SectionComponent was provided
  if (!SectionComponent) {
    console.error("RouteComparisonContainer requires a valid SectionComponent prop.");
    return (
        <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ mt: 2 }}>
            Configuration Error: Cannot display comparison items. SectionComponent is missing.
        </Alert>
    );
  }

  // Determine if the remove button should be shown in child sections
  // (This depends on the calling context and slice capabilities, not relevant to minimalist view)
  const canRemove = traces.length > 1;

  // Define responsive grid sizing using Grid v2 direct props
  let columnProps = {};
  if (traces.length === 1) {
      columnProps = { xs: 12 }; // Full width if only one
  } else if (traces.length === 2) {
      columnProps = { xs: 12, md: 6 }; // 2 columns on medium screens and up
  } else if (traces.length === 3) {
      columnProps = { xs: 12, md: 6, lg: 4 }; // 3 columns on large screens and up
  } else { // 4 or more
      columnProps = { xs: 12, sm: 6, md: 4, lg: 3 }; // Max 4 columns on large screens
  }


  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Use Grid container with appropriate spacing */}
      {/* No 'item' prop needed on the container */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {traces.map((trace) => (
          // Child Grid components now use breakpoint props directly
          // Removed the 'item' prop
          <Grid {...columnProps} key={trace.id}>
             {/* Render the provided SectionComponent */}
             {/* Pass down all relevant props: trace data, view modes, handlers */}
             <SectionComponent
                trace={trace}
                canRemove={canRemove} // Note: Removal logic depends on the specific slice implementation
                isMinimalView={isMinimalView} // Pass down the view mode
                // Pass the specific reversed state for this trace
                isReversed={reversedStates[trace.id] || false}
                // Pass the handler function
                onToggleReverse={onToggleReverse}
              />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RouteComparisonContainer;
// ----- End File: src\components\RouteTrace\RouteComparisonContainer.jsx -----
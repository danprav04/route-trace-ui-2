// ----- File: src\components\RouteTrace\RouteComparisonContainer.jsx -----
// Update Grid component to use Grid v2 API
import React from 'react';
import { Box, Grid, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Generic container for side-by-side comparison of trace sections
const RouteComparisonContainer = ({ traces = [], SectionComponent }) => {
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
             {/* Render the provided SectionComponent, passing the trace data and canRemove flag */}
             {/* Ensure SectionComponent handles height/layout internally (e.g., height: '100%') */}
             <SectionComponent trace={trace} canRemove={canRemove} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RouteComparisonContainer;
// ----- End File: src\components\RouteTrace\RouteComparisonContainer.jsx -----
// ----- File: src\pages\DirectRouteTracePage.jsx -----
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box, Typography, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import DirectRouteTraceSection from '../components/RouteTrace/DirectRouteTraceSection';
import { addDirectTraceSection } from '../store/slices/directRouteSlice';

const MAX_COMPARISON_SECTIONS = 4; // Define a max limit for comparison sections

const DirectRouteTracePage = () => {
    const dispatch = useDispatch();
    // Select the array of trace states from the directRoute slice
    const traces = useSelector((state) => state.directRoute.traces);

    const canAddMore = traces.length < MAX_COMPARISON_SECTIONS;

    const handleAddRoute = () => {
        if (canAddMore) {
            dispatch(addDirectTraceSection());
        }
    }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Trace Direct Network Route
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Perform a direct route trace between two specified IP addresses using their respective default gateways. Add multiple sections to compare different traces side-by-side.
      </Typography>

      {/* Container to display one or more trace sections side-by-side */}
      <RouteComparisonContainer
            traces={traces}
            SectionComponent={DirectRouteTraceSection} // Pass the specific section component
        />

       {/* Button to add another trace section for comparison */}
       <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={!canAddMore ? `Maximum ${MAX_COMPARISON_SECTIONS} comparison sections reached` : "Add another trace input section"}>
                {/* Span needed for tooltip when button is disabled */}
                <span>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddRoute}
                        disabled={!canAddMore}
                        aria-label="Add trace section for comparison"
                    >
                        Add Trace for Comparison
                    </Button>
                </span>
            </Tooltip>
       </Box>
    </Box>
  );
};

export default DirectRouteTracePage;
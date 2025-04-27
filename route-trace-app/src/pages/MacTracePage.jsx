// ----- File: src\pages\MacTracePage.jsx -----
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box, Typography, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import MacTraceSection from '../components/RouteTrace/MacTraceSection';
import { addMacTraceSection } from '../store/slices/macTraceSlice';

const MAX_COMPARISON_SECTIONS = 4; // Define a max limit

const MacTracePage = () => {
    const dispatch = useDispatch();
    // Select the array of trace states from the macTrace slice
    const traces = useSelector((state) => state.macTrace.traces);

    const canAddMore = traces.length < MAX_COMPARISON_SECTIONS;

    const handleAddRoute = () => {
       if (canAddMore) {
           dispatch(addMacTraceSection());
       }
    }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Trace MAC Path (Endpoint ↔ Gateway)
      </Typography>
       <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Perform a Layer 2 MAC address trace between an endpoint IP and its default gateway. Add multiple sections to compare different MAC traces.
      </Typography>

      {/* Container to display one or more trace sections side-by-side */}
      <RouteComparisonContainer
            traces={traces}
            SectionComponent={MacTraceSection} // Pass the specific section component
      />

       {/* Button to add another trace section for comparison */}
       <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
           <Tooltip title={!canAddMore ? `Maximum ${MAX_COMPARISON_SECTIONS} comparison sections reached` : "Add another MAC trace input section"}>
                <span> {/* Span for tooltip on disabled button */}
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddRoute}
                        disabled={!canAddMore}
                        aria-label="Add MAC trace section for comparison"
                    >
                        Add Trace for Comparison
                    </Button>
                </span>
            </Tooltip>
       </Box>
    </Box>
  );
};

export default MacTracePage;
// ----- File: src\pages\ComparisonPage.jsx -----

// ----- File: src\pages\ComparisonPage.jsx -----

import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Alert, Paper, Stack, ToggleButton, Tooltip, Button } from '@mui/material'; // Added Button
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ViewCompactIcon from '@mui/icons-material/ViewCompact'; // Icon for minimal view
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'; // Icon for detailed view
import PaletteIcon from '@mui/icons-material/Palette'; // Icon for highlighting
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'; // Icon for highlighting (inactive)
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'; // <-- Import added here
import ComparisonSelector from '../components/Comparison/ComparisonSelector';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import ComparisonItem from '../components/Comparison/ComparisonItem'; // ComparisonItem now uses universal visualizer
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { fetchAllHistory, resetHistoryError } from '../store/slices/historySlice';

const ComparisonPage = () => {
    const dispatch = useDispatch();
    // Use allHistory which contains processed entries of all types
    const { allHistory, allHistoryStatus, error: historyError } = useSelector((state) => state.history);
    // Store IDs of the routes selected for comparison
    const [selectedRouteIds, setSelectedRouteIds] = useState([]);
    // State to control the minimalist view toggle
    const [isMinimalView, setIsMinimalView] = useState(false); // Default to detailed view
    // State to track the reversed display status for each selected trace
    const [reversedStates, setReversedStates] = useState({}); // { [traceId]: boolean }
    // State to control IP highlighting
    const [isHighlightingActive, setIsHighlightingActive] = useState(false); // Default: off

    // Fetch all history if it hasn't been fetched yet
    useEffect(() => {
        if (allHistoryStatus === 'idle' || allHistoryStatus === 'failed') { // Fetch if idle or failed previously
            dispatch(fetchAllHistory());
        }
        // Optional: Reset error on unmount
        // return () => { dispatch(resetHistoryError()); };
    }, [allHistoryStatus, dispatch]);

    // Filter the full history data based on the selected IDs
    // This derived state will be passed to the comparison container
    const selectedRoutesData = useMemo(() => {
        return allHistory.filter(route => selectedRouteIds.includes(route.id));
    }, [allHistory, selectedRouteIds]);


    // Calculate which IPs appear in multiple selected traces
    const highlightedIPs = useMemo(() => {
        if (selectedRoutesData.length <= 1) {
            return new Set(); // No need to highlight if <= 1 trace selected
        }

        const ipCounts = new Map();

        selectedRoutesData.forEach(trace => {
            const allHops = [
                ...(trace.mainRouteTrace || []),
                ...(trace.sourceMacTrace || []),
                ...(trace.destinationMacTrace || []),
            ];
            // Count each IP only once per trace to find IPs present in *multiple traces*
            const uniqueIPsInTrace = new Set();
            allHops.forEach(hop => {
                if (hop?.ip) {
                    uniqueIPsInTrace.add(hop.ip);
                }
            });

            uniqueIPsInTrace.forEach(ip => {
                ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
            });
        });

        const ipsToHighlight = new Set();
        for (const [ip, count] of ipCounts.entries()) {
            // Highlight IPs appearing in *more than one* of the selected traces
            if (count > 1) {
                ipsToHighlight.add(ip);
            }
        }
        // console.log("IPs to Highlight:", ipsToHighlight); // For debugging
        return ipsToHighlight;

    }, [selectedRoutesData]); // Recalculate when selected data changes

    // Handler for when the selection in ComparisonSelector changes
    const handleSelectionChange = (selectedIds) => {
        setSelectedRouteIds(selectedIds);
        // Optional: Reset reversed states when selection changes?
        // setReversedStates({});
        // Reset highlighting when selection changes to avoid confusion
        setIsHighlightingActive(false);
    };

    // Handler for toggling the minimal view
    const handleViewToggle = () => {
        setIsMinimalView(!isMinimalView);
    };

    // Handler for toggling the reverse display of a specific trace item
    const handleToggleReverse = (traceId) => {
        setReversedStates(prev => ({
            ...prev,
            [traceId]: !prev[traceId] // Toggle the boolean value for the specific id
        }));
    };

    // Handler for toggling the IP highlighting mode
    const handleHighlightToggle = () => {
        setIsHighlightingActive(!isHighlightingActive);
    };


    // Show loading spinner while fetching history
    if (allHistoryStatus === 'loading') {
        return <LoadingSpinner message="Loading route history..." />;
    }

    const canCompare = selectedRoutesData.length >= 2;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                 <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                    Compare Historical Traces
                 </Typography>
                 {/* View Control Buttons */}
                 {allHistoryStatus === 'succeeded' && (
                    <Stack direction="row" spacing={1}>
                        {/* Highlight Toggle */}
                        <Tooltip title={isHighlightingActive ? "Disable IP Highlighting" : "Highlight IPs Appearing in Multiple Traces"}>
                           <span> {/* Wrap for tooltip when disabled */}
                             <ToggleButton
                                value="highlight"
                                selected={isHighlightingActive}
                                onChange={handleHighlightToggle}
                                size="small"
                                aria-label="Toggle IP highlighting"
                                disabled={!canCompare || highlightedIPs.size === 0} // Disable if < 2 traces or no IPs to highlight
                            >
                                {isHighlightingActive ? <PaletteIcon color="warning"/> : <PaletteOutlinedIcon />}
                             </ToggleButton>
                           </span>
                        </Tooltip>

                        {/* Minimal View Toggle */}
                        <Tooltip title={isMinimalView ? "Show Full Details" : "Show Minimal View (Hops Only)"}>
                            <ToggleButton
                                value="minimal"
                                selected={isMinimalView}
                                onChange={handleViewToggle}
                                size="small"
                                aria-label="Toggle minimal view"
                                disabled={selectedRoutesData.length === 0} // Disable if nothing selected
                            >
                                {isMinimalView ? <ViewHeadlineIcon /> : <ViewCompactIcon />}
                            </ToggleButton>
                        </Tooltip>

                        {/* Reset View Button */}
                        <Tooltip title="Reset Minimal View & Reversed Traces">
                           <span>
                             <Button
                                size="small"
                                variant='outlined'
                                onClick={() => { setIsMinimalView(false); setReversedStates({}); }}
                                disabled={selectedRoutesData.length === 0}
                                sx={{ minWidth: 'auto', px: 1 }} // Compact button
                             >
                                Reset View
                             </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                 )}
             </Stack>


            {/* Display error if history fetching failed */}
            {allHistoryStatus === 'failed' && (
                <ErrorMessage error={historyError} title="Could not load route history" />
            )}

            {/* Render selector and comparison container only if history loaded successfully */}
            {allHistoryStatus === 'succeeded' && (
                <>
                    {/* Component to select routes from the available history */}
                    <ComparisonSelector
                        availableRoutes={allHistory} // Pass all history entries
                        selectedIds={selectedRouteIds}
                        onChange={handleSelectionChange}
                    />

                    {/* Display the comparison container if routes are selected */}
                    {selectedRoutesData.length > 0 ? (
                         <Box sx={{ mt: 3 }}>
                             {/* Container responsible for laying out the comparison items */}
                             {/* Pass view modes, reverse states, highlight state + data, and handlers down */}
                             <RouteComparisonContainer
                                traces={selectedRoutesData} // Pass the filtered historical data
                                SectionComponent={ComparisonItem} // ComparisonItem renders HistoryTraceVisualizer internally
                                isMinimalView={isMinimalView} // Pass the view mode state
                                reversedStates={reversedStates} // Pass the reverse states object
                                onToggleReverse={handleToggleReverse} // Pass the reverse handler
                                isHighlightingActive={isHighlightingActive} // Pass highlight active state
                                highlightedIPs={highlightedIPs}             // Pass set of IPs to highlight
                             />
                         </Box>
                    ) : (
                        // Show an informational message if no routes are selected yet
                         <Alert
                            severity="info"
                            icon={<CompareArrowsIcon />}
                            variant="outlined" // Use outlined for less emphasis
                            sx={{ mt: 3 }}
                         >
                            Select two or more routes (Combined, Direct, or MAC) from the list above to compare them side-by-side.
                            Use the <PaletteOutlinedIcon fontSize='small' sx={{verticalAlign: 'bottom', mx: 0.5}}/> button (enabled when applicable) to highlight devices (by IP) appearing in multiple selected traces.
                            Use <ViewCompactIcon fontSize='small' sx={{verticalAlign: 'bottom', mx: 0.5}}/> to toggle a minimal view.
                            Individual traces can be visually reversed using the swap icon (<SwapHorizIcon fontSize='small' sx={{verticalAlign: 'bottom'}}/>) in their header.
                         </Alert>
                    )}
                </>
            )}
        </Box>
    );
};

export default ComparisonPage;

// ----- End File: src\pages\ComparisonPage.jsx -----
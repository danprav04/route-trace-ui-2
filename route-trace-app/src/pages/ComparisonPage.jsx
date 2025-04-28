// ----- File: src\pages\ComparisonPage.jsx -----

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box, Typography, Alert, Paper, Stack, ToggleButton, Tooltip, Button,
    colors, // Import MUI colors object
    alpha // Import alpha for background colors
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import PaletteIcon from '@mui/icons-material/Palette';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ComparisonSelector from '../components/Comparison/ComparisonSelector';
import RouteComparisonContainer from '../components/RouteTrace/RouteComparisonContainer';
import ComparisonItem from '../components/Comparison/ComparisonItem';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { fetchAllHistory, resetHistoryError } from '../store/slices/historySlice';

// Define a palette of distinct colors for highlighting IPs
// Using MUI color names. Adjust shades as needed (e.g., 400/500/600).
const HIGHLIGHT_COLORS = [
  colors.red[500],
  colors.blue[500],
  colors.green[600], // Darker green for better contrast potentially
  colors.purple[500],
  colors.orange[600],
  colors.cyan[500],
  colors.pink[400],
  colors.teal[500],
  colors.lime[700], // Darker lime
  colors.indigo[400],
  colors.amber[600],
  colors.lightBlue[500],
];

const ComparisonPage = () => {
    const dispatch = useDispatch();
    const { allHistory, allHistoryStatus, error: historyError } = useSelector((state) => state.history);
    const [selectedRouteIds, setSelectedRouteIds] = useState([]);
    const [isMinimalView, setIsMinimalView] = useState(false);
    const [reversedStates, setReversedStates] = useState({});
    const [isHighlightingActive, setIsHighlightingActive] = useState(false);

    useEffect(() => {
        if (allHistoryStatus === 'idle' || allHistoryStatus === 'failed') {
            dispatch(fetchAllHistory());
        }
    }, [allHistoryStatus, dispatch]);

    const selectedRoutesData = useMemo(() => {
        return allHistory.filter(route => selectedRouteIds.includes(route.id));
    }, [allHistory, selectedRouteIds]);

    // Calculate shared IPs and the color map
    const { highlightedIPs, ipColorMap } = useMemo(() => {
        if (selectedRoutesData.length <= 1) {
            return { highlightedIPs: new Set(), ipColorMap: new Map() };
        }

        const ipCounts = new Map();
        selectedRoutesData.forEach(trace => {
            const allHops = [
                ...(trace.mainRouteTrace || []),
                ...(trace.sourceMacTrace || []),
                ...(trace.destinationMacTrace || []),
            ];
            const uniqueIPsInTrace = new Set(allHops.map(hop => hop?.ip).filter(Boolean));
            uniqueIPsInTrace.forEach(ip => {
                ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
            });
        });

        const ipsToHighlight = new Set();
        const colorMap = new Map();
        let colorIndex = 0;

        for (const [ip, count] of ipCounts.entries()) {
            if (count > 1) {
                ipsToHighlight.add(ip);
                // Assign color from palette, wrapping around if necessary
                colorMap.set(ip, HIGHLIGHT_COLORS[colorIndex % HIGHLIGHT_COLORS.length]);
                colorIndex++;
            }
        }
        // console.log("IPs to Highlight:", ipsToHighlight);
        // console.log("IP Color Map:", colorMap);
        return { highlightedIPs: ipsToHighlight, ipColorMap: colorMap };

    }, [selectedRoutesData]); // Recalculate only when selected data changes


    const handleSelectionChange = (selectedIds) => {
        setSelectedRouteIds(selectedIds);
        setIsHighlightingActive(false); // Reset highlighting on selection change
    };

    const handleViewToggle = () => setIsMinimalView(!isMinimalView);
    const handleHighlightToggle = () => setIsHighlightingActive(!isHighlightingActive);
    const handleToggleReverse = (traceId) => {
        setReversedStates(prev => ({ ...prev, [traceId]: !prev[traceId] }));
    };

    if (allHistoryStatus === 'loading') {
        return <LoadingSpinner message="Loading route history..." />;
    }

    const canCompare = selectedRoutesData.length >= 2;
    const canHighlight = canCompare && highlightedIPs.size > 0;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                    Compare Historical Traces
                </Typography>
                {allHistoryStatus === 'succeeded' && (
                    <Stack direction="row" spacing={1}>
                        {/* Highlight Toggle */}
                        <Tooltip title={isHighlightingActive ? "Disable IP Highlighting" : (canHighlight ? "Highlight Common IPs (Unique Colors)" : "No common IPs found to highlight")}>
                           <span>
                             <ToggleButton
                                value="highlight"
                                selected={isHighlightingActive}
                                onChange={handleHighlightToggle}
                                size="small"
                                aria-label="Toggle IP highlighting"
                                disabled={!canHighlight} // Disable if < 2 traces or no IPs to highlight
                            >
                                {isHighlightingActive ? <PaletteIcon color="warning"/> : <PaletteOutlinedIcon />}
                             </ToggleButton>
                           </span>
                        </Tooltip>
                        {/* Minimal View Toggle */}
                        <Tooltip title={isMinimalView ? "Show Full Details" : "Show Minimal View (Hops Only)"}>
                           <span>
                            <ToggleButton
                                value="minimal"
                                selected={isMinimalView}
                                onChange={handleViewToggle}
                                size="small"
                                aria-label="Toggle minimal view"
                                disabled={selectedRoutesData.length === 0}
                            >
                                {isMinimalView ? <ViewHeadlineIcon /> : <ViewCompactIcon />}
                            </ToggleButton>
                           </span>
                        </Tooltip>
                        {/* Reset View Button */}
                        <Tooltip title="Reset Minimal View & Reversed Traces">
                           <span>
                             <Button
                                size="small"
                                variant='outlined'
                                onClick={() => { setIsMinimalView(false); setReversedStates({}); }}
                                disabled={selectedRoutesData.length === 0}
                                sx={{ minWidth: 'auto', px: 1 }}
                             >
                                Reset View
                             </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                 )}
             </Stack>

            {allHistoryStatus === 'failed' && (
                <ErrorMessage error={historyError} title="Could not load route history" />
            )}

            {allHistoryStatus === 'succeeded' && (
                <>
                    <ComparisonSelector
                        availableRoutes={allHistory}
                        selectedIds={selectedRouteIds}
                        onChange={handleSelectionChange}
                    />

                    {selectedRoutesData.length > 0 ? (
                         <Box sx={{ mt: 3 }}>
                             <RouteComparisonContainer
                                traces={selectedRoutesData}
                                SectionComponent={ComparisonItem}
                                isMinimalView={isMinimalView}
                                reversedStates={reversedStates}
                                onToggleReverse={handleToggleReverse}
                                isHighlightingActive={isHighlightingActive} // Pass highlight state
                                highlightedIPs={highlightedIPs}             // Pass set of IPs (still useful for check)
                                ipColorMap={ipColorMap}                     // Pass the new color map
                             />
                         </Box>
                    ) : (
                         <Alert severity="info" icon={<CompareArrowsIcon />} variant="outlined" sx={{ mt: 3 }}>
                            Select two or more routes from the list above to compare them side-by-side.
                            Use the <PaletteOutlinedIcon fontSize='small' sx={{verticalAlign: 'bottom', mx: 0.5}}/> button (enabled when applicable) to highlight devices (by IP) appearing in multiple selected traces with unique colors.
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
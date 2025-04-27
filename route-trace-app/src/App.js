// ----- File: src\App.js -----
import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
    Box,
    CssBaseline,
    ThemeProvider,
    Toolbar,
    AppBar,
    IconButton,
    Typography,
    Container,
    createTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginPage from './pages/LoginPage';
import RouteTracePage from './pages/RouteTracePage'; // Combined Trace
import MacTracePage from './pages/MacTracePage'; // MAC Trace
import DirectRouteTracePage from './pages/DirectRouteTracePage'; // Direct Route Trace
import HistoryPage from './pages/HistoryPage';
import AllRoutesPage from './pages/AllRoutesPage';
import ComparisonPage from './pages/ComparisonPage';
import NotFoundPage from './pages/NotFoundPage';
import Sidebar from './components/Common/Sidebar';
import { useAuth } from './hooks/useAuth';
import getDesignTokens from './theme';

const drawerWidth = 240;

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Default theme mode preference can be set here or from localStorage
  const [mode, setMode] = useState(() => {
      const savedMode = localStorage.getItem('themeMode');
      // Add system preference check as a fallback
      // const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedMode === 'dark' ? 'dark' : 'light'; // Default to light if no preference saved
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Memoize the color mode toggle function
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    [], // Empty dependency array means this object doesn't change
  );

  // Memoize the theme based on the mode
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures baseline styles and background color */}
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>

        {/* Render Sidebar only if authenticated */}
        {isAuthenticated && (
          <Sidebar
            drawerWidth={drawerWidth}
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            mode={mode}
            toggleColorMode={colorMode.toggleColorMode}
          />
        )}

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: isAuthenticated ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
            // Add Toolbar height for spacing below the potential mobile AppBar
            // Use Container to center content and provide max width if desired
            // For full-width pages, you might remove Container or adjust its props
          }}
        >
           {/* Mobile-only AppBar */}
           {isAuthenticated && (
                <AppBar
                    position="fixed"
                    elevation={1} // Subtle elevation
                    sx={{
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        ml: { sm: `${drawerWidth}px` },
                        display: { xs: 'block', sm: 'none' }, // Show only on extra-small screens
                        backdropFilter: 'blur(8px)', // Optional: Add blur effect
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }} // Ensure button hides on larger screens too
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                            RouteTrace
                        </Typography>
                        {/* Optional: Add theme toggle or other actions to mobile app bar */}
                    </Toolbar>
                </AppBar>
            )}

             {/* Add a Toolbar component here to create space below the fixed AppBar
                 Only necessary if the AppBar is always visible (e.g., even on desktop),
                 or if the mobile AppBar exists. */}
            <Toolbar sx={{ display: { xs: 'block', sm: 'none' }}} /> {/* Spacer for mobile app bar */}

            {/* Page Content Container */}
            <Container maxWidth="xl" sx={{ py: 3, px: {xs: 2, sm: 3} }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><RouteTracePage /></ProtectedRoute>} />
                    <Route path="/mac-trace" element={<ProtectedRoute><MacTracePage /></ProtectedRoute>} />
                    <Route path="/direct-route-trace" element={<ProtectedRoute><DirectRouteTracePage /></ProtectedRoute>} />
                    <Route path="/comparison" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="/all-routes" element={<ProtectedRoute><AllRoutesPage /></ProtectedRoute>} />

                    {/* Catch-all Not Found Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
// ----- File: src/App.js -----

import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
    Box,
    CssBaseline,
    ThemeProvider,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Container,
    createTheme // Need createTheme if not directly using the function result
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginPage from './pages/LoginPage';
import RouteTracePage from './pages/RouteTracePage'; // Combined Trace
import MacTracePage from './pages/MacTracePage'; // New MAC Trace
import DirectRouteTracePage from './pages/DirectRouteTracePage'; // New Direct Route Trace
import HistoryPage from './pages/HistoryPage';
import AllRoutesPage from './pages/AllRoutesPage';
import NotFoundPage from './pages/NotFoundPage';
import Sidebar from './components/Common/Sidebar'; // Import the new Sidebar
import { useAuth } from './hooks/useAuth';
import getDesignTokens from './theme'; // Import theme config function

const drawerWidth = 240; // Define drawer width here

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  // State to manage theme mode. Could use localStorage for persistence.
  const [mode, setMode] = useState(() => {
      // Example: Read initial mode from localStorage or default to 'light'
      const savedMode = localStorage.getItem('themeMode');
      return savedMode === 'dark' ? 'dark' : 'light';
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Theme switching logic
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          // Example: Persist mode to localStorage
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  // Create the theme based on the current mode
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply baseline styles & background based on theme */}
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

        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: isAuthenticated ? `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(3)})` : theme.spacing(3),
            pb: 3, // Bottom padding
            px: 3, // Horizontal padding
            width: isAuthenticated ? { md: `calc(100% - ${drawerWidth}px)` } : '100%',
            ml: isAuthenticated ? { md: `${drawerWidth}px` } : 0,
            transition: theme.transitions.create(['margin', 'width'], {
                 easing: theme.transitions.easing.sharp,
                 duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
           {/* AppBar for mobile toggle and title */}
           {isAuthenticated && (
                <AppBar
                    position="fixed"
                    elevation={1}
                    sx={{
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        ml: { md: `${drawerWidth}px` },
                        display: { xs: 'block', md: 'none' }
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            RouteTrace {/* Title can be dynamic */}
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

             <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/" // Combined Trace (Original)
                    element={
                    <ProtectedRoute>
                        <RouteTracePage />
                    </ProtectedRoute>
                    }
                />
                 <Route
                    path="/mac-trace" // New MAC Trace
                    element={
                    <ProtectedRoute>
                        <MacTracePage />
                    </ProtectedRoute>
                    }
                />
                 <Route
                    path="/direct-route-trace" // New Direct Route Trace
                    element={
                    <ProtectedRoute>
                        <DirectRouteTracePage />
                    </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                    <ProtectedRoute>
                        <HistoryPage />
                    </ProtectedRoute>
                    }
                />
                <Route
                    path="/all-routes"
                    element={
                    <ProtectedRoute>
                        <AllRoutesPage />
                    </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
             </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

// ----- End File: src/App.js -----
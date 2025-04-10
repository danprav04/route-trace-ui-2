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
import RouteTracePage from './pages/RouteTracePage';
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
  // Use createTheme directly with the result of getDesignTokens
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
            // Add padding top to account for AppBar height only if AppBar is rendered
            pt: isAuthenticated ? `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(3)})` : theme.spacing(3),
            pb: 3, // Bottom padding
            px: 3, // Horizontal padding
            width: isAuthenticated ? { md: `calc(100% - ${drawerWidth}px)` } : '100%', // Adjust width if drawer is present
            ml: isAuthenticated ? { md: `${drawerWidth}px` } : 0, // Ensure content doesn't overlap with permanent drawer on desktop
            transition: theme.transitions.create(['margin', 'width'], { // Smooth transition for sidebar appearance
                 easing: theme.transitions.easing.sharp,
                 duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
           {/* AppBar for mobile toggle and title */}
           {isAuthenticated && (
                <AppBar
                    position="fixed"
                    elevation={1} // Consistent with theme definition
                    sx={{
                        width: { md: `calc(100% - ${drawerWidth}px)` }, // Only cover main content area on desktop
                        ml: { md: `${drawerWidth}px` }, // Position correctly next to drawer on desktop
                        display: { xs: 'block', md: 'none' } // Only show AppBar on mobile where sidebar is temporary
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }} // Show only on mobile
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            RouteTrace {/* You can make this dynamic based on page */}
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}


          {/* Container for centering and max-width (optional, adjust maxWidth as needed) */}
          {/* Using Container might add extra padding, check if needed or just use the Box */}
          {/* <Container maxWidth="xl"> */}
             <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={
                    <ProtectedRoute>
                        <RouteTracePage />
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
                        {/* Add role check here if needed in future */}
                        <AllRoutesPage />
                    </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
             </Routes>
          {/* </Container> */}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

// ----- End File: src/App.js -----
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
    createTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginPage from './pages/LoginPage';
import RouteTracePage from './pages/RouteTracePage'; // Combined Trace
import MacTracePage from './pages/MacTracePage'; // MAC Trace
import DirectRouteTracePage from './pages/DirectRouteTracePage'; // Direct Route Trace
import HistoryPage from './pages/HistoryPage';
import AllRoutesPage from './pages/AllRoutesPage';
import ComparisonPage from './pages/ComparisonPage'; // <-- Import the new Comparison Page
import NotFoundPage from './pages/NotFoundPage';
import Sidebar from './components/Common/Sidebar';
import { useAuth } from './hooks/useAuth';
import getDesignTokens from './theme';

const drawerWidth = 240;

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState(() => {
      const savedMode = localStorage.getItem('themeMode');
      return savedMode === 'dark' ? 'dark' : 'light';
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
    [],
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>

        {isAuthenticated && (
          <Sidebar
            drawerWidth={drawerWidth}
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            mode={mode}
            toggleColorMode={colorMode.toggleColorMode}
          />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: isAuthenticated ? `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(3)})` : theme.spacing(3),
            pb: 3,
            px: 3,
            width: isAuthenticated ? { md: `calc(100% - ${drawerWidth}px)` } : '100%',
            ml: isAuthenticated ? { md: `${drawerWidth}px` } : 0,
            transition: theme.transitions.create(['margin', 'width'], {
                 easing: theme.transitions.easing.sharp,
                 duration: theme.transitions.duration.leavingScreen,
            }),
            // Ensure main content area can scroll if needed
            overflowY: 'auto',
          }}
        >
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
                            RouteTrace
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

             <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/" // Combined Trace
                    element={
                    <ProtectedRoute>
                        <RouteTracePage />
                    </ProtectedRoute>
                    }
                />
                 <Route
                    path="/mac-trace" // MAC Trace
                    element={
                    <ProtectedRoute>
                        <MacTracePage />
                    </ProtectedRoute>
                    }
                />
                 <Route
                    path="/direct-route-trace" // Direct Route Trace
                    element={
                    <ProtectedRoute>
                        <DirectRouteTracePage />
                    </ProtectedRoute>
                    }
                />
                {/* Add the new Comparison Page route */}
                 <Route
                    path="/comparison"
                    element={
                    <ProtectedRoute>
                        <ComparisonPage />
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
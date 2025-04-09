import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RouteTracePage from './pages/RouteTracePage';
import HistoryPage from './pages/HistoryPage';
import AllRoutesPage from './pages/AllRoutesPage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './components/Common/Navbar';
import { useAuth } from './hooks/useAuth';
import { useSelector } from 'react-redux';

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
  const { isAuthenticated } = useAuth(); // Get auth status for Navbar conditional rendering

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && <Navbar />} {/* Show Navbar only when logged in */}
      {/* Use Container to constrain max width and center content */}
      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 3, mt: isAuthenticated ? 8 : 0 }}> {/* Add margin-top if Navbar exists (64px + padding) */}
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
      </Container>
    </Box>
  );
}

export default App;
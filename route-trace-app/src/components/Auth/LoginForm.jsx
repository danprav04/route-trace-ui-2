import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { loginUser, resetAuthError } from '../../store/slices/authSlice';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || "/"; // Redirect path after login

  // Redirect if already logged in
  useEffect(() => {
      if (isAuthenticated) {
          navigate(from, { replace: true });
      }
  }, [isAuthenticated, navigate, from]);

  // Clear error when component mounts or unmounts
  useEffect(() => {
      dispatch(resetAuthError());
      return () => {
          dispatch(resetAuthError());
      };
  }, [dispatch]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return; // Basic validation
    dispatch(loginUser({ username, password }))
      .unwrap() // Allows chaining .then() and .catch() on the dispatch
      .then(() => {
        navigate(from, { replace: true }); // Redirect on successful login
      })
      .catch((err) => {
        // Error is already handled by the slice and displayed via useSelector
        console.error("Login failed:", err);
      });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        margin: 'auto',
        mt: 8,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
      <TextField
        label="Username"
        variant="outlined"
        margin="normal"
        required
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        required
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ mt: 3, mb: 2, position: 'relative' }}
      >
        {loading ? <CircularProgress size={24} sx={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             marginTop: '-12px',
             marginLeft: '-12px',
        }}/> : 'Login'}
      </Button>
    </Box>
  );
};

export default LoginForm;
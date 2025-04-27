// ----- File: src\components\Auth\LoginForm.jsx -----
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Container,
    Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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

  // Clear error when component mounts or location changes (if error persists across navigation)
  useEffect(() => {
      dispatch(resetAuthError());
      // Optional: Return cleanup function if needed, though usually handled by slice state
      // return () => { dispatch(resetAuthError()); };
  }, [dispatch, location]); // Depend on location to clear error if user navigates away and back


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
        // Optionally log for debugging, but avoid user-facing console errors in prod
        // console.error("Login failed:", err);
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
          elevation={3}
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: (theme) => theme.spacing(3, 4), // Adjust padding
            borderRadius: 2, // Softer corners
          }}
       >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" gutterBottom>
          Sign in
        </Typography>
        {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
            </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            error={!!error} // Highlight field if there's a login error
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={!!error} // Highlight field if there's a login error
          />
          {/* Consider adding 'Forgot password?' link or Remember me checkbox if needed */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !username || !password} // Disable if loading or fields empty
            sx={{ mt: 3, mb: 2, position: 'relative', height: 40 }} // Set fixed height
          >
            {loading ? (
                <CircularProgress
                     size={24}
                     sx={{
                         color: 'inherit', // Inherit button text color
                         position: 'absolute',
                         top: '50%',
                         left: '50%',
                         marginTop: '-12px',
                         marginLeft: '-12px',
                    }}
                />
            ) : (
                'Sign In'
            )}
          </Button>
          {/* Optional: Add link to Sign Up page if applicable */}
          {/* <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid> */}
        </Box>
      </Paper>
      {/* Optional: Add copyright or footer */}
      {/* <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
        {'Copyright © '}
        <Link color="inherit" href="https://yourwebsite.com/">
          Your Website
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography> */}
    </Container>
  );
};

export default LoginForm;
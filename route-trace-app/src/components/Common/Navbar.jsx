import React from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Example icon
import { logoutUser } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
         <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="logo"
          component={RouterLink}
          to="/"
          sx={{ mr: 1 }}
        >
          <AccountTreeIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          RouteTrace
        </Typography>
        <Box sx={{ '& button': { ml: 1 } }}>
             <Button color="inherit" component={RouterLink} to="/">
                 Trace Route
            </Button>
             <Button color="inherit" component={RouterLink} to="/history">
                 My History
            </Button>
              <Button color="inherit" component={RouterLink} to="/all-routes">
                 All Routes
            </Button>
            <Button color="inherit" onClick={handleLogout}>
                Logout
            </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
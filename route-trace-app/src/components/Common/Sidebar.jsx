// ----- File: src\components\Common\Sidebar.jsx -----
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer, Box, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Toolbar, Divider, Typography, IconButton, Tooltip,
    Avatar, Stack, Button // <-- Added Button import
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RouteIcon from '@mui/icons-material/Route'; // Combined Trace
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'; // MAC Trace
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'; // Direct Route Trace
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Comparison Page
import HistoryIcon from '@mui/icons-material/History'; // My History
import PeopleIcon from '@mui/icons-material/People'; // All Routes
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode
import { logoutUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';

// Helper to get initials from username
const getInitials = (name = '') => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2); // Max 2 initials
};


const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, mode, toggleColorMode }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login', { replace: true }); // Use replace to prevent going back to protected routes
    };

    const menuItems = [
        { text: 'Combined Trace', icon: <RouteIcon />, path: '/' },
        { text: 'Direct Route Trace', icon: <NetworkCheckIcon />, path: '/direct-route-trace' },
        { text: 'MAC Trace', icon: <SettingsEthernetIcon />, path: '/mac-trace' },
        { text: 'Compare Traces', icon: <CompareArrowsIcon />, path: '/comparison' },
        { text: 'My History', icon: <HistoryIcon />, path: '/history' },
        { text: 'All Routes', icon: <PeopleIcon />, path: '/all-routes' }, // Consider conditional rendering based on user role
    ];

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header Section */}
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', px: 2, gap: 1.5 }}>
                <AccountTreeIcon fontSize="large" color="primary" />
                <Typography variant="h6" noWrap component="div" color="primary.main" fontWeight="bold">
                    RouteTrace
                </Typography>
            </Toolbar>
            <Divider />

            {/* Navigation Links */}
            <List sx={{ flexGrow: 1, py: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            selected={location.pathname === item.path}
                            onClick={handleDrawerToggle} // Close mobile drawer on item click
                            sx={{
                                minHeight: 48,
                                justifyContent: 'initial',
                                px: 2.5,
                                borderRadius: 1, // Add slight rounding
                                mx: 1, // Add horizontal margin
                                mb: 0.5, // Add vertical spacing
                                '&.Mui-selected': { // Style for selected item
                                    backgroundColor: (theme) => theme.palette.action.selected,
                                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                                        color: (theme) => theme.palette.primary.main,
                                        fontWeight: 'medium',
                                    },
                                },
                                '&:hover': { // Style for hover
                                     backgroundColor: (theme) => theme.palette.action.hover,
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center', color: 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} sx={{ opacity: 1 }} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />

            {/* User Info and Actions Footer */}
            <Box sx={{ p: 2, mt: 'auto' }}> {/* Push to bottom */}
                 <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
                        {getInitials(user?.username)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                        {user?.username || 'Unknown User'}
                    </Typography>
                     <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`} sx={{ ml: 'auto' }}>
                        <IconButton onClick={toggleColorMode} color="inherit" size="small">
                            {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                 </Stack>

                <Button
                    fullWidth
                    variant="outlined" // Use outlined or text for less emphasis
                    color="inherit" // Inherit color, could be error for destructive action
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    size="small"
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} // Use sm breakpoint
            aria-label="main navigation"
        >
            {/* Temporary Drawer for Mobile */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }} // Better open performance on mobile.
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                         boxSizing: 'border-box',
                         width: drawerWidth,
                         borderRight: 'none' // Remove border if using elevation or distinct bg
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Permanent Drawer for Desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: (theme) => `1px solid ${theme.palette.divider}` // Subtle border
                    },
                }}
                open // Permanent drawer is always open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
// ----- End File: src\components\Common\Sidebar.jsx -----
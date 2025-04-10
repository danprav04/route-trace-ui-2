// ----- File: src/components/Common/Sidebar.jsx -----

import React from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer, Box, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Toolbar, Divider, Typography, IconButton, Tooltip
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RouteIcon from '@mui/icons-material/Route'; // Combined Trace
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'; // MAC Trace
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'; // Direct Route Trace
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // <-- Icon for Comparison Page
import HistoryIcon from '@mui/icons-material/History'; // My History
import PeopleIcon from '@mui/icons-material/People'; // All Routes
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode
import { logoutUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, mode, toggleColorMode }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    // Updated Menu Items including Comparison
    const menuItems = [
        { text: 'Combined Trace', icon: <RouteIcon />, path: '/' },
        { text: 'Direct Route Trace', icon: <NetworkCheckIcon />, path: '/direct-route-trace' },
        { text: 'MAC Trace', icon: <SettingsEthernetIcon />, path: '/mac-trace' },
        { text: 'Compare Traces', icon: <CompareArrowsIcon />, path: '/comparison' }, // <-- New Comparison Link
        { text: 'My History', icon: <HistoryIcon />, path: '/history' },
        { text: 'All Routes', icon: <PeopleIcon />, path: '/all-routes' },
    ];

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <AccountTreeIcon fontSize="large" color="primary" />
                <Typography variant="h6" noWrap component="div" color="primary">
                    RouteTrace
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            selected={location.pathname === item.path}
                            onClick={handleDrawerToggle} // Close mobile drawer on item click
                        >
                            <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                 <ListItem disablePadding>
                      <ListItemText sx={{pl: 2}} primary={`User: ${user?.username || 'Unknown'}`} />
                      <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                        <IconButton onClick={toggleColorMode} color="inherit">
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                      </Tooltip>
                 </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon sx={{ minWidth: '40px' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            aria-label="mailbox folders"
        >
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;

// ----- End File: src/components/Common/Sidebar.jsx -----
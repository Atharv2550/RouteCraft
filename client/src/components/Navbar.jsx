import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExploreIcon from '@mui/icons-material/Explore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import LuggageIcon from '@mui/icons-material/Luggage';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppTheme } from '../context/ThemeContext.jsx';
import NotificationMenu from './NotificationMenu.jsx';

export default function Navbar({ onMobileNavToggle }) {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
        {/* Left: Mobile Toggle & Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isAuthenticated && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMobileNavToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component={Link}
            to={isAuthenticated ? '/dashboard' : '/'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              <ExploreIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: mode === 'dark' ? '#f1f5f9' : 'transparent',
                  lineHeight: 1.1
                }}
              >
                RouteCraft
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.65rem', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}
              >
                Craft your perfect itinerary
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center: Quick Links on desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Button component={Link} to="/destinations" color="inherit" sx={{ fontWeight: 600 }}>
            Destinations
          </Button>
          <Button component={Link} to="/features" color="inherit" sx={{ fontWeight: 600 }}>
            Features
          </Button>
          {isAuthenticated && (
            <Button component={Link} to="/trips" color="inherit" sx={{ fontWeight: 600 }}>
              My Trips
            </Button>
          )}
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" onClick={toggleTheme} title="Toggle theme">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <NotificationMenu />

              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate('/trips?create=true')}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                New Trip
              </Button>

              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5, ml: 0.5 }}>
                <Avatar
                  src={user?.avatarUrl}
                  alt={user?.name}
                  sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 700 }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: { width: 220, borderRadius: 3, mt: 1 }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/trips'); }}>
                  <ListItemIcon><LuggageIcon fontSize="small" /></ListItemIcon>
                  My Trips
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                  Account Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" variant="outlined" color="primary">
                Sign In
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="primary"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Get Started
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}


import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Button
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LuggageIcon from '@mui/icons-material/Luggage';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'My Trips', path: '/trips', icon: LuggageIcon },
  { label: 'Destinations', path: '/destinations', icon: TravelExploreIcon },
  { label: 'Saved Wishlist', path: '/wishlist', icon: FavoriteBorderIcon },
  { label: 'Profile & Settings', path: '/profile', icon: PersonOutlineIcon }
];

export const DRAWER_WIDTH = 260;

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => handleNavClick('/trips?create=true')}
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 700 }}
        >
          Plan New Trip
        </Button>
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      <List sx={{ px: 1.5, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected =
            item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  borderRadius: 2.5,
                  py: 1.2,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#ffffff'
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? '#ffffff' : 'text.secondary'
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 700 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, m: 2, borderRadius: 3, bgcolor: 'action.hover', textAlign: 'center' }}>
        <Typography variant="caption" fontWeight={700} color="primary" display="block">
          Need assistance?
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Smart suggestions & route optimization guide your travel.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            top: 65, // below AppBar
            height: 'calc(100% - 65px)'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}


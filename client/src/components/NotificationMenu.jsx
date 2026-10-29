import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItemText
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';

export default function NotificationMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      // Quiet fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s poll as fallback
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // Ignore
    }
  };

  const handleClickNotification = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        // Ignore
      }
    }
    handleClose();
    if (notif.relatedTrip) {
      navigate(`/trips/${notif.relatedTrip}`);
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} sx={{ mr: 1 }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 340, maxHeight: 440, borderRadius: 3, p: 0 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
              sx={{ fontSize: '0.75rem', p: 0.5 }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        <List sx={{ p: 0, overflowY: 'auto', maxHeight: 340 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet.
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => handleClickNotification(notif)}
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  whiteSpace: 'normal'
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={notif.isRead ? 500 : 700}>
                      {notif.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {notif.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </MenuItem>
            ))
          )}
        </List>
      </Menu>
    </>
  );
}


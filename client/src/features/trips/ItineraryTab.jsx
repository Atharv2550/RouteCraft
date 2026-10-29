import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RouteIcon from '@mui/icons-material/Route';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '../../lib/axios.js';
import SmartSuggestionsPanel from './SmartSuggestionsPanel.jsx';
import ActivityDialog from './ActivityDialog.jsx';
import OptimizeRouteDialog from './OptimizeRouteDialog.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function ItineraryTab({
  trip,
  days = [],
  itemsByDay = {},
  suggestions = [],
  userRole = 'VIEWER',
  onRefresh
}) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [optimizeProposal, setOptimizeProposal] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [applyingOptimize, setApplyingOptimize] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeItemForMenu, setActiveItemForMenu] = useState(null);

  const canEdit = userRole === 'OWNER' || userRole === 'EDITOR';

  const currentDay = days[selectedDayIdx];
  const currentItems = currentDay ? itemsByDay[currentDay._id.toString()] || [] : [];

  // Estimated day cost
  const dayCostMinor = currentItems.reduce((sum, it) => sum + (it.estimatedCostMinor || 0), 0);
  const dayCostMajor = (dayCostMinor / 100).toFixed(2);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setActivityDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setActionMenuAnchor(null);
    setEditingItem(item);
    setActivityDialogOpen(true);
  };

  const handleDeleteItem = async (itemId) => {
    setActionMenuAnchor(null);
    try {
      await api.delete(`/trips/${trip._id}/itinerary/items/${itemId}`);
      onRefresh();
    } catch (e) {
      // Quiet fail
    }
  };

  const handleSaveActivity = async (payload) => {
    if (editingItem) {
      await api.patch(`/trips/${trip._id}/itinerary/items/${editingItem._id}`, payload);
    } else {
      await api.post(`/trips/${trip._id}/itinerary/items`, payload);
    }
    onRefresh();
  };

  const handleOptimizeRoute = async () => {
    if (!currentDay) return;
    setOptimizing(true);
    try {
      const res = await api.post(`/trips/${trip._id}/itinerary/optimize`, {
        dayId: currentDay._id
      });
      if (res.data.success) {
        setOptimizeProposal(res.data.proposal);
        setOptimizeDialogOpen(true);
      }
    } catch (e) {
      // Ignore
    } finally {
      setOptimizing(false);
    }
  };

  const handleApplyOptimization = async () => {
    if (!optimizeProposal || !currentDay) return;
    setApplyingOptimize(true);
    try {
      await api.post(`/trips/${trip._id}/itinerary/apply-optimize`, {
        dayId: currentDay._id,
        proposedOrder: optimizeProposal.proposedOrder
      });
      setOptimizeDialogOpen(false);
      onRefresh();
    } catch (e) {
      // Ignore
    } finally {
      setApplyingOptimize(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`${api.defaults.baseURL}/trips/${trip._id}/export/itinerary.pdf`, '_blank');
  };

  return (
    <Box>
      {/* Smart Suggestions Rule-Based Insights Drawer */}
      <SmartSuggestionsPanel suggestions={suggestions} />

      {/* Days Tabs Bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 3 }}>
        <Tabs
          value={selectedDayIdx}
          onChange={(e, val) => setSelectedDayIdx(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {days.map((d, idx) => {
            const dateStr = new Date(d.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });
            return <Tab key={d._id} label={`Day ${d.dayNumber}: ${dateStr}`} sx={{ fontWeight: 600 }} />;
          })}
        </Tabs>

        <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
          >
            Export Itinerary PDF
          </Button>
          {canEdit && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<RouteIcon />}
                onClick={handleOptimizeRoute}
                disabled={optimizing || currentItems.length < 2}
              >
                Optimize Route
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                Add Activity
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {/* Day Overview Header */}
      {currentDay && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {currentDay.title || `Day ${currentDay.dayNumber}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(currentDay.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">Planned Daily Cost</Typography>
            <Typography variant="subtitle1" fontWeight={700} color="secondary.main">
              {trip.currency} {dayCostMajor}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Activity Timeline List */}
      {currentItems.length === 0 ? (
        <EmptyState
          title={`No activities scheduled for Day ${currentDay?.dayNumber || 1}`}
          description="Add places to see, restaurants to try, or transit stops to organize your day."
          actionText={canEdit ? 'Add First Activity' : undefined}
          onAction={handleOpenAdd}
        />
      ) : (
        <Stack spacing={2}>
          {currentItems.map((item, idx) => {
            const timeDisplay = item.startTime
              ? `${item.startTime}${item.endTime ? ' — ' + item.endTime : ''}`
              : 'Flexible Time';

            const costMajor = item.estimatedCostMinor ? (item.estimatedCostMinor / 100).toFixed(2) : '0.00';

            return (
              <Card
                key={item._id}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { sm: 'center' },
                  gap: 2,
                  borderLeft: '5px solid',
                  borderColor: item.isFixedTime ? 'warning.main' : 'primary.main'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                  {/* Order Number Badge */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {item.title}
                      </Typography>
                      <Chip label={item.category} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                      {item.isFixedTime && (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: 13 }} />}
                          label="Locked Slot"
                          size="small"
                          color="warning"
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>

                    {item.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.8 }}>
                        {item.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <AccessTimeIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption" fontWeight={600}>
                          {timeDisplay} ({item.durationMinutes} min)
                        </Typography>
                      </Box>
                      {item.locationName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <LocationOnIcon sx={{ fontSize: 15 }} />
                          <Typography variant="caption" noWrap sx={{ maxWidth: 220 }}>
                            {item.locationName}
                          </Typography>
                        </Box>
                      )}
                      {item.estimatedCostMinor > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: 'secondary.main' }}>
                          <AttachMoneyIcon sx={{ fontSize: 15 }} />
                          <Typography variant="caption" fontWeight={700}>
                            {trip.currency} {costMajor}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {item.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                        Tip: {item.notes}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                  {item.externalUrl && (
                    <IconButton
                      size="small"
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open external link"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  )}
                  {canEdit && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setActiveItemForMenu(item);
                        setActionMenuAnchor(e.currentTarget);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Activity Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleOpenEdit(activeItemForMenu)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Edit Activity" />
        </MenuItem>
        <MenuItem onClick={() => handleDeleteItem(activeItemForMenu?._id)} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Delete Activity" />
        </MenuItem>
      </Menu>

      {/* Activity Modal */}
      <ActivityDialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        onSubmit={handleSaveActivity}
        dayId={currentDay?._id}
        currency={trip.currency}
        initialData={editingItem}
      />

      {/* Route Optimization Proposal Dialog */}
      <OptimizeRouteDialog
        open={optimizeDialogOpen}
        onClose={() => setOptimizeDialogOpen(false)}
        proposal={optimizeProposal}
        dayNumber={currentDay?.dayNumber}
        onApply={handleApplyOptimization}
        applying={applyingOptimize}
      />
    </Box>
  );
}


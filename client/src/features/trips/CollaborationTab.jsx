import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Stack,
  TextField,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../../lib/axios.js';
import { getSocket } from '../../lib/socket.js';
import InviteMemberDialog from './InviteMemberDialog.jsx';
import CreateProposalDialog from './CreateProposalDialog.jsx';

export default function CollaborationTab({
  trip,
  members = [],
  userRole = 'VIEWER',
  currentUserId,
  onRefresh
}) {
  const [votes, setVotes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const canEdit = userRole === 'OWNER' || userRole === 'EDITOR';
  const isOwner = userRole === 'OWNER';

  const fetchVotes = async () => {
    try {
      const res = await api.get(`/trips/${trip._id}/votes`);
      if (res.data.success) {
        setVotes(res.data.proposals);
      }
    } catch (e) {
      // Quiet fail
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/trips/${trip._id}/comments`);
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (e) {
      // Quiet fail
    }
  };

  useEffect(() => {
    fetchVotes();
    fetchComments();

    // Listen to real-time events via Socket.IO
    const socket = getSocket();
    if (socket) {
      socket.emit('join:trip', trip._id);

      socket.on('comment:created', (comment) => {
        setComments((prev) => [...prev, comment]);
      });

      socket.on('vote:updated', () => {
        fetchVotes();
      });

      socket.on('vote:proposal-created', () => {
        fetchVotes();
      });

      socket.on('member:joined', () => {
        onRefresh();
      });

      return () => {
        socket.emit('leave:trip', trip._id);
        socket.off('comment:created');
        socket.off('vote:updated');
        socket.off('vote:proposal-created');
        socket.off('member:joined');
      };
    }
  }, [trip._id]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/trips/${trip._id}/comments`, {
        content: newComment.trim()
      });
      if (res.data.success) {
        setNewComment('');
      }
    } catch (e) {
      // Ignore
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleVote = async (voteId) => {
    try {
      await api.post(`/trips/${trip._id}/votes/${voteId}/toggle`);
      fetchVotes();
    } catch (e) {
      // Ignore
    }
  };

  const handleInviteSubmit = async (payload) => {
    const res = await api.post(`/trips/${trip._id}/invitations`, payload);
    onRefresh();
    return res.data;
  };

  const handleProposalSubmit = async (payload) => {
    await api.post(`/trips/${trip._id}/votes`, payload);
    fetchVotes();
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/trips/${trip._id}/members/${memberId}`);
      onRefresh();
    } catch (e) {
      // Ignore
    }
  };

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Left Column: Team Members & Destination Polls */}
        <Grid item xs={12} md={6}>
          {/* Members List */}
          <Card sx={{ p: 1.5, mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Trip Companions ({members.length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Owner, Editors, and Viewers
                  </Typography>
                </Box>
                {canEdit && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    Invite
                  </Button>
                )}
              </Box>

              <List disablePadding>
                {members.map((m) => {
                  const u = m.user;
                  if (!u) return null;

                  return (
                    <ListItem
                      key={m._id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={m.role}
                            size="small"
                            color={m.role === 'OWNER' ? 'primary' : m.role === 'EDITOR' ? 'secondary' : 'default'}
                            variant="outlined"
                          />
                          {isOwner && m.role !== 'OWNER' && (
                            <IconButton size="small" color="error" onClick={() => handleRemoveMember(m._id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      }
                      sx={{ py: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar src={u.avatarUrl} sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>
                          {u.name?.[0] || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={600}>{u.name} {u._id === currentUserId ? '(You)' : ''}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">{u.email}</Typography>}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>

          {/* Destination Voting Polls */}
          <Card sx={{ p: 1.5 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Destination & Activity Polls
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vote on candidate spots before finalizing
                  </Typography>
                </Box>
                {canEdit && (
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<HowToVoteIcon />}
                    onClick={() => setProposalDialogOpen(true)}
                  >
                    New Poll
                  </Button>
                )}
              </Box>

              {votes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No active voting polls. Propose candidate day trips or dining spots to poll companions!
                </Typography>
              ) : (
                <Stack spacing={2.5}>
                  {votes.map((v) => (
                    <Box key={v._id} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {v.title}
                        </Typography>
                        <Chip
                          label={v.status}
                          size="small"
                          color={v.status === 'OPEN' ? 'secondary' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Candidate: <strong>{v.destinationName}</strong> {v.country && `(${v.country})`}
                      </Typography>

                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {v.voteCount} vote(s)
                          </Typography>
                          <Typography variant="caption" fontWeight={700}>
                            {v.percentage}% consensus
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={v.percentage}
                          color="secondary"
                          sx={{ height: 7, borderRadius: 3 }}
                        />
                      </Box>

                      {v.status === 'OPEN' && canEdit && (
                        <Button
                          size="small"
                          variant={v.hasVoted ? 'contained' : 'outlined'}
                          color="secondary"
                          startIcon={v.hasVoted ? <CheckCircleIcon /> : <HowToVoteIcon />}
                          onClick={() => handleToggleVote(v._id)}
                        >
                          {v.hasVoted ? 'Voted (Click to Revoke)' : 'Cast Vote'}
                        </Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Live Discussion Chat */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1.5 }}>
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ChatIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Team Planning Discussion
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Real-time messages broadcast live to all active trip members
              </Typography>
            </CardContent>

            <Divider />

            {/* Comments Scrollable Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, minHeight: 380, maxHeight: 500 }}>
              {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
                  No messages yet. Say hello and coordinate planning details with your companions!
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {comments.map((c) => {
                    const isSelf = c.author?._id === currentUserId;

                    return (
                      <Box
                        key={c._id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isSelf ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3, px: 0.5 }}>
                          {c.author?.name || 'Member'} • {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: isSelf ? 'primary.main' : 'action.hover',
                            color: isSelf ? '#ffffff' : 'text.primary',
                            maxWidth: '85%'
                          }}
                        >
                          <Typography variant="body2">{c.content}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Input Form */}
            {canEdit && (
              <Box component="form" onSubmit={handleSendComment} sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a note or suggestion..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submittingComment || !newComment.trim()}
                  sx={{ px: 2.5 }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onSubmit={handleInviteSubmit}
      />

      {/* Create Proposal Dialog */}
      <CreateProposalDialog
        open={proposalDialogOpen}
        onClose={() => setProposalDialogOpen(false)}
        onSubmit={handleProposalSubmit}
      />
    </Box>
  );
}


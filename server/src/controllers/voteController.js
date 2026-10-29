import { DestinationVote } from '../models/DestinationVote.js';
import { logActivityAndNotify } from '../services/activityLogger.js';
import { emitToTrip } from '../services/socketService.js';

export async function getVotes(req, res, next) {
  try {
    const trip = req.trip;

    const proposals = await DestinationVote.find({ trip: trip._id })
      .populate('proposedBy', 'name avatarUrl email')
      .populate('votes.user', 'name avatarUrl email')
      .sort({ createdAt: -1 });

    const totalVotesAcrossAll = proposals.reduce((sum, p) => sum + p.votes.length, 0);

    const enriched = proposals.map((p) => {
      const obj = p.toObject();
      obj.voteCount = p.votes.length;
      obj.hasVoted = p.votes.some((v) => v.user?._id?.toString() === req.user._id.toString());
      obj.percentage = totalVotesAcrossAll > 0 ? Math.round((p.votes.length / totalVotesAcrossAll) * 100) : 0;
      return obj;
    });

    return res.status(200).json({
      success: true,
      proposals: enriched,
      totalVotes: totalVotesAcrossAll
    });
  } catch (err) {
    next(err);
  }
}

export async function createProposal(req, res, next) {
  try {
    const trip = req.trip;
    const { title, destinationName, destinationId, country, description, imageUrl } = req.body;

    const proposal = await DestinationVote.create({
      trip: trip._id,
      title,
      destination: destinationId || null,
      destinationName,
      country: country || '',
      description: description || '',
      imageUrl: imageUrl || '',
      proposedBy: req.user._id,
      votes: [{ user: req.user._id }] // Creator auto-votes
    });

    const populated = await DestinationVote.findById(proposal._id)
      .populate('proposedBy', 'name avatarUrl email')
      .populate('votes.user', 'name avatarUrl email');

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'VOTE_PROPOSAL_CREATED',
      resourceType: 'VOTE',
      resourceId: proposal._id,
      summary: `${req.user.name} proposed "${destinationName}" for voting.`,
      notificationTitle: 'New Destination Proposal'
    });

    emitToTrip(trip._id, 'vote:proposal-created', populated);

    return res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      proposal: populated
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleVote(req, res, next) {
  try {
    const trip = req.trip;
    const { voteId } = req.params;
    const userId = req.user._id;

    const proposal = await DestinationVote.findOne({ _id: voteId, trip: trip._id });
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.status === 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Voting has closed for this proposal' });
    }

    const existingIndex = proposal.votes.findIndex((v) => v.user.toString() === userId.toString());

    if (existingIndex > -1) {
      // Remove vote
      proposal.votes.splice(existingIndex, 1);
    } else {
      // Add vote
      proposal.votes.push({ user: userId, votedAt: new Date() });
    }

    await proposal.save();

    const populated = await DestinationVote.findById(proposal._id)
      .populate('proposedBy', 'name avatarUrl email')
      .populate('votes.user', 'name avatarUrl email');

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'VOTE_CAST',
      resourceType: 'VOTE',
      resourceId: proposal._id,
      summary: `${req.user.name} ${existingIndex > -1 ? 'retracted vote from' : 'voted for'} "${proposal.destinationName}".`
    });

    emitToTrip(trip._id, 'vote:updated', populated);

    return res.status(200).json({
      success: true,
      proposal: populated
    });
  } catch (err) {
    next(err);
  }
}

export async function closeVote(req, res, next) {
  try {
    const trip = req.trip;
    const { voteId } = req.params;
    const { isSelected } = req.body;

    const proposal = await DestinationVote.findOne({ _id: voteId, trip: trip._id });
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    proposal.status = 'CLOSED';
    if (isSelected !== undefined) {
      proposal.isSelected = isSelected;
    }
    await proposal.save();

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'VOTE_CLOSED',
      resourceType: 'VOTE',
      resourceId: proposal._id,
      summary: `${req.user.name} closed voting for "${proposal.destinationName}"${proposal.isSelected ? ' and marked it as selected!' : '.'}`,
      notificationTitle: 'Destination Poll Closed'
    });

    emitToTrip(trip._id, 'vote:updated', proposal);

    return res.status(200).json({
      success: true,
      message: 'Poll closed',
      proposal
    });
  } catch (err) {
    next(err);
  }
}

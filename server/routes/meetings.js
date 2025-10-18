import express from 'express';
import { Meeting } from '../models/Meeting.js';
import { sendMeetingInvite } from '../services/emailService.js';
import { authenticate } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Create a scheduled meeting (Protected)
router.post('/schedule', authenticate, async (req, res) => {
  try {
    const { title, description, scheduledDate, duration, hostEmail, hostName, participants } = req.body;

    // Validate required fields
    if (!title || !scheduledDate || !hostEmail || !hostName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique room ID
    const roomId = crypto.randomBytes(8).toString('hex');

    // Create meeting link
    const meetingLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/room/${roomId}`;

    // Create meeting
    const meeting = new Meeting({
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      roomId,
      hostEmail,
      hostName,
      participants: participants || [],
      meetingLink,
      status: 'scheduled'
    });

    await meeting.save();

    // Send invitation emails
    await sendMeetingInvite(meeting);

    res.status(201).json({
      success: true,
      meeting: {
        id: meeting._id,
        title: meeting.title,
        scheduledDate: meeting.scheduledDate,
        roomId: meeting.roomId,
        meetingLink: meeting.meetingLink
      }
    });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
});

// Get meetings for a user (by email)
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const now = new Date();

    // Find meetings where user is host or participant, and meeting is in the future
    const meetings = await Meeting.find({
      $or: [
        { hostEmail: email },
        { 'participants.email': email }
      ],
      scheduledDate: { $gte: now },
      status: { $in: ['scheduled', 'ongoing'] }
    }).sort({ scheduledDate: 1 });

    res.json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get all meetings for a user (including past)
router.get('/user/:email/all', async (req, res) => {
  try {
    const { email } = req.params;

    const meetings = await Meeting.find({
      $or: [
        { hostEmail: email },
        { 'participants.email': email }
      ]
    }).sort({ scheduledDate: -1 });

    res.json({ meetings });
  } catch (error) {
    console.error('Error fetching all meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get a specific meeting by ID
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// Update meeting status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ meeting });
  } catch (error) {
    console.error('Error updating meeting status:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// Cancel a meeting
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ success: true, message: 'Meeting cancelled' });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
});

export default router;

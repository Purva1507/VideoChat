import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  hostEmail: {
    type: String,
    required: true
  },
  hostName: {
    type: String,
    required: true
  },
  participants: [{
    email: {
      type: String,
      required: true
    },
    name: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  meetingLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying upcoming meetings
meetingSchema.index({ scheduledDate: 1, status: 1 });
meetingSchema.index({ hostEmail: 1, scheduledDate: 1 });
meetingSchema.index({ 'participants.email': 1 });

export const Meeting = mongoose.model('Meeting', meetingSchema);

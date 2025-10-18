import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  permissions: {
    canUnmute: {
      type: Boolean,
      default: true
    },
    canEnableVideo: {
      type: Boolean,
      default: true
    },
    canShareScreen: {
      type: Boolean,
      default: true
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const waitingParticipantSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  adminSocketId: {
    type: String,
    required: true
  },
  participants: [participantSchema],
  waitingRoom: [waitingParticipantSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Update lastActivity on save
roomSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

const Room = mongoose.model('Room', roomSchema);

export default Room;

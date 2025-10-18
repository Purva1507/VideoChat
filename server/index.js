import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB } from './config/database.js';
import { findRoom, createRoom, deleteRoom, saveRoom } from './utils/roomStorage.js';
import { initializeEmailService } from './services/emailService.js';
import { startReminderService } from './services/reminderService.js';
import meetingsRouter from './routes/meetings.js';
import authRouter from './routes/auth.js';

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
await connectDB();

// Initialize email service
initializeEmailService();

// Start reminder service
startReminderService();

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/meetings', meetingsRouter);

// In-memory cache for active socket connections (fallback and quick lookup)
// Maps socketId to roomId for quick cleanup on disconnect
const socketToRoom = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a room (with waiting room support)
  socket.on('join', async ({ roomId, displayName }) => {
    console.log(`${displayName} (${socket.id}) joining room ${roomId}`);

    try {
      // Track socket to room mapping
      socketToRoom.set(socket.id, roomId);

      // Find or create room
      let room = await findRoom(roomId);

      if (!room) {
        // Create new room with this user as admin
        console.log(`Room ${roomId} does not exist, creating new room`);
        room = await createRoom({
          roomId,
          adminSocketId: socket.id,
          participants: [{
            socketId: socket.id,
            displayName,
            isAdmin: true,
            permissions: {
              canUnmute: true,
              canEnableVideo: true,
              canShareScreen: true
            }
          }],
          waitingRoom: []
        });
        console.log(`✓ Created new room ${roomId} with admin ${displayName} (${socket.id})`);
      } else {
        console.log(`Found existing room ${roomId} with ${room.participants.length} participants, admin: ${room.adminSocketId}`);
      }

      // Check if current user should be admin
      const isAdmin = socket.id === room.adminSocketId;

      // If no participants in room (admin disconnected), make this user the new admin
      const shouldBecomeAdmin = !isAdmin && room.participants.length === 0;

      if (isAdmin || shouldBecomeAdmin) {
        // Update admin if needed
        if (shouldBecomeAdmin) {
          room.adminSocketId = socket.id;
          console.log(`${displayName} (${socket.id}) is now the admin of room ${roomId}`);
        }

        socket.join(roomId);

        // Check if admin already exists in participants array
        const adminExists = room.participants.some(p => p.socketId === socket.id);

        if (!adminExists) {
          // Add admin to participants if not already there
          room.participants.push({
            socketId: socket.id,
            displayName,
            isAdmin: true,
            permissions: {
              canUnmute: true,
              canEnableVideo: true,
              canShareScreen: true
            }
          });
          await room.save();
        }

        // Get other participants (exclude self)
        const otherParticipants = room.participants
          .filter(p => p.socketId !== socket.id)
          .map(p => ({
            socketId: p.socketId,
            displayName: p.displayName,
            isAdmin: p.isAdmin
          }));

        // Send participant list and mark as admin
        socket.emit('participants', {
          participants: otherParticipants,
          isAdmin: true,
          permissions: {
            canUnmute: true,
            canEnableVideo: true,
            canShareScreen: true
          },
          waitingParticipants: room.waitingRoom.map(w => ({
            socketId: w.socketId,
            displayName: w.displayName,
            joinedAt: w.joinedAt
          }))
        });

        console.log(`${displayName} joined as admin of room ${roomId}`);
      } else {
        // Not admin - check if already admitted or needs to go to waiting room
        const existingParticipant = room.participants.find(p => p.socketId === socket.id);

        if (existingParticipant) {
          // User is already admitted (e.g., reconnecting)
          socket.join(roomId);

          const otherParticipants = room.participants
            .filter(p => p.socketId !== socket.id)
            .map(p => ({
              socketId: p.socketId,
              displayName: p.displayName,
              isAdmin: p.isAdmin
            }));

          socket.emit('participants', {
            participants: otherParticipants,
            isAdmin: false,
            permissions: existingParticipant.permissions
          });

          console.log(`${displayName} rejoined room ${roomId}`);
        } else {
          // Add to waiting room
          const alreadyWaiting = room.waitingRoom.some(w => w.socketId === socket.id);

          if (!alreadyWaiting) {
            room.waitingRoom.push({
              socketId: socket.id,
              displayName,
              joinedAt: new Date()
            });
            await room.save();
          }

          socket.join(roomId);

          // Send waiting room status to user
          socket.emit('waiting-approval', { roomId });

          // Notify admin about new person in waiting room
          io.to(room.adminSocketId).emit('waiting-room-update', room.waitingRoom.map(w => ({
            socketId: w.socketId,
            displayName: w.displayName,
            joinedAt: w.joinedAt
          })));

          console.log(`${displayName} added to waiting room of ${roomId}`);
        }
      }
    } catch (error) {
      console.error('Error handling join:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle WebRTC signaling - offer/answer
  socket.on('signal', ({ to, from, description }) => {
    console.log(`Signal from ${from} to ${to}`);
    io.to(to).emit('signal', {
      from,
      description
    });
  });

  // Handle ICE candidates
  socket.on('ice-candidate', ({ to, candidate }) => {
    console.log(`ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate
    });
  });

  // Handle chat messages
  socket.on('chat-message', ({ roomId, from, message, timestamp }) => {
    console.log(`Chat message in room ${roomId} from ${from}`);
    // Broadcast to everyone in the room (including sender for confirmation)
    io.to(roomId).emit('chat-message', {
      from,
      message,
      timestamp
    });
  });

  // Admin: Admit participant from waiting room
  socket.on('admit-participant', async ({ roomId, participantId }) => {
    try {
      const room = await findRoom(roomId);
      if (!room || socket.id !== room.adminSocketId) {
        console.log('Unauthorized admit attempt');
        return;
      }

      const waitingUser = room.waitingRoom.find(w => w.socketId === participantId);
      if (!waitingUser) {
        console.log('Participant not in waiting room');
        return;
      }

      // Remove from waiting room
      room.waitingRoom = room.waitingRoom.filter(w => w.socketId !== participantId);

      // Default permissions for new participants
      const defaultPermissions = {
        canUnmute: true,
        canEnableVideo: true,
        canShareScreen: true
      };

      // Add to participants
      room.participants.push({
        socketId: participantId,
        displayName: waitingUser.displayName,
        permissions: defaultPermissions,
        isAdmin: false
      });

      await room.save();

      // Get existing participants for the new user (exclude the new user)
      const existingParticipants = room.participants
        .filter(p => p.socketId !== participantId)
        .map(p => ({
          socketId: p.socketId,
          displayName: p.displayName,
          isAdmin: p.isAdmin
        }));

      // Notify the admitted user
      io.to(participantId).emit('admitted', {
        participants: existingParticipants,
        isAdmin: false,
        permissions: defaultPermissions
      });

      // Notify ALL participants (including admin) about new participant
      io.to(roomId).emit('participant-joined', {
        socketId: participantId,
        displayName: waitingUser.displayName,
        isAdmin: false
      });

      // Update waiting room list for admin
      io.to(room.adminSocketId).emit('waiting-room-update', room.waitingRoom.map(w => ({
        socketId: w.socketId,
        displayName: w.displayName,
        joinedAt: w.joinedAt
      })));

      console.log(`Admin admitted ${waitingUser.displayName} to room ${roomId}`);
    } catch (error) {
      console.error('Error admitting participant:', error);
    }
  });

  // Admin: Deny participant from waiting room
  socket.on('deny-participant', async ({ roomId, participantId }) => {
    try {
      const room = await findRoom(roomId);
      if (!room || socket.id !== room.adminSocketId) {
        console.log('Unauthorized deny attempt');
        return;
      }

      const waitingUser = room.waitingRoom.find(w => w.socketId === participantId);
      if (!waitingUser) {
        console.log('Participant not in waiting room');
        return;
      }

      // Remove from waiting room
      room.waitingRoom = room.waitingRoom.filter(w => w.socketId !== participantId);
      await room.save();

      // Notify the denied user
      io.to(participantId).emit('denied', { roomId });

      // Update waiting room list for admin
      io.to(room.adminSocketId).emit('waiting-room-update', room.waitingRoom.map(w => ({
        socketId: w.socketId,
        displayName: w.displayName,
        joinedAt: w.joinedAt
      })));

      console.log(`Admin denied ${waitingUser.displayName} from room ${roomId}`);
    } catch (error) {
      console.error('Error denying participant:', error);
    }
  });

  // Admin: Update participant permissions
  socket.on('update-permissions', async ({ roomId, participantId, permissions }) => {
    try {
      const room = await findRoom(roomId);
      if (!room || socket.id !== room.adminSocketId) {
        console.log('Unauthorized permission update attempt');
        return;
      }

      const participant = room.participants.find(p => p.socketId === participantId);
      if (!participant) {
        console.log('Participant not found');
        return;
      }

      // Update permissions
      participant.permissions = { ...participant.permissions, ...permissions };
      await room.save();

      // Notify the participant about permission changes
      io.to(participantId).emit('permissions-updated', permissions);

      console.log(`Admin updated permissions for ${participant.displayName}:`, permissions);
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  });

  // Handle leaving a room
  socket.on('leave', ({ roomId }) => {
    handleLeave(socket, roomId);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Get room ID from socket mapping
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      handleLeave(socket, roomId);
      socketToRoom.delete(socket.id);
    }
  });
});

async function handleLeave(socket, roomId) {
  console.log(`${socket.id} leaving room ${roomId}`);

  try {
    const room = await findRoom(roomId);
    if (!room) return;

    // Check if this is the admin
    const isAdmin = socket.id === room.adminSocketId;
    const participantInfo = room.participants.find(p => p.socketId === socket.id);

    // Remove from participants
    if (participantInfo) {
      room.participants = room.participants.filter(p => p.socketId !== socket.id);

      // Notify others in the room BEFORE checking if admin
      socket.to(roomId).emit('participant-left', {
        socketId: socket.id
      });
    }

    // Remove from waiting room if present
    const wasInWaiting = room.waitingRoom.some(w => w.socketId === socket.id);
    if (wasInWaiting) {
      room.waitingRoom = room.waitingRoom.filter(w => w.socketId !== socket.id);

      // Update waiting room list for admin
      io.to(room.adminSocketId).emit('waiting-room-update', room.waitingRoom.map(w => ({
        socketId: w.socketId,
        displayName: w.displayName,
        joinedAt: w.joinedAt
      })));
    }

    // If admin leaves, end the meeting for everyone
    if (isAdmin && participantInfo) {
      console.log(`Admin left room ${roomId}, ending meeting for everyone`);
      // Only emit to OTHER participants, not the admin
      socket.to(roomId).emit('meeting-ended', { reason: 'Admin left the meeting' });
      await deleteRoom(roomId);
      console.log(`Room ${roomId} deleted (admin left)`);
    } else {
      // Save the updated room
      await saveRoom(room);

      // Clean up empty rooms
      if (room.participants.length === 0 && room.waitingRoom.length === 0) {
        await deleteRoom(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        console.log(`Room ${roomId} now has ${room.participants.length} participants and ${room.waitingRoom.length} waiting`);
      }
    }

    socket.leave(roomId);
  } catch (error) {
    console.error('Error handling leave:', error);
  }
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});

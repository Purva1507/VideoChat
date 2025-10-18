import { isDBConnected } from '../config/database.js';
import Room from '../models/Room.js';

// In-memory fallback storage
const memoryRooms = new Map();

// Convert Map data to Room-like object
function mapToRoomObject(roomId, data) {
  return {
    roomId,
    adminSocketId: data.admin,
    participants: Array.from(data.participants.values()),
    waitingRoom: Array.from(data.waitingRoom.values()),
    save: async function() {
      memoryRooms.set(roomId, {
        admin: this.adminSocketId,
        participants: new Map(this.participants.map(p => [p.socketId, p])),
        waitingRoom: new Map(this.waitingRoom.map(w => [w.socketId, w]))
      });
      return this;
    }
  };
}

export async function findRoom(roomId) {
  if (isDBConnected()) {
    return await Room.findOne({ roomId });
  } else {
    // Use in-memory storage
    console.log(`[Storage] Looking for room ${roomId}, available rooms:`, Array.from(memoryRooms.keys()));
    const data = memoryRooms.get(roomId);
    if (!data) {
      console.log(`[Storage] Room ${roomId} not found in memory`);
      return null;
    }
    console.log(`[Storage] Found room ${roomId} with ${data.participants.size} participants`);
    return mapToRoomObject(roomId, data);
  }
}

export async function createRoom(roomData) {
  if (isDBConnected()) {
    const room = new Room(roomData);
    return await room.save();
  } else {
    // Use in-memory storage
    const { roomId, adminSocketId, participants, waitingRoom } = roomData;
    console.log(`[Storage] Creating room ${roomId} with admin ${adminSocketId}`);
    memoryRooms.set(roomId, {
      admin: adminSocketId,
      participants: new Map(participants.map(p => [p.socketId, p])),
      waitingRoom: new Map(waitingRoom.map(w => [w.socketId, w]))
    });
    console.log(`[Storage] Room ${roomId} created, total rooms:`, memoryRooms.size);
    return mapToRoomObject(roomId, memoryRooms.get(roomId));
  }
}

export async function deleteRoom(roomId) {
  if (isDBConnected()) {
    return await Room.deleteOne({ roomId });
  } else {
    memoryRooms.delete(roomId);
    return { deletedCount: 1 };
  }
}

export async function saveRoom(room) {
  return await room.save();
}

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zoom-clone';

let isConnected = false;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 10000,
      dbName: 'zoom-clone'
    });
    console.log('✓ MongoDB connected successfully');
    isConnected = true;

    // Clean up old rooms (older than 24 hours with no activity)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const Room = mongoose.model('Room');
    const result = await Room.deleteMany({
      lastActivity: { $lt: twentyFourHoursAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} old rooms`);
    }
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    console.log('⚠️  Server will continue with in-memory storage (data will be lost on restart)');
    console.log('   To enable persistence, please set up MongoDB. See SETUP.md for instructions.');
    isConnected = false;
  }
};

export const isDBConnected = () => isConnected;

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};

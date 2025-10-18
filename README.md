# 🎥 Video Call Application

A modern, real-time video conferencing web application built with WebRTC and Socket.IO. Experience seamless multi-participant video calls with chat, screen sharing, and intuitive controls.

## 🌐 Live Demo

**[Try it live at purva.artvoo.in](https://purva.artvoo.in)**

## ✨ Features

### Core Functionality
- 🎬 **Multi-Party Video Calls** - Support for 3+ simultaneous participants
- 📞 **Instant Meeting Creation** - Generate unique meeting rooms instantly
- 🔗 **Easy Joining** - Join meetings via room ID or shareable link
- 🎯 **WebRTC Peer-to-Peer** - Direct peer connections for low latency

### Media Controls
- 🎤 **Audio Toggle** - Mute/unmute microphone with visual feedback
- 📹 **Video Toggle** - Turn camera on/off during calls
- 🖥️ **Screen Sharing** - Share your entire screen or specific windows
- 🔊 **Media Quality** - Adaptive video quality based on connection

### Communication
- 💬 **Real-time Chat** - Send instant messages during video calls
- 📨 **Ephemeral Messaging** - Privacy-focused, no message storage
- 👥 **Participant List** - See who's in the call at all times
- 🔔 **Join/Leave Notifications** - Get notified when participants join or leave

### User Experience
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Clean interface built with TailwindCSS
- ⚡ **Fast & Lightweight** - Optimized React with Vite
- 🔒 **Privacy First** - No data persistence, all sessions in-memory

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Next-generation frontend tooling
- **TailwindCSS** - Utility-first CSS framework
- **WebRTC** - Real-time communication APIs
  - `RTCPeerConnection` - Peer-to-peer connections
  - `getUserMedia` - Camera/microphone access
  - `getDisplayMedia` - Screen sharing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **ES Modules** - Modern JavaScript module system

### Infrastructure
- **STUN Server** - Google STUN (`stun:stun.l.google.com:19302`)
- **WebSocket** - Real-time signaling protocol

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or **yarn**
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Zoom-Clone
```

2. **Install server dependencies**

```bash
cd server
npm install
```

3. **Install client dependencies**

```bash
cd ../client
npm install
```

### Running Locally

#### Development Mode

1. **Start the signaling server**

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001` with auto-reload enabled.

2. **Start the client** (in a new terminal)

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173` with hot module replacement.

3. **Access the application**

Open your browser and navigate to `http://localhost:5173`

#### Production Mode

1. **Build the client**

```bash
cd client
npm run build
```

2. **Start the server**

```bash
cd server
npm start
```

## 📖 Usage Guide

### Creating a Meeting

1. Open the application at [purva.artvoo.in](https://purva.artvoo.in) or `http://localhost:5173`
2. Enter your display name
3. Click **"Create New Meeting"**
4. Your unique meeting room will be created
5. Share the meeting URL or Room ID with participants

### Joining a Meeting

1. Receive the meeting link or Room ID from the host
2. Open the link or enter your name and Room ID on the landing page
3. Click **"Join Meeting"**
4. Allow camera and microphone permissions when prompted
5. Start communicating!

### In-Meeting Controls

The control bar at the bottom of the screen provides:

| Control | Icon | Function |
|---------|------|----------|
| **Microphone** | 🎤 | Toggle audio on/off (mute/unmute) |
| **Camera** | 📹 | Toggle video on/off |
| **Screen Share** | 🖥️ | Share your screen with participants |
| **Chat** | 💬 | Open/close the chat panel |
| **Leave** | 📞 | Exit the meeting |

### Chat Features

- Click the chat icon to open the chat panel
- Type your message and press Enter or click Send
- Messages appear in real-time for all participants
- Chat history is cleared when you leave the meeting

## 📁 Project Structure

```
Zoom-Clone/
├── server/                          # Backend signaling server
│   ├── index.js                     # Main server file with Socket.IO setup
│   ├── package.json                 # Server dependencies
│   └── package-lock.json
│
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── VideoPlayer.jsx      # Individual video stream player
│   │   │   ├── VideoGrid.jsx        # Grid layout for multiple videos
│   │   │   ├── Chat.jsx             # Chat interface component
│   │   │   └── Controls.jsx         # Media control buttons
│   │   │
│   │   ├── pages/                   # Page-level components
│   │   │   ├── Landing.jsx          # Landing/home page
│   │   │   └── Room.jsx             # Video call room page
│   │   │
│   │   ├── context/                 # React Context providers
│   │   │   └── SocketContext.jsx    # Socket.IO context and state
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useWebRTC.js         # WebRTC connection management
│   │   │
│   │   ├── App.jsx                  # Root application component
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   │
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # TailwindCSS configuration
│   ├── package.json                 # Client dependencies
│   └── package-lock.json
│
└── README.md                        # This file
```

## 🔌 Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ roomId, displayName }` | Join a specific room with display name |
| `signal` | `{ to, from, signal }` | Send WebRTC SDP offer/answer |
| `ice-candidate` | `{ to, candidate }` | Send ICE candidate for connection |
| `chat-message` | `{ roomId, message, sender }` | Send chat message to room |
| `leave` | `{ roomId }` | Leave the current room |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `participants` | `[{ id, displayName }]` | List of existing participants in room |
| `participant-joined` | `{ id, displayName }` | Notification of new participant |
| `participant-left` | `{ id }` | Notification of participant leaving |
| `signal` | `{ from, signal }` | Receive WebRTC SDP offer/answer |
| `ice-candidate` | `{ from, candidate }` | Receive ICE candidate from peer |
| `chat-message` | `{ message, sender, timestamp }` | Receive chat message |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory (optional):

```env
PORT=3001
NODE_ENV=development
```

### WebRTC Configuration

The application uses Google's public STUN server. For production deployments, consider adding TURN servers in the WebRTC configuration for better NAT traversal:

```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add TURN servers for production
    // { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
  ]
};
```

## 🔒 Privacy & Security

- **No Data Storage** - All sessions are held in memory only
- **Ephemeral Chat** - Messages are not persisted to any database
- **Session Cleanup** - All data is cleared when participants leave
- **Peer-to-Peer** - Video/audio streams go directly between peers
- **No Recording** - The application does not record any calls or chats



## 📝 Notes

- Messages are ephemeral and exist only in browser memory
- Chat history is lost on page refresh or when leaving the room
- For production use, consider implementing:
  - TURN servers for better connectivity
  - End-to-end encryption
  - Recording capabilities (if needed)
  - User authentication
  - Persistent room management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 🔗 Links

- **Live Application**: [purva.artvoo.in](https://purva.artvoo.in)
- **Report Issues**: Create an issue in the repository
- **Documentation**: See this README

---

Built with ❤️ using React, WebRTC, and Socket.IO

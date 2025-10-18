# Video Call Application

A real-time video calling web application built with WebRTC and Socket.IO, supporting multiple participants, real-time text chat, audio/video toggles, and screen sharing.

## Tech Stack

- **Frontend**: React (Vite) + TailwindCSS
- **Backend**: Node.js + Express + Socket.IO (ES Modules)
- **WebRTC**: RTCPeerConnection, getUserMedia, getDisplayMedia
- **STUN Server**: Google STUN (stun:stun.l.google.com:19302)

## Features

- ✅ Create and join video call meetings
- ✅ Support for multiple participants (3+ simultaneously)
- ✅ Real-time ephemeral chat (no storage)
- ✅ Audio/Video toggle (mute/unmute, camera on/off)
- ✅ Screen sharing
- ✅ Responsive UI
- ✅ No database or persistence - all in-memory

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install server dependencies**

```bash
cd server
npm install
```

2. **Install client dependencies**

```bash
cd client
npm install
```

### Running the Application

1. **Start the signaling server** (in the `server` directory)

```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:3001`

2. **Start the client** (in the `client` directory)

```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173`

3. **Open your browser**

Navigate to `http://localhost:5173` to use the application.

## Usage

1. Enter your name on the landing page
2. Click "Create New Meeting" to start a new meeting or enter a meeting ID to join an existing one
3. Share the room link with others to join the call
4. Use the controls at the bottom to:
   - Toggle microphone (mute/unmute)
   - Toggle camera (on/off)
   - Share your screen
   - Open/close chat
   - Leave the call

## Project Structure

```
Zoom-Clone/
├── server/                 # Backend signaling server
│   ├── index.js           # Main server file with Socket.IO
│   └── package.json
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── VideoGrid.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── Controls.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Landing.jsx
│   │   │   └── Room.jsx
│   │   ├── context/       # React context
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/         # Custom hooks
│   │   │   └── useWebRTC.js
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
└── README.md
```

## Socket.IO Events

### Client → Server

- `join`: Join a room with roomId and displayName
- `signal`: Send SDP offer/answer for WebRTC signaling
- `ice-candidate`: Send ICE candidates
- `chat-message`: Send chat message to room
- `leave`: Leave a room

### Server → Client

- `participants`: List of existing participants in room
- `participant-joined`: New participant joined
- `participant-left`: Participant left
- `signal`: Receive SDP offer/answer
- `ice-candidate`: Receive ICE candidate
- `chat-message`: Receive chat message

## Notes

- Chat messages are ephemeral and exist only in memory
- No data is stored on the server
- Messages are lost on page refresh
- STUN server is used for NAT traversal (for production, consider adding TURN servers)

## License

ISC

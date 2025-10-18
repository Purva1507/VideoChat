# Video Call Application

A modern, real-time video conferencing web application built with WebRTC and Socket.IO. A comprehensive video meeting platform with admin controls, meeting scheduling, authentication, and email notifications.

## Live Demo

**[Try it live at purva.artvoo.in](https://purva.artvoo.in)**

## Features

### Authentication & User Management
- User registration and login system
- JWT-based authentication
- Secure password hashing with bcrypt
- User profile management
- Session persistence with auto-login
- Protected routes and middleware

### Admin Controls
- First participant becomes room admin automatically
- **Waiting Room Management**
  - View all participants waiting to join
  - Admit or deny participants
  - Real-time waiting room updates
- **Permission Controls**
  - Control microphone permissions for participants
  - Control camera permissions for participants
  - Control screen sharing permissions for participants
  - Real-time permission updates
- Admin panel with comprehensive controls
- Meeting ends for all when admin leaves

### Meeting Scheduling & Management
- **Schedule Meetings**
  - Create future meetings with date and time
  - Set meeting title and description
  - Choose duration (15, 30, 45, 60, 90, 120 minutes)
  - Add multiple participants with email
  - Generate unique room IDs and meeting links
- **My Meetings Dashboard**
  - View all scheduled meetings
  - Filter upcoming vs all meetings
  - Meeting status tracking (scheduled/ongoing/completed/cancelled)
  - Join meetings within 10 minutes of start time
  - Copy meeting links
  - Cancel meetings (host only)

### Email Notification System
- **Meeting Invitations**
  - Professional HTML email templates
  - Sent to host and all participants
  - Meeting details and join link included
- **Meeting Reminders**
  - Automated reminders sent 15-20 minutes before meeting
  - Urgent styling for upcoming meetings
  - Cron job scheduling for reliability
- **Status Updates**
  - Automatic completion of past meetings
  - Meeting status synchronization

### Video Calling Features
- **Multi-Party Video Calls** - Support for 3+ simultaneous participants
- **Instant Meeting Creation** - Generate unique meeting rooms instantly
- **Easy Joining** - Join meetings via room ID or shareable link
- **WebRTC Peer-to-Peer** - Direct peer connections for low latency
- **Responsive Video Grid** - Automatic layout adjustment based on participant count

### Media Controls
- **Audio Toggle** - Mute/unmute microphone with permission checks
- **Video Toggle** - Turn camera on/off with permission checks
- **Screen Sharing** - Share entire screen or specific windows with permission checks
- **Screen Recording** - Record screen and audio during meetings
- **Permission-Based Controls** - Respect admin-set permissions
- **Visual Feedback** - Real-time indicators for all media states

### Communication
- **Real-time Chat** - Send instant messages during video calls
- **Chat Notifications** - Toast notifications and sound alerts for new messages
- **Participant List** - See all active participants with admin badges
- **Join/Leave Notifications** - Audio and visual notifications
- **Meeting Info Panel** - Display room ID and share meeting link

### Database Integration
- MongoDB database with Mongoose ODM
- **User Model** - Store user accounts and credentials
- **Meeting Model** - Persist scheduled meetings and participants
- **Room Model** - Track active rooms, permissions, and waiting rooms
- Automatic cleanup of old rooms (24+ hours inactive)
- Graceful fallback to in-memory storage

### User Experience
- Responsive design for desktop and mobile
- Modern UI built with TailwindCSS
- Fast and lightweight with React + Vite
- Loading states and spinners
- Toast notifications for user feedback
- Sound effects for events
- Empty states with helpful messages

### Security & Privacy
- JWT authentication with 7-day expiry
- Password hashing with bcrypt
- Protected API routes with middleware
- No persistent chat history
- Ephemeral messaging
- Secure WebRTC connections

## Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Next-generation frontend tooling
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **WebRTC** - Real-time communication APIs
  - RTCPeerConnection - Peer-to-peer connections
  - getUserMedia - Camera/microphone access
  - getDisplayMedia - Screen sharing
  - MediaRecorder - Screen recording

### Backend
- **Node.js** - JavaScript runtime (ES Modules)
- **Express** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **node-cron** - Job scheduling

### Infrastructure
- **STUN Server** - Google STUN (stun:stun.l.google.com:19302)
- **WebSocket** - Real-time signaling protocol
- **Gmail SMTP** - Email delivery service

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- **Gmail account** (for email notifications)

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

4. **Configure environment variables**

Create a `.env` file in the `server` directory:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/video-call-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-call-app

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com

NODE_ENV=development
```

**Note:** For Gmail, you need to generate an App Password:
1. Enable 2-factor authentication on your Google account
2. Go to Google Account Settings > Security > App Passwords
3. Generate a new app password for "Mail"
4. Use this password in EMAIL_PASS

### Running Locally

#### Development Mode

1. **Start MongoDB** (if running locally)

```bash
mongod
```

2. **Start the signaling server**

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001` with auto-reload enabled.

3. **Start the client** (in a new terminal)

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173` with hot module replacement.

4. **Access the application**

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

## Usage Guide

### Getting Started

1. **Sign Up/Login**
   - Open the application at [purva.artvoo.in](https://purva.artvoo.in)
   - Click "Sign In" in the top right
   - Register a new account or login with existing credentials

2. **Create Instant Meeting**
   - From the landing page, click "Create New Meeting"
   - Your unique meeting room will be created
   - You become the admin automatically
   - Share the meeting URL or Room ID with participants

3. **Schedule a Meeting**
   - Click "Schedule Meeting" from the landing page
   - Fill in meeting details (title, description, date, time, duration)
   - Add participant names and emails
   - Click "Schedule Meeting"
   - Email invitations sent automatically to all participants

4. **Join a Meeting**
   - Enter the Room ID on the landing page or use the meeting link
   - Click "Join Meeting"
   - If admin has enabled waiting room, wait for approval
   - Allow camera and microphone permissions when prompted

### Admin Controls

As the meeting admin (first person to join), you have access to:

1. **Waiting Room Management**
   - Click the "Waiting Room" button to see pending participants
   - Admit participants to allow them to join
   - Deny participants to reject their access

2. **Permission Controls**
   - Open the "Admin Panel" during the meeting
   - Toggle permissions for each participant:
     - Microphone permission (allow/deny unmute)
     - Camera permission (allow/deny video)
     - Screen share permission (allow/deny screen sharing)
   - Changes take effect immediately

### In-Meeting Controls

The control bar at the bottom provides:

| Control | Function | Notes |
|---------|----------|-------|
| **Microphone** | Toggle audio on/off (mute/unmute) | Requires admin permission |
| **Camera** | Toggle video on/off | Requires admin permission |
| **Screen Share** | Share your screen with participants | Requires admin permission |
| **Record** | Record the screen during meeting | Auto-downloads as WebM file |
| **Chat** | Open/close the chat panel | Real-time messaging |
| **Participants** | View all participants | Shows admin badge |
| **Meeting Info** | View and copy room ID | Share meeting link |
| **Admin Panel** | Access admin controls | Admin only |
| **Leave** | Exit the meeting | Admin leaving ends meeting |

### Managing Meetings

1. **View Your Meetings**
   - Click "My Meetings" in the navigation
   - View all upcoming meetings
   - Toggle between "Upcoming" and "All Meetings"

2. **Join a Scheduled Meeting**
   - Meetings can be joined 10 minutes before start time
   - Click "Join" button when available
   - Click "Copy Link" to share with others

3. **Cancel a Meeting**
   - Only the host can cancel meetings
   - Click "Cancel Meeting" button
   - Confirm cancellation

### Chat Features

- Click the chat icon to open the chat panel
- Type your message and press Enter or click Send
- Messages appear in real-time for all participants
- Sound notifications for new messages when chat is closed
- Toast notifications when chat panel is closed
- Chat history is cleared when you leave the meeting

## Project Structure

```
Zoom-Clone/
├── server/                          # Backend signaling server
│   ├── config/
│   │   └── database.js              # MongoDB connection configuration
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                  # User schema (auth)
│   │   ├── Meeting.js               # Meeting schema (scheduling)
│   │   └── Room.js                  # Room schema (active sessions)
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes
│   │   └── meetings.js              # Meeting management routes
│   ├── services/
│   │   ├── emailService.js          # Email sending (Nodemailer)
│   │   └── reminderService.js       # Cron jobs for reminders
│   ├── index.js                     # Main server file with Socket.IO
│   ├── package.json                 # Server dependencies
│   └── .env                         # Environment variables
│
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   │   └── sounds/                  # Notification sounds
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── VideoPlayer.jsx      # Individual video stream player
│   │   │   ├── VideoGrid.jsx        # Grid layout for multiple videos
│   │   │   ├── Chat.jsx             # Chat interface component
│   │   │   ├── Controls.jsx         # Media control buttons
│   │   │   ├── AdminPanel.jsx       # Admin permission controls
│   │   │   ├── WaitingRoom.jsx      # Waiting room UI
│   │   │   ├── ParticipantsList.jsx # List of active participants
│   │   │   ├── MeetingInfoPanel.jsx # Room ID and share link
│   │   │   ├── ScheduleMeeting.jsx  # Meeting scheduling form
│   │   │   ├── Toast.jsx            # Toast notifications
│   │   │   └── LoadingSpinner.jsx   # Loading indicator
│   │   │
│   │   ├── pages/                   # Page-level components
│   │   │   ├── Landing.jsx          # Landing/home page
│   │   │   ├── Room.jsx             # Video call room page
│   │   │   ├── Auth.jsx             # Login/Register page
│   │   │   └── MyMeetings.jsx       # User's scheduled meetings
│   │   │
│   │   ├── context/                 # React Context providers
│   │   │   ├── SocketContext.jsx    # Socket.IO context and state
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useWebRTC.js         # WebRTC connection management
│   │   │   ├── useRecording.js      # Screen recording logic
│   │   │   └── useNotificationSound.js # Sound notifications
│   │   │
│   │   ├── App.jsx                  # Root application component
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   │
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # TailwindCSS configuration
│   ├── vercel.json                  # Vercel deployment config
│   └── package.json                 # Client dependencies
│
└── README.md                        # This file
```

## API Documentation

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Meeting Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/meetings/schedule` | Create scheduled meeting | Yes |
| GET | `/api/meetings/user/:email` | Get upcoming meetings | No |
| GET | `/api/meetings/user/:email/all` | Get all meetings | No |
| GET | `/api/meetings/:id` | Get specific meeting | No |
| PATCH | `/api/meetings/:id/status` | Update meeting status | Yes |
| DELETE | `/api/meetings/:id` | Cancel meeting | Yes |

## Socket.IO Events

### Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ roomId, displayName, userId }` | Join a specific room |
| `signal` | `{ to, from, signal }` | Send WebRTC SDP offer/answer |
| `ice-candidate` | `{ to, candidate }` | Send ICE candidate for connection |
| `chat-message` | `{ roomId, message, sender }` | Send chat message to room |
| `leave` | `{ roomId }` | Leave the current room |
| `admit-participant` | `{ roomId, socketId }` | Admin admits waiting participant |
| `deny-participant` | `{ roomId, socketId }` | Admin denies waiting participant |
| `update-permissions` | `{ roomId, socketId, permissions }` | Admin updates participant permissions |

### Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| `participants` | `[{ id, displayName, isAdmin, permissions }]` | List of participants in room |
| `participant-joined` | `{ id, displayName, isAdmin }` | New participant joined |
| `participant-left` | `{ id }` | Participant left the room |
| `signal` | `{ from, signal }` | Receive WebRTC SDP offer/answer |
| `ice-candidate` | `{ from, candidate }` | Receive ICE candidate from peer |
| `chat-message` | `{ message, sender, timestamp }` | Receive chat message |
| `waiting-room-update` | `{ waitingRoom }` | Updated waiting room list |
| `admitted` | `{ roomId }` | Participant admitted to room |
| `denied` | - | Participant denied access |
| `permissions-updated` | `{ permissions }` | Your permissions changed |
| `admin-left` | - | Admin left, meeting ending |

## Configuration

### Environment Variables

Server `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/video-call-app

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
```

### WebRTC Configuration

The application uses Google's public STUN server. For production deployments with users behind strict NATs/firewalls, consider adding TURN servers:

```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com',
      username: 'user',
      credential: 'pass'
    }
  ]
};
```

## Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  createdAt: Date
}
```

### Meeting Collection
```javascript
{
  title: String,
  description: String,
  scheduledDate: Date (indexed),
  duration: Number,
  roomId: String (unique),
  meetingLink: String,
  hostEmail: String (indexed),
  hostName: String,
  participants: [{
    email: String (indexed),
    name: String,
    status: String (pending/accepted/declined)
  }],
  status: String (scheduled/ongoing/completed/cancelled),
  reminderSent: Boolean,
  createdAt: Date
}
```

### Room Collection
```javascript
{
  roomId: String (unique, indexed),
  adminSocketId: String,
  participants: [{
    socketId: String,
    displayName: String,
    isAdmin: Boolean,
    permissions: {
      canUnmute: Boolean,
      canEnableVideo: Boolean,
      canShareScreen: Boolean
    }
  }],
  waitingRoom: [{
    socketId: String,
    displayName: String,
    joinedAt: Date
  }],
  createdAt: Date,
  lastActivity: Date
}
```

## Email Templates

### Meeting Invitation Email
- Professional HTML design
- Meeting details (title, description, date, time, duration)
- Host information
- Direct "Join Meeting" button
- Meeting link for sharing

### Meeting Reminder Email
- Sent 15-20 minutes before meeting
- Urgent styling with "Starting in 15 minutes" badge
- Same meeting details as invitation
- Quick access join button

## Cron Jobs

### Reminder Service
- **Check reminders**: Every 20 minutes
  - Find meetings starting in 15-20 minutes
  - Send reminder emails to host and participants
  - Mark reminderSent = true

- **Update meeting status**: Every hour
  - Find meetings where current time > scheduledDate + duration
  - Update status from "scheduled" to "completed"

## Privacy & Security

- **No Data Storage** - Video/audio streams are not recorded by default
- **Ephemeral Chat** - Messages are not persisted to database
- **Session Cleanup** - Room data cleared when empty
- **Peer-to-Peer** - Media streams go directly between peers
- **Password Security** - Bcrypt hashing with salt rounds
- **JWT Tokens** - Secure authentication with expiry
- **Protected Routes** - Middleware verification for sensitive endpoints
- **CORS Configuration** - Controlled cross-origin access

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari (macOS/iOS)
- Edge

**Note:** WebRTC requires HTTPS in production. Ensure your deployment uses SSL/TLS certificates.

## Deployment

### Client Deployment (Vercel)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: None required
- Custom domain supported

### Server Deployment
- Ensure MongoDB Atlas connection string is set
- Set all environment variables
- Configure CORS for your client domain
- Use process manager (PM2) for production
- Enable HTTPS with SSL certificates

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB Atlas
- [ ] Set strong JWT_SECRET
- [ ] Configure Gmail App Password
- [ ] Set up CORS with client domain
- [ ] Enable HTTPS/SSL
- [ ] Consider TURN servers for better connectivity
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backup strategy

## Notes

- Messages are ephemeral and exist only in browser memory during the call
- Chat history is lost on page refresh or when leaving the room
- Scheduled meetings are persisted in MongoDB
- Meeting reminders require server to be running continuously
- Recording saves locally to the user's device
- Admin leaving ends the meeting for all participants

## Known Limitations

- No TURN server (may have connectivity issues behind strict firewalls)
- No end-to-end encryption for media streams
- No persistent chat history
- No meeting recordings on server
- No participant kick/ban functionality
- No breakout rooms
- No virtual backgrounds
- No noise suppression

## Future Enhancements

- Add TURN servers for better NAT traversal
- Implement end-to-end encryption
- Add persistent chat history
- Server-side meeting recordings
- Participant kick/ban by admin
- Breakout rooms functionality
- Virtual backgrounds
- Noise suppression and audio enhancement
- Mobile apps (React Native)
- Desktop apps (Electron)
- Meeting analytics and insights
- Integration with calendar apps
- Webhooks for meeting events

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Links

- **Live Application**: [purva.artvoo.in](https://purva.artvoo.in)
- **Report Issues**: Create an issue in the repository
- **Documentation**: See this README

---

Built with React, WebRTC, Socket.IO, MongoDB, and Node.js

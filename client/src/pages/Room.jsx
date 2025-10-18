import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { useRecording } from '../hooks/useRecording';
import { useSocket } from '../context/SocketContext';
import { useNotificationSound } from '../hooks/useNotificationSound';
import VideoGrid from '../components/VideoGrid';
import Chat from '../components/Chat';
import Controls from '../components/Controls';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import MeetingInfoPanel from '../components/MeetingInfoPanel';
import WaitingRoom from '../components/WaitingRoom';
import AdminPanel from '../components/AdminPanel';
import ParticipantsList from '../components/ParticipantsList';

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const displayName = searchParams.get('name') || 'Anonymous';

  const { socket } = useSocket();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  const {
    localStream,
    remoteStreams,
    participants,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    isScreenSharing,
    isAdmin,
    permissions,
    waitingForApproval,
    isAdmitted
  } = useWebRTC(roomId, displayName);

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording
  } = useRecording();

  const { playSound } = useNotificationSound();

  useEffect(() => {
    if (localStream && (isAdmitted || waitingForApproval)) {
      setTimeout(() => setIsReady(true), 500);
    }
  }, [localStream, isAdmitted, waitingForApproval]);

  // Handle denied and meeting-ended events
  useEffect(() => {
    if (!socket) return;

    const handleDenied = () => {
      setIsDenied(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    };

    const handleMeetingEnded = ({ reason }) => {
      alert(reason || 'The meeting has ended');
      navigate('/');
    };

    socket.on('denied', handleDenied);
    socket.on('meeting-ended', handleMeetingEnded);

    return () => {
      socket.off('denied', handleDenied);
      socket.off('meeting-ended', handleMeetingEnded);
    };
  }, [socket, navigate]);

  // Listen for chat messages and show toast when chat is closed
  const handleChatMessage = useCallback(({ from, message, timestamp }) => {
    console.log('Room received chat message:', { from, message, timestamp, isChatOpen, displayName });

    // Only show toast and play sound if message is not from current user
    if (from !== displayName) {
      playSound('message');

      // Show toast only if chat is closed
      if (!isChatOpen) {
        console.log('Showing toast notification');
        setToastMessage({ sender: from, message, timestamp });
      }
    }
  }, [isChatOpen, displayName, playSound]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('chat-message', handleChatMessage);
    };
  }, [socket, handleChatMessage]);

  // Listen for participant join/leave events and play sounds
  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = ({ socketId, displayName: name }) => {
      console.log('Participant joined:', name);
      playSound('join');
    };

    const handleParticipantLeft = ({ socketId }) => {
      console.log('Participant left:', socketId);
      playSound('leave');
    };

    socket.on('participant-joined', handleParticipantJoined);
    socket.on('participant-left', handleParticipantLeft);

    return () => {
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('participant-left', handleParticipantLeft);
    };
  }, [socket, playSound]);

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave the meeting?')) {
      if (isRecording) {
        stopRecording();
      }
      navigate('/');
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Show denied message
  if (isDenied) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-red-600 text-4xl font-bold">✕</div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">The meeting host has denied your request to join.</p>
        </div>
      </div>
    );
  }

  // Show waiting room
  if (waitingForApproval && !isAdmitted) {
    return <WaitingRoom roomId={roomId} />;
  }

  // Show loading while setting up
  if (!isReady) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <LoadingSpinner size="lg" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Setting up your meeting...</h2>
          <p className="text-gray-600">Please wait while we connect you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1F1F1F]">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          sender={toastMessage.sender}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <AdminPanel
          roomId={roomId}
          participants={participants}
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}

      {/* Participants List */}
      <ParticipantsList
        participants={participants}
        isOpen={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        currentUserSocketId={socket?.id}
        isAdmin={isAdmin}
      />

      {/* Meeting Info Panel */}

      {/* Main content */}
      <div className="flex h-[90%] overflow-hidden">
        {/* Video Grid - takes remaining space */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isChatOpen ? 'mr-0' : 'mr-0'
        }`}>
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={participants}
            displayName={displayName}
          />
        </div>

        {/* Chat Panel with responsive width - slides in from right */}
        <div
          className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
            isChatOpen ? 'w-full sm:w-96 md:w-80 lg:w-96' : 'w-0'
          } overflow-hidden rounded-2xl my-4 mr-4`}
        >
          <Chat
            roomId={roomId}
            displayName={displayName}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="h-[10%] flex items-center justify-center relative">
        {/* Meeting Info Panel - positioned absolutely to not interfere with controls */}
        <div className="absolute left-4 z-10">
          <MeetingInfoPanel roomId={roomId} />
        </div>

        {/* Main Controls - centered */}
        <Controls
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          onLeave={handleLeave}
          isScreenSharing={isScreenSharing}
          isChatOpen={isChatOpen}
          onToggleRecording={handleToggleRecording}
          isRecording={isRecording}
          recordingTime={recordingTime}
          isAdmin={isAdmin}
          permissions={permissions}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          onOpenParticipants={() => setIsParticipantsOpen(true)}
        />
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="fixed top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 animate-slideDown z-50">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">{recordingTime}</span>
        </div>
      )}
    </div>
  );
}

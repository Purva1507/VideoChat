import { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageCircle, PhoneOff, Circle, Square, Shield, Users } from 'lucide-react';

export default function Controls({
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onLeave,
  isScreenSharing,
  isChatOpen,
  onToggleRecording,
  isRecording,
  recordingTime,
  isAdmin = false,
  permissions = { canUnmute: true, canEnableVideo: true, canShareScreen: true },
  onOpenAdminPanel,
  onOpenParticipants
}) {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Force update UI when permissions are revoked
  useEffect(() => {
    if (!permissions.canUnmute && isAudioOn) {
      setIsAudioOn(false);
    }
    if (!permissions.canEnableVideo && isVideoOn) {
      setIsVideoOn(false);
    }
  }, [permissions.canUnmute, permissions.canEnableVideo, isAudioOn, isVideoOn]);

  const handleToggleAudio = () => {
    if (!permissions.canUnmute && !isAudioOn) {
      alert('You do not have permission to unmute. Please ask the host for permission.');
      return;
    }
    const newState = onToggleAudio();
    setIsAudioOn(newState);
  };

  const handleToggleVideo = () => {
    if (!permissions.canEnableVideo && !isVideoOn) {
      alert('You do not have permission to enable video. Please ask the host for permission.');
      return;
    }
    const newState = onToggleVideo();
    setIsVideoOn(newState);
  };

  const handleToggleScreenShare = () => {
    if (!permissions.canShareScreen && !isScreenSharing) {
      alert('You do not have permission to share your screen. Please ask the host for permission.');
      return;
    }
    onToggleScreenShare();
  };

  const ControlButton = ({ onClick, active, isActive, icon, label, danger = false, recording = false, disabled = false }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        type="button"
        className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer ${
          disabled
            ? 'bg-gray-800 opacity-50 cursor-not-allowed'
            : danger
            ? 'bg-red-600 hover:bg-red-700'
            : recording
            ? 'bg-red-600 hover:bg-red-700'
            : isActive
            ? 'bg-green-600 hover:bg-green-700'
            : active
            ? 'bg-gray-800 hover:bg-gray-900'
            : 'bg-gray-600 hover:bg-gray-700'
        }`}
        aria-label={label}
      >
        {icon}
      </button>
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {label}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-row items-center py-1 relative z-20">
      <div className="flex-1 flex justify-center items-center gap-6">
        <ControlButton
          onClick={handleToggleAudio}
          active={isAudioOn}
          label={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
          icon={
            isAudioOn ? (
              <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <MicOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )
          }
        />

        <ControlButton
          onClick={handleToggleVideo}
          active={isVideoOn}
          label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          icon={
            isVideoOn ? (
              <Video className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <VideoOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )
          }
        />

        <div className="w-px h-8 bg-white/20"></div>

        <ControlButton
          onClick={handleToggleScreenShare}
          isActive={isScreenSharing}
          label={isScreenSharing ? 'Stop presenting' : 'Present screen'}
          icon={<ScreenShare className="w-5 h-5 md:w-6 md:h-6 text-white" />}
        />

        <ControlButton
          onClick={onToggleRecording}
          recording={isRecording}
          label={isRecording ? `Recording (${recordingTime})` : 'Start recording'}
          icon={
            isRecording ? (
              <Square className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Circle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )
          }
        />

        <ControlButton
          onClick={onToggleChat}
          isActive={isChatOpen}
          label="Toggle chat"
          icon={<MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />}
        />

        <ControlButton
          onClick={onOpenParticipants}
          isActive={false}
          label="View participants"
          icon={<Users className="w-5 h-5 md:w-6 md:h-6 text-white" />}
        />

        {isAdmin && (
          <ControlButton
            onClick={onOpenAdminPanel}
            isActive={false}
            label="Admin Controls"
            icon={<Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />}
          />
        )}

        <div className="w-px h-8 bg-white/20"></div>

        <ControlButton
          onClick={onLeave}
          danger={true}
          label="Leave meeting"
          icon={<PhoneOff className="w-5 h-5 md:w-6 md:h-6 text-white" />}
        />
      </div>
    </div>
  );
}

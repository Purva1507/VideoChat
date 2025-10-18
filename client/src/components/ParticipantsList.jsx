import { Users, Mic, MicOff, Video, VideoOff, Crown, X } from 'lucide-react';

export default function ParticipantsList({ participants, isOpen, onClose, currentUserSocketId, isAdmin }) {
  if (!isOpen) return null;

  const participantsList = Object.entries(participants);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Participants ({participantsList.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-6">
          {participantsList.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No participants yet
            </p>
          ) : (
            <div className="space-y-3">
              {participantsList.map(([socketId, name]) => {
                const isCurrentUser = socketId === currentUserSocketId;

                return (
                  <div
                    key={socketId}
                    className={`bg-white border rounded-lg p-4 flex items-center justify-between transition-all ${
                      isCurrentUser ? 'border-black ring-2 ring-black ring-opacity-10' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        isCurrentUser ? 'bg-black' : 'bg-gray-400'
                      }`}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 font-medium">
                            {name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-600">(You)</span>
                            )}
                          </p>
                          {isAdmin && socketId === currentUserSocketId && (
                            <Crown className="w-4 h-4 text-yellow-500" title="Host" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Audio/Video indicators - placeholder for future enhancement */}
                    <div className="flex items-center gap-2">
                      {/* These would be dynamic based on actual audio/video state */}
                      {/* <Mic className="w-4 h-4 text-green-600" /> */}
                      {/* <Video className="w-4 h-4 text-green-600" /> */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {isAdmin
              ? 'You are the meeting host. Use Admin Controls for permissions.'
              : 'Participants in this meeting'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

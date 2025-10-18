import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Shield, Users, UserCheck, UserX, Mic, Video, Monitor, X } from 'lucide-react';

export default function AdminPanel({ roomId, participants, isOpen, onClose }) {
  const { socket } = useSocket();
  const [waitingParticipants, setWaitingParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('waiting'); // 'waiting' or 'participants'

  // Track permissions for each participant
  const [participantPermissions, setParticipantPermissions] = useState({});

  useEffect(() => {
    if (!socket) return;

    const handleWaitingRoomUpdate = (waitingList) => {
      console.log('Waiting room update:', waitingList);
      setWaitingParticipants(waitingList);
    };

    socket.on('waiting-room-update', handleWaitingRoomUpdate);

    return () => {
      socket.off('waiting-room-update', handleWaitingRoomUpdate);
    };
  }, [socket]);

  // Initialize permissions for new participants
  useEffect(() => {
    const newPermissions = { ...participantPermissions };
    let hasChanges = false;

    Object.keys(participants).forEach(socketId => {
      if (!newPermissions[socketId]) {
        newPermissions[socketId] = {
          canUnmute: true,
          canEnableVideo: true,
          canShareScreen: true
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setParticipantPermissions(newPermissions);
    }
  }, [participants, participantPermissions]);

  const admitParticipant = (participantId) => {
    if (socket) {
      socket.emit('admit-participant', { roomId, participantId });
    }
  };

  const denyParticipant = (participantId) => {
    if (socket) {
      socket.emit('deny-participant', { roomId, participantId });
    }
  };

  const updatePermission = (participantId, permission, value) => {
    // Update local state immediately for responsive UI
    setParticipantPermissions(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [permission]: value
      }
    }));

    // Send to server
    if (socket) {
      socket.emit('update-permissions', {
        roomId,
        participantId,
        permissions: { [permission]: value }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Admin Controls</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('waiting')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'waiting'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Waiting Room ({waitingParticipants.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'participants'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4" />
              Participants ({Object.keys(participants).length})
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'waiting' ? (
            <div className="space-y-3">
              {waitingParticipants.length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  No one is waiting to join
                </p>
              ) : (
                waitingParticipants.map((participant) => (
                  <div
                    key={participant.socketId}
                    className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                        {participant.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{participant.displayName}</p>
                        <p className="text-gray-600 text-sm">
                          Waiting since {new Date(participant.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => admitParticipant(participant.socketId)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                      >
                        <UserCheck className="w-4 h-4" />
                        Admit
                      </button>
                      <button
                        onClick={() => denyParticipant(participant.socketId)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                      >
                        <UserX className="w-4 h-4" />
                        Deny
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.keys(participants).length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  No participants yet
                </p>
              ) : (
                Object.entries(participants).map(([socketId, name]) => (
                  <div
                    key={socketId}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-gray-900 font-medium">{name}</p>
                      </div>
                    </div>

                    {/* Permission Controls */}
                    <div className="ml-13 space-y-2">
                      <label className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-700">
                          <Mic className="w-4 h-4" />
                          Allow Unmute
                        </span>
                        <input
                          type="checkbox"
                          checked={participantPermissions[socketId]?.canUnmute ?? true}
                          onChange={(e) => updatePermission(socketId, 'canUnmute', e.target.checked)}
                          className="w-5 h-5 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-700">
                          <Video className="w-4 h-4" />
                          Allow Video
                        </span>
                        <input
                          type="checkbox"
                          checked={participantPermissions[socketId]?.canEnableVideo ?? true}
                          onChange={(e) => updatePermission(socketId, 'canEnableVideo', e.target.checked)}
                          className="w-5 h-5 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-700">
                          <Monitor className="w-4 h-4" />
                          Allow Screen Share
                        </span>
                        <input
                          type="checkbox"
                          checked={participantPermissions[socketId]?.canShareScreen ?? true}
                          onChange={(e) => updatePermission(socketId, 'canShareScreen', e.target.checked)}
                          className="w-5 h-5 rounded"
                        />
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            As the meeting host, you have full control over participant permissions
          </p>
        </div>
      </div>
    </div>
  );
}

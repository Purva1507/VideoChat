import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

const ICE_SERVERS = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ]
};

export function useWebRTC(roomId, displayName) {
  const { socket } = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState({});
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState({
    canUnmute: true,
    canEnableVideo: true,
    canShareScreen: true
  });
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [isAdmitted, setIsAdmitted] = useState(false);

  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef({});
  const hasJoinedRef = useRef(false);

  // Initialize local media stream
  useEffect(() => {
    async function initLocalStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    }

    initLocalStream();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    };
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((participantId) => {
    console.log('Creating peer connection for', participantId);
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks();
      console.log('Adding', tracks.length, 'local tracks to peer connection for', participantId);
      tracks.forEach(track => {
        pc.addTrack(track, localStreamRef.current);
        console.log('Added track:', track.kind, track.label);
      });
    } else {
      console.warn('No local stream available when creating peer connection for', participantId);
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received remote track from', participantId, '- kind:', event.track.kind);
      setRemoteStreams(prev => ({
        ...prev,
        [participantId]: event.streams[0]
      }));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          to: participantId,
          candidate: event.candidate
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${participantId}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        // Clean up disconnected peer
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[participantId];
          return newStreams;
        });
      }
    };

    peerConnectionsRef.current[participantId] = pc;
    return pc;
  }, [socket]);

  // Setup socket event listeners (only depends on socket)
  useEffect(() => {
    if (!socket) return;

    // Handle existing participants (for admin joining first)
    socket.on('participants', async (data) => {
      console.log('Received participants data:', data);

      // New structure includes isAdmin, permissions, participants array
      setIsAdmin(data.isAdmin || false);
      setPermissions(data.permissions || {
        canUnmute: true,
        canEnableVideo: true,
        canShareScreen: true
      });
      setIsAdmitted(true);
      setWaitingForApproval(false);

      const existingParticipants = data.participants || [];

      // Store participant info (including self)
      const participantsMap = {};
      existingParticipants.forEach(p => {
        participantsMap[p.socketId] = p.displayName;
      });

      // Always add self to participants list
      if (socket) {
        participantsMap[socket.id] = displayName;
      }

      setParticipants(participantsMap);

      // Create offers for each existing participant
      for (const participant of existingParticipants) {
        console.log('Creating offer for existing participant:', participant.displayName, participant.socketId);
        const pc = createPeerConnection(participant.socketId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log('Sending offer to', participant.socketId);
          socket.emit('signal', {
            to: participant.socketId,
            from: socket.id,
            description: offer
          });
        } catch (error) {
          console.error('Error creating offer for', participant.socketId, ':', error);
        }
      }
    });

    // Handle new participant joining
    socket.on('participant-joined', ({ socketId, displayName: name }) => {
      console.log('New participant joined:', name, socketId);
      setParticipants(prev => ({ ...prev, [socketId]: name }));
    });

    // Handle participant leaving
    socket.on('participant-left', ({ socketId }) => {
      console.log('Participant left:', socketId);

      // Close peer connection
      if (peerConnectionsRef.current[socketId]) {
        peerConnectionsRef.current[socketId].close();
        delete peerConnectionsRef.current[socketId];
      }

      // Remove remote stream
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[socketId];
        return newStreams;
      });

      // Remove from participants
      setParticipants(prev => {
        const newParticipants = { ...prev };
        delete newParticipants[socketId];
        return newParticipants;
      });
    });

    // Handle signaling (offer/answer)
    socket.on('signal', async ({ from, description }) => {
      console.log('Received signal from', from, description.type);

      let pc = peerConnectionsRef.current[from];
      if (!pc) {
        console.log('Creating new peer connection for', from);
        pc = createPeerConnection(from);
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(description));
        console.log('Set remote description for', from);

        // Process any pending ICE candidates
        if (pendingCandidatesRef.current[from]) {
          console.log('Processing', pendingCandidatesRef.current[from].length, 'pending ICE candidates for', from);
          for (const candidate of pendingCandidatesRef.current[from]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          delete pendingCandidatesRef.current[from];
        }

        if (description.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log('Sending answer to', from);
          socket.emit('signal', {
            to: from,
            from: socket.id,
            description: answer
          });
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    });

    // Handle ICE candidates
    socket.on('ice-candidate', async ({ from, candidate }) => {
      console.log('Received ICE candidate from', from);
      const pc = peerConnectionsRef.current[from];
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added ICE candidate from', from);
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      } else {
        // Queue the candidate if remote description is not set yet
        console.log('Queueing ICE candidate from', from, '(remote description not set yet)');
        if (!pendingCandidatesRef.current[from]) {
          pendingCandidatesRef.current[from] = [];
        }
        pendingCandidatesRef.current[from].push(candidate);
      }
    });

    // Handle waiting for approval
    socket.on('waiting-approval', ({ roomId }) => {
      console.log('Waiting for approval in room', roomId);
      setWaitingForApproval(true);
      setIsAdmitted(false);
    });

    // Handle being admitted from waiting room
    socket.on('admitted', async (data) => {
      console.log('Admitted to room!', data);
      setIsAdmin(false);
      setPermissions(data.permissions);
      setWaitingForApproval(false);
      setIsAdmitted(true);

      const existingParticipants = data.participants || [];

      // Store participant info (including self)
      const participantsMap = {};
      existingParticipants.forEach(p => {
        participantsMap[p.socketId] = p.displayName;
      });

      // Always add self to participants list
      if (socket) {
        participantsMap[socket.id] = displayName;
      }

      setParticipants(participantsMap);

      // Create offers for each existing participant
      for (const participant of existingParticipants) {
        console.log('Creating offer for existing participant:', participant.displayName, participant.socketId);
        const pc = createPeerConnection(participant.socketId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log('Sending offer to', participant.socketId);
          socket.emit('signal', {
            to: participant.socketId,
            from: socket.id,
            description: offer
          });
        } catch (error) {
          console.error('Error creating offer for', participant.socketId, ':', error);
        }
      }
    });

    // Handle being denied from waiting room
    socket.on('denied', ({ roomId }) => {
      console.log('Denied from room', roomId);
      setWaitingForApproval(false);
      setIsAdmitted(false);
    });

    // Handle permission updates
    socket.on('permissions-updated', (updatedPermissions) => {
      console.log('Permissions updated:', updatedPermissions);

      // Force disable features if permissions are revoked
      if (localStreamRef.current) {
        // Force mute if unmute permission revoked
        if (updatedPermissions.canUnmute === false) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          if (audioTrack && audioTrack.enabled) {
            audioTrack.enabled = false;
            console.log('Forced mute due to permission revocation');
          }
        }

        // Force disable video if video permission revoked
        if (updatedPermissions.canEnableVideo === false) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack && videoTrack.enabled) {
            videoTrack.enabled = false;
            console.log('Forced video off due to permission revocation');
          }
        }
      }

      setPermissions(prev => ({ ...prev, ...updatedPermissions }));
    });

    return () => {
      console.log('Cleaning up socket event listeners');
      socket.off('participants');
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('signal');
      socket.off('ice-candidate');
      socket.off('waiting-approval');
      socket.off('admitted');
      socket.off('denied');
      socket.off('permissions-updated');
    };
  }, [socket, createPeerConnection]);

  // Join room - runs once when all conditions are met
  useEffect(() => {
    if (!socket || !roomId || !displayName || !localStream) return;

    // Emit join only once per room/socket combination
    if (hasJoinedRef.current) {
      console.log('Already joined room, skipping duplicate join');
      return;
    }

    console.log('Joining room with local stream ready');
    socket.emit('join', { roomId, displayName });
    hasJoinedRef.current = true;
  }, [socket, roomId, displayName, localStream]);

  // Separate effect for cleanup - only runs on unmount
  useEffect(() => {
    return () => {
      if (socket && roomId && hasJoinedRef.current) {
        console.log('Component unmounting, leaving room:', roomId);
        socket.emit('leave', { roomId });
        hasJoinedRef.current = false;
      }
    };
  }, [socket, roomId]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }, []);

  // Screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }

      // Replace with camera stream
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        setScreenStream(stream);
        const screenTrack = stream.getVideoTracks()[0];

        // Replace video track in all peer connections
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        // Handle screen share stop
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  }, [isScreenSharing, screenStream]);

  return {
    localStream: isScreenSharing ? screenStream : localStream,
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
  };
}

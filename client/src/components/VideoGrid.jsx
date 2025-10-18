import { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({ localStream, remoteStreams, participants, displayName }) {
  const [animatedStreams, setAnimatedStreams] = useState(new Set());

  const allStreams = [
    { id: 'local', stream: localStream, name: displayName, isLocal: true },
    ...Object.entries(remoteStreams).map(([id, stream]) => ({
      id,
      stream,
      name: participants[id] || 'Unknown',
      isLocal: false
    }))
  ];

  // Trigger animation for new streams
  useEffect(() => {
    const newStreamIds = allStreams.map(s => s.id);
    newStreamIds.forEach(id => {
      if (!animatedStreams.has(id)) {
        setAnimatedStreams(prev => new Set([...prev, id]));
      }
    });
  }, [allStreams.length]);

  const getGridClass = () => {
    const count = allStreams.length;
    if (count === 1) return 'grid-cols-1 place-items-center';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-3 lg:grid-cols-4';
  };



  return (
    <div className={`grid ${getGridClass()} w-full gap-4 h-full p-4`}>
      {allStreams.map(({ id, stream, name, isLocal }) => (
        <div
          key={id}
          className="animate-scaleIn relative overflow-hidden w-full h-full  rounded-lg bg-gray-800"
          style={{
            animationDelay: `${allStreams.findIndex(s => s.id === id) * 100}ms`
          }}
        >
          <VideoPlayer
            stream={stream}
            name={name}
            muted={isLocal}
            isLocal={isLocal}
          />
        </div>
      ))}
    </div>
  );
}

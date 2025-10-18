import { useState, useEffect } from 'react';
import { Clock, Users, Wifi } from 'lucide-react';

export default function MeetingInfo({ roomId, participantCount }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-black/60 backdrop-blur-md text-white rounded-lg shadow-lg hover:bg-black/70 transition-all"
      >
        {isExpanded && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 p-4 space-y-3 min-w-[200px] bg-[rgba(0,0,0,0.8)] rounded-lg shadow-lg ">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Duration</p>
                <p className="text-sm font-semibold">{formatTime(elapsedTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-green-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Participants</p>
                <p className="text-sm font-semibold">{participantCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Wifi className="w-4 h-4 text-green-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Connection</p>
                <p className="text-sm font-semibold text-green-400">Good</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400">Meeting ID</p>
              <p className="text-sm font-mono">{roomId}</p>
            </div>
          </div>
        )}
          <div className="p-3 flex items-center gap-3">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold">{formatTime(elapsedTime)}</span>
            <div className="w-px h-4 bg-gray-600"></div>
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold">{participantCount}</span>
          </div>
      </button>
    </div>
  );
}

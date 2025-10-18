import { useEffect, useRef, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function VideoPlayer({ stream, name, muted = false, isLocal = false }) {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Set loading to false after a short delay to ensure video is ready
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [stream]);

  return (
    <div
      className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl transition-all h-full duration-300 animate-fadeIn"

    >
      {isLoading && !stream ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Connecting..." />
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className="w-full h-full object-cover"
          />

          {/* Name badge */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {name} {isLocal && '(You)'}
            </span>
          </div>

          {/* Connection quality indicator */}
          <div className="absolute top-3 right-3 flex gap-1">
            <div className="w-1 h-2 bg-green-500 rounded-full"></div>
            <div className="w-1 h-3 bg-green-500 rounded-full"></div>
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
          </div>
        </>
      )}
    </div>
  );
}

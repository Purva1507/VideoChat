import { useState } from 'react';
import { Share2, Copy, Check, Info } from 'lucide-react';

export default function MeetingInfoPanel({ roomId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const meetingLink = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomId}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my video meeting',
          text: `Join my video call on Video Meet`,
          url: meetingLink
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback to copy
      copyLink();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all shadow-lg flex items-center gap-2 border border-white/20"
      >
        <Info className="w-4 h-4" />
        <span className="text-sm font-medium">Meeting Info</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Meeting Details</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Meeting ID */}
            <div className="mb-6">
              <label className="text-sm text-gray-600 mb-2 block font-medium">Meeting ID</label>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-gray-900 font-mono text-lg">{roomId}</p>
              </div>
            </div>

            {/* Meeting Link */}
            <div className="mb-6">
              <label className="text-sm text-gray-600 mb-2 block font-medium">Meeting Link</label>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-blue-600 text-sm break-all">{meetingLink}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyLink}
                className="bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>

              <button
                onClick={shareLink}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm text-center">
                Share this link with others you want in the meeting
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

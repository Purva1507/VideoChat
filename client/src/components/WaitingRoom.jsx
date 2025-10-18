import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

export default function WaitingRoom({ roomId }) {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
        <div className="mb-8">
          <LoadingSpinner size="lg" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Waiting for Approval
        </h1>

        <p className="text-gray-600 mb-6">
          The meeting host will let you in soon. Please wait...
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Room ID:</span> {roomId}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
        >
          Leave Waiting Room
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Video, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function MyMeetings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' or 'all'

  useEffect(() => {
    if (user?.email) {
      fetchMeetings();
    }
  }, [filter, user]);

  const fetchMeetings = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const endpoint = filter === 'upcoming'
        ? `https://api.artvoo.in/api/meetings/user/${encodeURIComponent(user.email)}`
        : `https://api.artvoo.in/api/meetings/user/${encodeURIComponent(user.email)}/all`;

      const response = await axios.get(endpoint);
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;

    try {
      await axios.delete(`https://api.artvoo.in/api/meetings/${meetingId}`);
      fetchMeetings();
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      alert('Failed to cancel meeting');
    }
  };

  const joinMeeting = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ongoing':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isHost = (meeting) => {
    return meeting.hostEmail === user?.email;
  };

  const canJoin = (meeting) => {
    const meetingTime = new Date(meeting.scheduledDate);
    const now = new Date();
    const timeDiff = meetingTime - now;
    // Can join 10 minutes before scheduled time
    return timeDiff <= 10 * 60 * 1000 && meeting.status === 'scheduled';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Meetings</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Meetings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="text-gray-600 mt-4">Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'upcoming' ? 'No Upcoming Meetings' : 'No Meetings Found'}
            </h3>
            <p className="text-gray-600">
              {filter === 'upcoming'
                ? 'Schedule a new meeting to get started'
                : 'You have no meetings scheduled'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Title and Status */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          meeting.status
                        )}`}
                      >
                        {meeting.status}
                      </span>
                      {isHost(meeting) && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          Host
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {meeting.description && (
                      <p className="text-gray-600 mb-4">{meeting.description}</p>
                    )}

                    {/* Meeting Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDate(meeting.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>
                          {formatTime(meeting.scheduledDate)} ({meeting.duration} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{meeting.participants.length + 1} participants</span>
                      </div>
                    </div>

                    {/* Host Info */}
                    <div className="text-sm text-gray-600">
                      Hosted by: <span className="text-gray-900 font-medium">{meeting.hostName}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {meeting.status === 'scheduled' && canJoin(meeting) && (
                      <button
                        onClick={() => joinMeeting(meeting.roomId)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap font-medium"
                      >
                        <Video className="w-4 h-4" />
                        Join Now
                      </button>
                    )}

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meeting.meetingLink);
                        alert('Meeting link copied to clipboard!');
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Copy Link
                    </button>

                    {isHost(meeting) && meeting.status === 'scheduled' && (
                      <button
                        onClick={() => cancelMeeting(meeting._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

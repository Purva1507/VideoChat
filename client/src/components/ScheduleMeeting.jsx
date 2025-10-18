import { useState } from 'react';
import { Calendar, Clock, Users, X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ScheduleMeeting({ isOpen, onClose, userEmail, userName }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    participants: []
  });

  const [newParticipant, setNewParticipant] = useState({ email: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addParticipant = () => {
    if (newParticipant.email && newParticipant.name) {
      setFormData({
        ...formData,
        participants: [...formData.participants, { ...newParticipant }]
      });
      setNewParticipant({ email: '', name: '' });
    }
  };

  const removeParticipant = (index) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      // Validate future date
      if (scheduledDateTime <= new Date()) {
        setError('Meeting must be scheduled in the future');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post('https://api.artvoo.in/api/meetings/schedule', {
        title: formData.title,
        description: formData.description,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: parseInt(formData.duration),
        hostEmail: userEmail,
        hostName: userName,
        participants: formData.participants
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({
            title: '',
            description: '',
            scheduledDate: '',
            scheduledTime: '',
            duration: 60,
            participants: []
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      setError(err.response?.data?.error || 'Failed to schedule meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Schedule Meeting</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              Meeting scheduled successfully! Invitations have been sent.
            </div>
          )}

          {/* Meeting Title */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Team Standup, Client Presentation"
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add meeting agenda or notes..."
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time *
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                required
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Duration (minutes)
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Participants */}
          <div>
            <label className="text-gray-700 font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Invite Participants
            </label>

            {/* Add Participant */}
            <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Participant name"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  className="bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                  className="bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={addParticipant}
                className="w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Participant
              </button>
            </div>

            {/* Participants List */}
            {formData.participants.length > 0 && (
              <div className="space-y-2">
                {formData.participants.map((participant, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">{participant.name}</p>
                      <p className="text-gray-600 text-sm">{participant.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

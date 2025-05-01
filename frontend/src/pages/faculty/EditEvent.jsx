import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    studentSeats: 0,
    interestedUsers: []
  });

  useEffect(() => {
    if (location.state?.event) {
      const event = location.state.event;
      setEventData({
        title: event.title,
        description: event.description,
        venue: event.venue,
        date: new Date(event.date).toISOString().slice(0, 16),
        studentSeats: event.studentSeats || 0,
        interestedUsers: event.interestedUsers || []
      });
    } else {
      fetchEvent();
    }
  }, [id, location.state]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      
      const data = await response.json();
      setEventData({
        title: data.title,
        description: data.description,
        venue: data.venue,
        date: new Date(data.date).toISOString().slice(0, 16),
        studentSeats: data.studentSeats || 0,
        interestedUsers: data.interestedUsers || []
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Error fetching event details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      alert('Event updated successfully!');
      navigate('/faculty');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Edit Event
          </span>
        </h1>
        <button
          onClick={() => navigate('/faculty')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={eventData.title}
                onChange={(e) => setEventData({...eventData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={eventData.venue}
                onChange={(e) => setEventData({...eventData, venue: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={eventData.date}
                onChange={(e) => setEventData({...eventData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Seats
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={eventData.studentSeats}
                onChange={(e) => setEventData({...eventData, studentSeats: parseInt(e.target.value)})}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
              />
            </div>
          </div>

          {eventData.interestedUsers?.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Interested Alumni ({eventData.interestedUsers.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventData.interestedUsers.map(alumnus => (
                  <div key={alumnus._id} className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-3">
                    <img
                      src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                      alt={alumnus.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{alumnus.name}</p>
                      <p className="text-sm text-gray-600">{alumnus.profile?.basicInfo?.department || 'No department'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/faculty')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors"
            >
              Update Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;

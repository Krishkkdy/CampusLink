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
    // First try to use passed state
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
      // Fallback to fetching event if no state
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            required
            className="mt-1 w-full p-2 border rounded"
            value={eventData.title}
            onChange={(e) => setEventData({...eventData, title: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            className="mt-1 w-full p-2 border rounded"
            rows="4"
            value={eventData.description}
            onChange={(e) => setEventData({...eventData, description: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date & Time</label>
          <input
            type="datetime-local"
            required
            className="mt-1 w-full p-2 border rounded"
            value={eventData.date}
            onChange={(e) => setEventData({...eventData, date: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Venue</label>
          <input
            type="text"
            required
            className="mt-1 w-full p-2 border rounded"
            value={eventData.venue}
            onChange={(e) => setEventData({...eventData, venue: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Student Seats</label>
          <input
            type="number"
            min="0"
            required
            className="mt-1 w-full p-2 border rounded"
            value={eventData.studentSeats}
            onChange={(e) => setEventData({...eventData, studentSeats: parseInt(e.target.value)})}
          />
        </div>

        {/* Display Interested Alumni */}
        {eventData.interestedUsers?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Interested Alumni ({eventData.interestedUsers.length})</h3>
            <div className="border rounded-lg divide-y">
              {eventData.interestedUsers.map(alumnus => (
                <div key={alumnus._id} className="p-3 flex items-center space-x-3">
                  <img
                    src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                    alt={alumnus.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{alumnus.name}</p>
                    <p className="text-sm text-gray-600">{alumnus.profile?.basicInfo?.department || 'No department'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Update Event
          </button>
          <button
            type="button"
            onClick={() => navigate('/faculty')}
            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;

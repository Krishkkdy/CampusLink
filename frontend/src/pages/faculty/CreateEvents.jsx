import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { AuthContext } from "../../context/AuthContext";

const CreateEvents = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Add this
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    studentSeats: 0 // Add studentSeats field
  });

  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sanitizedData = {
        ...eventData,
        studentSeats: Math.max(0, parseInt(eventData.studentSeats) || 0),
        createdBy: user._id
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(sanitizedData)
      });
      
      if (res.ok) {
        alert('Event created successfully!');
        setEventData({ title: '', description: '', date: '', venue: '', studentSeats: 0 });
        navigate('/faculty'); // Add this to redirect after success
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Create New Event
          </span>
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Title</label>
              <input
                type="text"
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={eventData.title}
                onChange={(e) => setEventData({...eventData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  min={getMinDateTime()}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={eventData.date}
                  onChange={(e) => setEventData({...eventData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Seats</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={eventData.studentSeats}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || parseInt(value) >= 0) {
                      setEventData({
                        ...eventData,
                        studentSeats: value === '' ? 0 : parseInt(value)
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter, numbers
                    if (
                      e.key === 'Backspace' ||
                      e.key === 'Delete' ||
                      e.key === 'Tab' ||
                      e.key === 'Escape' ||
                      e.key === 'Enter' ||
                      (e.key >= '0' && e.key <= '9')
                    ) {
                      return;
                    }
                    e.preventDefault();
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Venue</label>
              <input
                type="text"
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={eventData.venue}
                onChange={(e) => setEventData({...eventData, venue: e.target.value})}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
            >
              Create Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvents;

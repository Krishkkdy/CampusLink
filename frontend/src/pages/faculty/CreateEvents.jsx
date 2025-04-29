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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Title</label>
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
          <label className="block text-sm font-medium text-gray-700">Date</label>
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
            step="1"
            required
            placeholder="Enter number of seats"
            className="mt-1 w-full p-2 border rounded"
            value={eventData.studentSeats}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setEventData({
                ...eventData,
                studentSeats: isNaN(value) ? 0 : Math.max(0, value)
              });
            }}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvents;

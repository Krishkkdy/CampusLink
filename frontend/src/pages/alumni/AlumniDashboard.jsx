import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AlumniDashboard = () => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      // Further filter events on the frontend if needed
      const validEvents = data.filter(event => 
        event.createdBy && // Check if creator exists
        new Date(event.date) >= new Date() // Double check dates
      );
      setEvents(validEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleShowInterest = async (eventId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/interest`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      if (response.ok) {
        // Refresh events after showing interest
        await fetchEvents();
      }
    } catch (error) {
      console.error('Error updating interest:', error);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Welcome Back, Alumni!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quick Stats Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Quick Stats</h2>
            <span className="text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-blue-600">{events.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Events Interested In</p>
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.interestedUsers?.includes(localStorage.getItem('userId'))).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div>
                  <h3 className="font-semibold text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Venue: {event.venue}</p>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted by: {event.createdBy?.name} ({event.createdBy?.profile?.basicInfo?.department})
                  </p>
                </div>
                <button
                  onClick={() => handleShowInterest(event._id)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    event.interestedUsers?.some(user => user._id === localStorage.getItem('userId'))
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {event.interestedUsers?.some(user => user._id === localStorage.getItem('userId'))
                    ? '✓ Interested' 
                    : 'Show Interest'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            No upcoming events at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDashboard;

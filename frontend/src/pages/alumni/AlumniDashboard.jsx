import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JobPostingForm from "../../components/alumni/JobPostingForm";

const AlumniDashboard = () => {
  const [events, setEvents] = useState([]);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);

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
      const validEvents = data.filter(event => 
        event.createdBy && 
        new Date(event.date) >= new Date()
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
        await fetchEvents();
      }
    } catch (error) {
      console.error('Error updating interest:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Alumni Dashboard
            </span>
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Event Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800">Upcoming Events</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{events.length}</h3>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
            <Link
              to="/alumni/view-events"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {events.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {events.slice(0, 4).map((event) => (
                <div key={event._id} 
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{event.title}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.venue}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                    </div>
                    <button
                      onClick={() => handleShowInterest(event._id)}
                      className={`ml-4 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        event.interestedUsers?.some(user => user._id === localStorage.getItem('userId'))
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {event.interestedUsers?.some(user => user._id === localStorage.getItem('userId'))
                        ? '✓ Interested'
                        : 'Show Interest'}
                    </button>
                  </div>
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
    </div>
  );
};

export default AlumniDashboard;

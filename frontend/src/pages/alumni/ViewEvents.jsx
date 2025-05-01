import React, { useState, useEffect, useContext } from "react";
import AlumniProfileModal from "../../components/AlumniProfileModal";
import { AuthContext } from '../../context/AuthContext';

const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const { user } = useContext(AuthContext);
  const [selectionStatus, setSelectionStatus] = useState({});

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
    } finally {
      setLoading(false);
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

  const fetchSelectionStatus = async (eventId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${eventId}/selection-status/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      const data = await response.json();
      setSelectionStatus(prev => ({
        ...prev,
        [eventId]: data.status
      }));
    } catch (error) {
      console.error('Error fetching selection status:', error);
    }
  };

  useEffect(() => {
    events.forEach(event => {
      fetchSelectionStatus(event._id);
    });
  }, [events]);

  if (loading) {
    return <div className="p-6 text-center">Loading events...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Upcoming Events
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                      {selectionStatus[event._id] && (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          selectionStatus[event._id] === 'selected' 
                            ? 'bg-green-100 text-green-800'
                            : selectionStatus[event._id] === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectionStatus[event._id].charAt(0).toUpperCase() + selectionStatus[event._id].slice(1)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.date).toLocaleString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.venue}
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-3">{event.description}</p>

                    <div className="border-t pt-4 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Posted by</span>
                          <span className="text-sm font-medium text-gray-700">
                            {event.createdBy?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {event.createdBy?.profile?.basicInfo?.department}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleShowInterest(event._id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              event.interestedUsers?.some(user => user._id === localStorage.getItem('userId'))
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {event.interestedUsers?.some(user => user._id === localStorage.getItem('userId'))
                              ? '✓ Interested'
                              : 'Show Interest'}
                          </button>
                          {event.interestedUsers?.length > 0 && (
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                            >
                              View {event.interestedUsers.length} interested
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900">No Events Available</h3>
              <p className="text-gray-500 mt-2">There are currently no upcoming events.</p>
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Interested Alumni
              </h2>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="divide-y divide-gray-200">
                {selectedEvent.interestedUsers?.map((alumnus) => (
                  <div
                    key={alumnus._id}
                    onClick={() => setSelectedAlumnus(alumnus)}
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <img
                      src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                      alt={alumnus.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{alumnus.name}</h3>
                      <p className="text-sm text-gray-600">{alumnus.profile?.basicInfo?.department || 'No department'}</p>
                      {alumnus.profile?.professional && (
                        <p className="text-sm text-gray-600">
                          {alumnus.profile.professional.designation}
                          {alumnus.profile.professional.currentCompany && 
                            ` at ${alumnus.profile.professional.currentCompany}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAlumnus && (
        <AlumniProfileModal
          alumnus={selectedAlumnus}
          onClose={() => setSelectedAlumnus(null)}
        />
      )}
    </div>
  );
};

export default ViewEvents;

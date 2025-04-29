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
      // Filter out invalid events
      const validEvents = data.filter(event => 
        event.createdBy && // Check if creator exists
        new Date(event.date) >= new Date() // Ensure future date
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                <div className="flex items-center text-gray-600 text-sm space-x-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-500">
                    Posted by: {event.createdBy?.name} ({event.createdBy?.profile?.basicInfo?.department})
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {event.interestedUsers?.length || 0} interested alumni
                    </span>
                    <button
                      onClick={() => handleShowInterest(event._id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        event.interestedUsers?.some(user => user._id === localStorage.getItem('userId'))
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {event.interestedUsers?.some(user => user._id === localStorage.getItem('userId'))
                        ? '✓ Interested' 
                        : 'Show Interest'}
                    </button>
                  </div>
                  {event.interestedUsers?.length > 0 && (
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View interested alumni
                    </button>
                  )}
                  {selectionStatus[event._id] && (
                    <div className={`px-4 py-2 rounded-lg ${
                      selectionStatus[event._id] === 'selected' 
                        ? 'bg-green-100 text-green-800'
                        : selectionStatus[event._id] === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Status: {selectionStatus[event._id].charAt(0).toUpperCase() + selectionStatus[event._id].slice(1)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            No events found
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="py-4">
                <h4 className="font-semibold mb-2">Interested Alumni</h4>
                <div className="max-h-[60vh] overflow-y-auto">
                  {selectedEvent.interestedUsers?.map((alumnus) => (
                    <div
                      key={alumnus._id}
                      onClick={() => setSelectedAlumnus(alumnus)}
                      className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded cursor-pointer border-b"
                    >
                      <img
                        src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                        alt={alumnus.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{alumnus.name}</p>
                            <p className="text-sm text-gray-600">{alumnus.profile?.basicInfo?.department || 'No department'}</p>
                          </div>
                        </div>
                        {(alumnus.profile?.professional?.currentCompany || 
                         alumnus.profile?.professional?.designation) && (
                          <div className="mt-2 text-sm text-gray-600">
                            {alumnus.profile.professional.designation}
                            {alumnus.profile.professional.currentCompany && 
                              ` at ${alumnus.profile.professional.currentCompany}`}
                          </div>
                        )}
                        {alumnus.profile?.professional?.skills?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {alumnus.profile.professional.skills.slice(0, 3).map((skill, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {alumnus.profile.professional.skills.length > 3 && (
                              <span className="text-xs text-gray-500 ml-1">
                                +{alumnus.profile.professional.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

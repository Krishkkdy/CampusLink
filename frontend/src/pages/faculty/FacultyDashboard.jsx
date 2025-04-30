import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FacultyDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [selections, setSelections] = useState(() => {
    // Initialize selections from localStorage with event-specific tracking
    const savedSelections = localStorage.getItem('eventSelections');
    return savedSelections ? JSON.parse(savedSelections) : {};
  });

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      const validEvents = data.filter(event => event && event._id && event.title);
      setEvents(validEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRemoveEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to remove this event?')) return;
    
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        alert('You must be logged in');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
        alert('Event removed successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove event');
      }
    } catch (error) {
      console.error('Error removing event:', error);
      alert(error.message || 'Failed to remove event');
    }
  };

  const handleAlumniSelection = async (eventId, alumniId, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/select-alumni`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ alumniId, status })
      });

      if (response.ok) {
        setSelections(prev => {
          const newSelections = { ...prev };
          if (!newSelections[eventId]) {
            newSelections[eventId] = {};
          }
          newSelections[eventId][alumniId] = status;
          localStorage.setItem('eventSelections', JSON.stringify(newSelections));
          return newSelections;
        });
        await fetchEvents();
        alert(`Alumni ${status} successfully!`);
      } else {
        throw new Error('Failed to update selection status');
      }
    } catch (error) {
      console.error('Error updating selection:', error);
      alert('Failed to update selection status');
    }
  };

  // Add this new handler function
  const handleStudentRegistration = async (eventId, studentId, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/student-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ studentId, status })
      });

      if (response.ok) {
        await fetchEvents();
        alert(`Student ${status} successfully!`);
      } else {
        throw new Error('Failed to update student registration');
      }
    } catch (error) {
      console.error('Error updating student registration:', error);
      alert('Failed to update student registration');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      return;
    }
    fetchEvents();
  }, []);

  // Add useEffect to update selections for each event 
  useEffect(() => {
    if (events.length > 0) {
      const allSelections = {};
      events.forEach(event => {
        allSelections[event._id] = {};
        event.selectedUsers?.forEach(selection => {
          if (selection.userId && selection.status) {
            allSelections[event._id][selection.userId] = selection.status;
          }
        });
      });
      setSelections(allSelections);
      localStorage.setItem('eventSelections', JSON.stringify(allSelections));
    }
  }, [events]);

  return (
    <div className="page-container">
      <h1 className="page-title">Faculty Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Create Events Link */}
        <Link to="/faculty/create-events" 
          className="card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex flex-col items-center text-center">
            <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-lg font-semibold">Create Event</h3>
            <p className="text-sm opacity-90">Schedule a new event</p>
          </div>
        </Link>

        {/* View Alumni Link */}
        <Link to="/faculty/view-alumni" 
          className="card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex flex-col items-center text-center">
            <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold">View Alumni</h3>
            <p className="text-sm opacity-90">Browse alumni profiles</p>
          </div>
        </Link>

        {/* Notify Alumni Link */}
        <Link to="/faculty/notify-alumni" 
          className="card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex flex-col items-center text-center">
            <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-semibold">Send Notifications</h3>
            <p className="text-sm opacity-90">Notify alumni about updates</p>
          </div>
        </Link>
      </div>

      {/* Upcoming Events */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
        </div>
        {events.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event._id} className="py-4 flex justify-between items-center">
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <h3 className="font-semibold text-lg text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-600">Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Venue: {event.venue}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Posted by: {event.createdBy?.name} ({event.createdBy?.profile?.basicInfo?.department})</p>
                  <p className="text-sm text-gray-600 mt-1">{event.interestedUsers?.length || 0} interested</p>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    to={`/faculty/edit-event/${event._id}`}
                    state={{ event }} // Add this line to pass event data
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleRemoveEvent(event._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            No events created yet. Create your first event!
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-semibold">{selectedEvent.venue}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-4">Interested Alumni ({selectedEvent.interestedUsers?.length || 0})</h4>
                <div className="max-h-60 overflow-y-auto">
                  {selectedEvent.interestedUsers?.map((alumnus) => (
                    <div 
                      key={alumnus._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div 
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => setSelectedAlumnus(alumnus)}
                      >
                        <img
                          src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                          alt={alumnus.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{alumnus.name}</p>
                          <p className="text-sm text-gray-600">
                            {alumnus.profile?.basicInfo?.department || 'Department not specified'}
                            {alumnus.profile?.academic?.graduationYear && 
                              ` | Batch of ${alumnus.profile.academic.graduationYear}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {selections[selectedEvent._id]?.[alumnus._id] ? (
                          <span className={`px-3 py-1 rounded text-sm ${
                            selections[selectedEvent._id][alumnus._id] === 'selected' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selections[selectedEvent._id][alumnus._id].charAt(0).toUpperCase() + selections[selectedEvent._id][alumnus._id].slice(1)}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAlumniSelection(selectedEvent._id, alumnus._id, 'selected');
                              }}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                            >
                              Select
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAlumniSelection(selectedEvent._id, alumnus._id, 'rejected');
                              }}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-4">Student Registration</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-gray-600">
                    <span className="font-medium">Available Seats:</span> {selectedEvent.studentSeats || 0}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${selectedEvent._id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                          },
                          body: JSON.stringify({ isSharedWithStudents: true })
                        });
                        if (response.ok) {
                          await fetchEvents();
                          alert('Event details shared with students successfully!');
                        }
                      } catch (error) {
                        console.error('Error sharing event:', error);
                        alert('Failed to share event with students');
                      }
                    }}
                    disabled={selectedEvent.isSharedWithStudents}
                    className={`px-4 py-2 rounded text-white ${
                      selectedEvent.isSharedWithStudents 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {selectedEvent.isSharedWithStudents ? 'Shared with Students' : 'Share with Students'}
                  </button>
                </div>
                
                {selectedEvent.registeredStudents?.length > 0 && (
                  <div className="max-h-60 overflow-y-auto">
                    <h5 className="font-medium mb-2">Registered Students ({selectedEvent.registeredStudents.length})</h5>
                    {selectedEvent.registeredStudents.map((registration, index) => (
                      <div 
                        // Add a composite key using both event ID and index since registration may not have unique ID
                        key={`${selectedEvent._id}-${registration.userId._id || index}`}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={registration.userId.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${registration.userId.name}`}
                            alt={registration.userId.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium">{registration.userId.name}</p>
                            <p className="text-sm text-gray-600">
                              {registration.userId.profile?.basicInfo?.department || 'No department'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {registration.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleStudentRegistration(selectedEvent._id, registration.userId._id, 'approved')}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStudentRegistration(selectedEvent._id, registration.userId._id, 'rejected')}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1 rounded text-sm ${
                              registration.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alumni Profile Modal */}
      {selectedAlumnus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedAlumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${selectedAlumnus.name}`}
                  alt={selectedAlumnus.name}
                  className="w-24 h-24 rounded-full border-4 border-blue-100"
                />
                <div>
                  <h2 className="text-2xl font-bold">{selectedAlumnus.name}</h2>
                  <p className="text-gray-600">{selectedAlumnus.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlumnus(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Department:</span> {selectedAlumnus.profile?.basicInfo?.department}</p>
                  <p><span className="font-medium">Location:</span> {selectedAlumnus.profile?.basicInfo?.location}</p>
                  <p><span className="font-medium">Phone:</span> {selectedAlumnus.profile?.basicInfo?.phone}</p>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Professional Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Current Company:</span> {selectedAlumnus.profile?.professional?.currentCompany}</p>
                  <p><span className="font-medium">Designation:</span> {selectedAlumnus.profile?.professional?.designation}</p>
                  <p><span className="font-medium">Experience:</span> {selectedAlumnus.profile?.professional?.experience}</p>
                </div>
              </div>

              {/* Skills & Achievements */}
              {(selectedAlumnus.profile?.professional?.skills?.length > 0 ||
                selectedAlumnus.profile?.professional?.achievements?.length > 0) && (
                <div className="col-span-full bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Skills & Achievements</h3>
                  <div className="space-y-4">
                    {selectedAlumnus.profile?.professional?.skills?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAlumnus.profile.professional.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(selectedAlumnus.profile?.social?.linkedin || selectedAlumnus.profile?.social?.github) && (
                <div className="col-span-full bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Links</h3>
                  <div className="flex space-x-4">
                    {selectedAlumnus.profile?.social?.linkedin && (
                      <a href={selectedAlumnus.profile.social.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 .4C4.698.4.4 4.698.4 10s4.298 9.6 9.6 9.6 9.6-4.298 9.6-9.6S15.302.4 10 .4zM7.65 13.979H5.706V7.723H7.65v6.256zm-.984-7.024c-.614 0-1.011-.435-1.011-.973 0-.549.409-.971 1.036-.971s1.011.422 1.023.971c0 .538-.396.973-1.048.973zm8.084-7.024h-1.944v-3.467c0-.807-.282-1.355-.985-1.355-.537 0-.856.371-.997.728-.052.127-.065.307-.065.486v3.607H8.814v-4.26c0" />
                        </svg>
                        LinkedIn Profile
                      </a>
                    )}
                    {selectedAlumnus.profile?.social?.github && (
                      <a href={selectedAlumnus.profile.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
                        </svg>
                        GitHub Profile
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
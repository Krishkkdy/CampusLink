import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FacultyDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [selections, setSelections] = useState(() => {
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

  const stats = [
    {
      title: "Upcoming Events",
      count: events.length,
      color: "from-blue-500 to-blue-600",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      link: "/faculty/create-events"
    },
    {
      title: "Alumni Network",
      count: "View",
      color: "from-green-500 to-green-600",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      link: "/faculty/view-alumni"
    },
    {
      title: "Messages",
      count: "Chat",
      color: "from-purple-500 to-purple-600", 
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      link: "/faculty/messages"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Faculty Dashboard
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <Link to={stat.link} className="block">
              <div className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="text-white">
                    <p className="text-base sm:text-lg font-semibold opacity-90">{stat.title}</p>
                    <p className="text-2xl sm:text-4xl font-bold mt-2 tracking-tight">{stat.count}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-inner">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/faculty/create-events" className="group">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center space-x-4 relative z-10">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Create Event</h3>
                  <p className="text-sm text-gray-600">Schedule a new event</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upcoming Events
          </h2>
          
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <div 
                key={event._id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.isSharedWithStudents 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.isSharedWithStudents ? 'Shared' : 'Not Shared'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm line-clamp-1">{event.venue}</span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">{event.description}</p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-blue-600 font-medium">
                          {event.interestedUsers?.length || 0} interested
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-sm text-green-600 font-medium">
                          {event.registeredStudents?.length || 0} registered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-end space-x-2">
                  <Link 
                    to={`/faculty/edit-event/${event._id}`}
                    state={{ event }}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleRemoveEvent(event._id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No events yet</h3>
            <p className="text-gray-500 mt-2">Create your first event to get started!</p>
          </div>
        )}
      </div>

      {selectedEvent && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
              <div className="sticky top-0 bg-white px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                  <button 
                    onClick={() => setSelectedEvent(null)} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Venue</p>
                    <p className="font-semibold">{selectedEvent.venue}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>

                {/* Rest of the modal content remains the same */}
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
        </>
      )}

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
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Department:</span> {selectedAlumnus.profile?.basicInfo?.department}</p>
                  <p><span className="font-medium">Location:</span> {selectedAlumnus.profile?.basicInfo?.location}</p>
                  <p><span className="font-medium">Phone:</span> {selectedAlumnus.profile?.basicInfo?.phone}</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Professional Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Current Company:</span> {selectedAlumnus.profile?.professional?.currentCompany}</p>
                  <p><span className="font-medium">Designation:</span> {selectedAlumnus.profile?.professional?.designation}</p>
                  <p><span className="font-medium">Experience:</span> {selectedAlumnus.profile?.professional?.experience}</p>
                </div>
              </div>

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
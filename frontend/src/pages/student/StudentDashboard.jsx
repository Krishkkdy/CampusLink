import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      
      const studentEvents = data.filter(event => {
        const isRegistered = event.registeredStudents?.some(
          reg => reg.userId === localStorage.getItem('userId')
        );
        
        return event.studentSeats > 0 && 
               new Date(event.date) > new Date() &&
               event.isSharedWithStudents === true;
      });

      setEvents(studentEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs?active=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch job postings');
      }
      
      const data = await response.json();
      const sortedJobs = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
      setRecentJobs(sortedJobs);
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
    }
  };

  useEffect(() => {
    // Load applied jobs and registered events from localStorage on mount
    const savedAppliedJobs = localStorage.getItem('appliedJobs');
    const savedRegisteredEvents = localStorage.getItem('registeredEvents');
    
    if (savedAppliedJobs) {
      setAppliedJobs(new Set(JSON.parse(savedAppliedJobs)));
    }
    if (savedRegisteredEvents) {
      setRegisteredEvents(new Set(JSON.parse(savedRegisteredEvents)));
    }
  }, []);

  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/student-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ 
          studentId: localStorage.getItem('userId'),
          status: 'approved'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register for event');
      }

      // Update local state and persist to localStorage
      const newRegisteredEvents = new Set([...registeredEvents, eventId]);
      setRegisteredEvents(newRegisteredEvents);
      localStorage.setItem('registeredEvents', JSON.stringify([...newRegisteredEvents]));

      await fetchEvents();
      alert('Registration successful!');
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error.message || 'Failed to register for event');
    }
  };

  const handleApplyForJob = async (jobId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply for job');
      }
      
      // Update local state and persist to localStorage
      const newAppliedJobs = new Set([...appliedJobs, jobId]);
      setAppliedJobs(newAppliedJobs);
      localStorage.setItem('appliedJobs', JSON.stringify([...newAppliedJobs]));
      
      await fetchRecentJobs();
      alert('Successfully applied for job!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert(error.message || 'Failed to apply for job. Please try again.');
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRecentJobs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Student Dashboard
          </span>
        </h1>
      </div>

      
      {/* Recent Job Postings Section - Updated styling */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Recent Job Opportunities
          </h2>
          <Link to="/student/jobs" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            View All
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recentJobs.map((job) => {
            const isApplied = appliedJobs.has(job._id) || job.applicants?.some(
              applicant => applicant.student?._id === localStorage.getItem('userId')
            );
            
            return (
              <div key={job._id} className="bg-white p-6 rounded-lg shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {job.jobType}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">{job.company}</span> • {job.location}
                </p>
                
                <div className="flex items-center mb-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <span>Posted by Alumni: {job.postedBy?.name}</span>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                  
                  {isApplied ? (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center font-medium">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Applied
                    </span>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApplyForJob(job._id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply Now
                      </button>
                      <Link
                        to={`/student/jobs/${job._id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {recentJobs.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No job postings available
            </div>
          )}
        </div>
      </div>

      {/* Events Section - Updated styling */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upcoming Events
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const isRegistered = registeredEvents.has(event._id) || event.registeredStudents?.some(
              reg => reg.userId === localStorage.getItem('userId')
            );
            const seatsRemaining = event.studentSeats - (event.registeredStudents?.filter(reg => reg.status === 'approved')?.length || 0);

            return (
              <div key={event._id} className="bg-white p-6 rounded-lg shadow-lg group hover:shadow-xl transition-all duration-300">
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(event.date).toLocaleString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Venue:</span> {event.venue}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Available Seats:</span>{' '}
                    {seatsRemaining}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Faculty:</span>{' '}
                    {event.createdBy?.name} ({event.createdBy?.profile?.basicInfo?.department})
                  </p>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>
                
                {isRegistered ? (
                  <div className="flex items-center justify-center bg-green-50 text-green-700 py-3 px-4 rounded-lg font-medium">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Registration Confirmed
                  </div>
                ) : seatsRemaining > 0 ? (
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                  >
                    Register for Event
                  </button>
                ) : (
                  <div className="text-center py-3 bg-gray-50 text-gray-600 rounded-lg font-medium">
                    No Seats Available
                  </div>
                )}
              </div>
            );
          })}
          
          {events.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No upcoming events available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

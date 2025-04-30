import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      
      // Filter events properly
      const studentEvents = data.filter(event => {
        const isRegistered = event.registeredStudents?.some(
          reg => reg.userId === localStorage.getItem('userId')
        );
        
        // Show only events that:
        // 1. Have student seats available
        // 2. Are in the future
        // 3. Have been shared with students
        // 4. Include both registered and unregistered events
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
      // Sort by creation date (newest first) and take only 3 most recent
      const sortedJobs = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
      setRecentJobs(sortedJobs);
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
    }
  };

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
          status: 'approved' // Changed from 'pending' to 'approved'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register for event');
      }

      await fetchEvents();
      alert('Registration successful!'); // Removed "Awaiting faculty approval"
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      {/* Navigation Bar */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex overflow-x-auto">
          <Link 
            to="/student/dashboard" 
            className="px-4 py-3 font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap"
          >
            Dashboard
          </Link>
          <Link 
            to="/student/jobs" 
            className="px-4 py-3 font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 whitespace-nowrap"
          >
            Job Listings
          </Link>
          <Link 
            to="/student/profile" 
            className="px-4 py-3 font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 whitespace-nowrap"
          >
            Profile
          </Link>
          <Link 
            to="/student/messages" 
            className="px-4 py-3 font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 whitespace-nowrap"
          >
            Messages
          </Link>
        </div>
      </div>
      
      {/* Academic and Skills Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Academic Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Department:</span> Computer Science
            </p>
            <p>
              <span className="font-medium">Semester:</span> 6
            </p>
            <p>
              <span className="font-medium">CGPA:</span> 8.5
            </p>
          </div>
        </div>

        {/* Skills Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Programming
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Web Development
            </span>
          </div>
        </div>

        {/* Projects Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Student Management System</li>
            <li>E-commerce Website</li>
          </ul>
        </div>
      </div>

      {/* Recent Job Postings Section */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Job Opportunities</h2>
          <Link 
            to="/student/jobs" 
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            View All Jobs
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentJobs.map((job) => {
            // Check if user has already applied
            const hasApplied = job.applicants?.some(
              applicant => applicant.student?._id === localStorage.getItem('userId')
            );
            
            return (
              <div key={job._id} className="bg-white p-6 rounded-lg shadow-lg">
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
                  
                  {hasApplied ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                      Applied
                    </span>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApplyForJob(job._id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Apply
                      </button>
                      <Link
                        to={`/student/jobs/${job._id}`}
                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
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

      {/* Events Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const userRegistration = event.registeredStudents?.find(
              reg => reg.userId === localStorage.getItem('userId')
            );
            const seatsRemaining = event.studentSeats - (event.registeredStudents?.filter(reg => reg.status === 'approved')?.length || 0);

            return (
              <div key={event._id} className="bg-white p-6 rounded-lg shadow-lg">
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
                
                {userRegistration ? (
                  <div className="text-center py-2 rounded bg-green-100 text-green-800">
                    Registered
                  </div>
                ) : seatsRemaining > 0 ? (
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Register
                  </button>
                ) : (
                  <div className="text-center py-2 bg-gray-100 text-gray-800 rounded">
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

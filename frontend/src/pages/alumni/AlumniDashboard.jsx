import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JobPostingForm from "../../components/alumni/JobPostingForm";

const AlumniDashboard = () => {
  const [events, setEvents] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobPostingStats, setJobPostingStats] = useState({
    total: 0,
    active: 0,
    applicationsReceived: 0
  });
  
  useEffect(() => {
    fetchEvents();
    fetchJobPostings();
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

  const fetchJobPostings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/my-postings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setJobPostings(data);
      
      // Calculate stats
      const activeJobs = data.filter(job => job.isActive);
      const totalApplicants = data.reduce((total, job) => 
        total + (job.applicants ? job.applicants.length : 0), 0);
      
      setJobPostingStats({
        total: data.length,
        active: activeJobs.length,
        applicationsReceived: totalApplicants
      });
    } catch (error) {
      console.error('Error fetching job postings:', error);
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

  const handleCreateJobPosting = async (jobData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(jobData)
      });
      
      if (response.ok) {
        // Refresh job postings after creating a new one
        await fetchJobPostings();
        setIsJobFormOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Error creating job posting: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      alert('Failed to create job posting. Please try again.');
    }
  };

  const handleDeleteJobPosting = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });
        
        if (response.ok) {
          // Refresh job postings after deletion
          await fetchJobPostings();
        } else {
          const errorData = await response.json();
          alert(`Error deleting job posting: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting job posting:', error);
        alert('Failed to delete job posting. Please try again.');
      }
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (response.ok) {
        // Refresh job postings after updating status
        await fetchJobPostings();
      } else {
        const errorData = await response.json();
        alert(`Error updating job status: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Welcome Back, Alumni!</h1>
      
      {/* Navigation Bar */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex overflow-x-auto">
          <Link 
            to="/alumni" 
            className="px-4 py-3 font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap"
          >
            Dashboard
          </Link>
          <Link 
            to="/alumni/view-events" 
            className="px-4 py-3 font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 whitespace-nowrap"
          >
            Events
          </Link>
          <Link 
            to="/alumni/profile" 
            className="px-4 py-3 font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 whitespace-nowrap"
          >
            Profile
          </Link>
          <Link 
            to="/alumni/messages" 
            className="px-4 py-3 font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 whitespace-nowrap"
          >
            Messages
          </Link>
          <Link 
            to="/alumni/resume-review" 
            className="px-4 py-3 font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 whitespace-nowrap"
          >
            Resume Review
          </Link>
        </div>
      </div>
      
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

        {/* Job Posting Stats Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Job Posting Stats</h2>
            <span className="text-green-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-purple-600">{jobPostingStats.total}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-blue-600">{jobPostingStats.active}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Applicants</p>
              <p className="text-2xl font-bold text-yellow-600">{jobPostingStats.applicationsReceived}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Postings Section */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Job Postings</h2>
          <button 
            onClick={() => setIsJobFormOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Create New Job Posting
          </button>
        </div>

        {jobPostings.length > 0 ? (
          <div className="space-y-4">
            {jobPostings.map((job) => (
              <div key={job._id} 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{job.company} • {job.location}</p>
                    <p className="text-sm text-gray-600 mt-1">Type: {job.jobType} • Salary: {job.salary}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {job.applicants?.length || 0} applicant(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/alumni/job-postings/${job._id}`}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => toggleJobStatus(job._id, job.isActive)}
                      className={`px-3 py-1 text-white text-sm rounded transition-colors duration-200 ${
                        job.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {job.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteJobPosting(job._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            You haven't created any job postings yet.
          </div>
        )}
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

      {/* Job Posting Form Modal */}
      {isJobFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Job Posting</h2>
              <button 
                onClick={() => setIsJobFormOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <JobPostingForm onSubmit={handleCreateJobPosting} onCancel={() => setIsJobFormOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDashboard;

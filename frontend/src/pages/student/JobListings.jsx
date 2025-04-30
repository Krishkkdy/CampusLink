import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const JobListings = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ jobType: '', search: '' });
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const fetchJobPostings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs?active=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch job postings');
      }
      
      const data = await response.json();
      setJobPostings(data);
    } catch (error) {
      console.error('Error fetching job postings:', error);
      setError('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForJob = async (jobId, jobTitle) => {
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
      
      // Refresh job postings to show updated status
      await fetchJobPostings();
      
      // Show success message
      setSuccessMessage(`Successfully applied for "${jobTitle}"`);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Error applying for job:', error);
      alert(error.message || 'Failed to apply for job. Please try again.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const filteredJobs = jobPostings.filter(job => {
    // Filter by job type if selected
    if (filter.jobType && job.jobType !== filter.jobType) {
      return false;
    }
    
    // Filter by search term
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  if (loading) {
    return <div className="page-container"><p>Loading job listings...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchJobPostings}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded shadow-lg flex items-center">
          <svg className="w-6 h-6 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold">Application Submitted!</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <h1 className="page-title">Job Listings</h1>
      
      <div className="card p-6 mb-6 bg-blue-50 border border-blue-100">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold text-blue-800">Alumni Job Opportunities</h2>
            <p className="text-blue-600">These job postings are shared by alumni from your institution to help you find opportunities.</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Jobs
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder="Search by title, company, location..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              id="jobType"
              name="jobType"
              value={filter.jobType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setFilter({ jobType: '', search: '' })}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Job Listings */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            // Check if user has already applied
            const hasApplied = job.applicants?.some(
              applicant => applicant.student?._id === localStorage.getItem('userId')
            );
            
            return (
              <div key={job._id} className={`card p-6 ${hasApplied ? 'border-l-4 border-green-500' : ''}`}>
                {hasApplied && (
                  <div className="mb-3 bg-green-50 p-2 rounded-md flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-700 font-medium">You have applied for this position</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                    <p className="text-md text-gray-600 mt-1">{job.company} • {job.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.jobType} • 
                      <span className="inline-flex items-center ml-1">
                        <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        <span className="text-blue-700 font-medium">Posted by Alumni: {job.postedBy?.name}</span>
                      </span>
                    </p>
                    <div className="mt-3 mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                        {job.salary || 'Salary not specified'}
                      </span>
                      <span className="inline-block ml-2 px-3 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">
                        Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {hasApplied ? (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium inline-flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyForJob(job._id, job.title)}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                      >
                        Apply Now
                      </button>
                    )}
                    
                    <Link
                      to={`/student/jobs/${job._id}`}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-600 line-clamp-3">{job.description}</p>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-1">Requirements</h3>
                  <p className="text-gray-600 line-clamp-3">{job.requirements}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-6 text-center text-gray-500">
          {filter.jobType || filter.search 
            ? 'No job postings match your search criteria.'
            : 'No job postings available at the moment.'}
        </div>
      )}
    </div>
  );
};

export default JobListings;
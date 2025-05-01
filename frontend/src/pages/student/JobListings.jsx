import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const JobListings = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ jobType: '', search: '' });
  const [successMessage, setSuccessMessage] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    const savedAppliedJobs = localStorage.getItem('appliedJobs');
    if (savedAppliedJobs) {
      setAppliedJobs(new Set(JSON.parse(savedAppliedJobs)));
    }
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

      const newAppliedJobs = new Set([...appliedJobs, jobId]);
      setAppliedJobs(newAppliedJobs);
      localStorage.setItem('appliedJobs', JSON.stringify([...newAppliedJobs]));

      await fetchJobPostings();
      setSuccessMessage('Successfully applied for job!');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
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
    if (filter.jobType && job.jobType !== filter.jobType) {
      return false;
    }

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Job Listings
          </span>
        </h1>
      </div>

      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search jobs..."
              value={filter.search}
              onChange={handleFilterChange}
              name="search"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              name="jobType"
              value={filter.jobType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <button
            onClick={() => setFilter({ jobType: '', search: '' })}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => {
          const isApplied = appliedJobs.has(job._id) || job.applicants?.some(
            applicant => applicant.student?._id === localStorage.getItem('userId')
          );

          return (
            <div key={job._id}
              className="bg-white rounded-xl shadow-md p-6 group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                  {job.jobType}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <p className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">{job.company}</span>
                </p>

                <p className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {job.location}
                </p>

                <p className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              </div>

              <p className="text-gray-600 mb-6 line-clamp-2">{job.description}</p>

              <div className="pt-4 border-t border-gray-50">
                {isApplied ? (
                  <div className="flex items-center justify-center bg-green-50 text-green-700 py-2 px-4 rounded-lg font-medium">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Applied Successfully
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApplyForJob(job._id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Apply Now
                    </button>
                    <Link
                      to={`/student/jobs/${job._id}`}
                      className="px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 text-lg">No job postings match your criteria</p>
        </div>
      )}
    </div>
  );
};

export default JobListings;
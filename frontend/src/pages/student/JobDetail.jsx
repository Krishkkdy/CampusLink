import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobPosting, setJobPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    fetchJobPosting();
  }, [jobId]);

  const fetchJobPosting = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch job posting');
      }
      
      const data = await response.json();
      setJobPosting(data);
      
      // Check if the user has already applied for this job
      const userId = localStorage.getItem('userId');
      const userApplication = data.applicants?.find(
        applicant => applicant.student?._id === userId
      );
      
      if (userApplication) {
        setHasApplied(true);
        setApplicationStatus(userApplication.status);
      } else {
        setHasApplied(false);
        setApplicationStatus(null);
      }
    } catch (error) {
      console.error('Error fetching job posting:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForJob = async () => {
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
      
      // Refresh job posting data
      await fetchJobPosting();
      
      // Show success message
      setShowSuccessAlert(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
    } catch (error) {
      console.error('Error applying for job:', error);
      alert(error.message || 'Failed to apply for job. Please try again.');
    }
  };

  if (loading) {
    return <div className="page-container"><p>Loading job details...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/student/jobs')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Job Listings
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded shadow-lg flex items-center">
          <svg className="w-6 h-6 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold">Application Submitted!</p>
            <p>You have successfully applied for this position.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Job Details</h1>
        <button 
          onClick={() => navigate('/student/jobs')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back to Job Listings
        </button>
      </div>

      {hasApplied && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md flex items-center">
          <div className="bg-green-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-green-700">You have applied for this position</p>
            <p className="text-green-600">Current status: 
              <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                applicationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                applicationStatus === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                applicationStatus === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {applicationStatus}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{jobPosting.title}</h2>
            <p className="text-lg text-gray-600">{jobPosting.company}</p>
            <p className="text-md text-gray-600 mb-4">{jobPosting.location}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">
                {jobPosting.jobType}
              </span>
              {jobPosting.salary && (
                <span className="px-3 py-1 bg-green-100 text-green-600 text-sm font-semibold rounded-full">
                  {jobPosting.salary}
                </span>
              )}
              <span className="px-3 py-1 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full">
                Deadline: {new Date(jobPosting.applicationDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:text-right">
            {!hasApplied && (
              <button
                onClick={handleApplyForJob}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Apply Now
              </button>
            )}
            <div className="mt-2 flex items-center justify-end">
              <svg className="w-5 h-5 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <span className="text-blue-700 font-medium">Posted by Alumni: {jobPosting.postedBy?.name}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Posted on: {new Date(jobPosting.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Job Description</h3>
          <div className="text-gray-700 whitespace-pre-line">
            {jobPosting.description}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Requirements</h3>
          <div className="text-gray-700 whitespace-pre-line">
            {jobPosting.requirements}
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Information</h3>
          <p className="text-gray-700">
            <span className="font-medium">Email: </span>{jobPosting.contactEmail}
          </p>
        </div>

        {!hasApplied && (
          <div className="mt-8 text-center">
            <button
              onClick={handleApplyForJob}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              Apply for this Position
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail; 
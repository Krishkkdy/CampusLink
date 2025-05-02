import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobDetailsModal from './JobDetailsModal';
import JobPostingForm from './JobPostingForm';
import ApplicantsList from './ApplicantsList';

const JobPostingCard = ({ job, onRefresh }) => {
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ isActive: !job.isActive })
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });
        
        if (response.ok) {
          onRefresh();
        }
      } catch (error) {
        console.error('Error deleting job posting:', error);
      }
    }
  };

  const handleUpdateJob = async (updatedData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        onRefresh();
        setShowEditModal(false);
      } else {
        throw new Error('Failed to update job posting');
      }
    } catch (error) {
      console.error('Error updating job posting:', error);
      alert('Failed to update job posting. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div className="w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{job.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {job.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-600">{job.company} • {job.location}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowDetailsModal(true)}
                className="inline-flex items-center px-3 py-2 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                View
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full">
              {job.jobType}
            </span>
            {job.salary && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs sm:text-sm rounded-full">
                {job.salary}
              </span>
            )}
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs sm:text-sm rounded-full">
              Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
            </span>
          </div>

          <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{job.description}</p>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{job.applicants?.length || 0}</span> applicant(s)
              </div>
              {(job.applicants?.length > 0) && (
                <button
                  onClick={() => setShowApplicantsModal(true)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-md hover:bg-indigo-200 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  View Applicants
                </button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleToggleStatus}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                  job.isActive 
                    ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {job.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200 transition-colors flex-1 sm:flex-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetailsModal && (
        <JobDetailsModal 
          job={job} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Edit Job Posting
              </h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <JobPostingForm 
                initialData={job}
                onSubmit={handleUpdateJob}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showApplicantsModal && (
        <ApplicantsList 
          jobId={job._id} 
          jobTitle={job.title}
          onClose={() => setShowApplicantsModal(false)} 
        />
      )}
    </>
  );
};

export default JobPostingCard;

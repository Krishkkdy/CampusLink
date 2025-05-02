import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobPostingForm from '../../components/alumni/JobPostingForm';

const JobPostingDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobPosting, setJobPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
    } catch (error) {
      console.error('Error fetching job posting:', error);
      setError('Failed to load job posting details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJobPosting = async (updatedData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job posting');
      }
      
      // Refresh job posting data
      await fetchJobPosting();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating job posting:', error);
      alert(error.message || 'Failed to update job posting');
    }
  };

  const handleUpdateApplicantStatus = async (applicantId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/${jobId}/applicants/${applicantId}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update applicant status');
      }
      
      // Refresh job posting data to show updated status
      await fetchJobPosting();
    } catch (error) {
      console.error('Error updating applicant status:', error);
      alert(error.message || 'Failed to update applicant status');
    }
  };

  const handleViewStudentProfile = (studentId) => {
    if (studentId) {
      navigate(`/alumni/view-student-profile/${studentId}`);
    } else {
      alert('Cannot view profile: Student ID not available');
    }
  };

  if (loading) {
    return <div className="page-container"><p>Loading job posting details...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/alumni/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="page-container">
        <h1 className="page-title">Edit Job Posting</h1>
        <div className="card p-6">
          <JobPostingForm 
            initialData={jobPosting} 
            onSubmit={handleUpdateJobPosting} 
            onCancel={() => setIsEditing(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                  Job Posting Details
                </span>
              </h1>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full xs:w-auto px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Job
                </button>
                <button 
                  onClick={() => navigate('/alumni/dashboard')}
                  className="w-full xs:w-auto px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{jobPosting.title}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${jobPosting.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {jobPosting.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm sm:text-base text-gray-600">{jobPosting.company} • {jobPosting.location}</p>
                  <p className="text-sm text-gray-600">
                    {jobPosting.jobType} • {jobPosting.salary ? `Salary: ${jobPosting.salary}` : 'Salary not specified'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm text-gray-600 lg:text-right">
                <p>Posted on: {new Date(jobPosting.createdAt).toLocaleDateString()}</p>
                <p>Deadline: {new Date(jobPosting.applicationDeadline).toLocaleDateString()}</p>
                <p>Contact: {jobPosting.contactEmail}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Description</h3>
              <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{jobPosting.description}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Requirements</h3>
              <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{jobPosting.requirements}</p>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Applicants ({jobPosting.applicants?.length || 0})
          </h2>
          
          {jobPosting.applicants && jobPosting.applicants.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {jobPosting.applicants.map((applicant) => (
                      <tr key={applicant._id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div 
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                            onClick={() => handleViewStudentProfile(applicant.student?._id)}
                          >
                            {applicant.student?.name || 'Unknown Student'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {applicant.student?.email || 'No email'}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-500">
                            {new Date(applicant.appliedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            applicant.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            applicant.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                            applicant.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {applicant.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <select 
                            value={applicant.status}
                            onChange={(e) => handleUpdateApplicantStatus(applicant._id, e.target.value)}
                            className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-auto"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No applications received yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPostingDetail;
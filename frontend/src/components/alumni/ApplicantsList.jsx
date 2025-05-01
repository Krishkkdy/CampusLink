import React, { useState, useEffect } from 'react';
import StudentProfileModal from './StudentProfileModal';

const ApplicantsList = ({ jobId, onClose, jobTitle }) => {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch applicants');
      }
      
      const data = await response.json();
      // Ensure applicants are populated with student data
      setApplicants(data.applicants || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setError('Failed to load applicants. Please try again.');
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}/applicants/${applicantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update applicant status');
      }
      
      // Refresh the applicants list
      fetchApplicants();
    } catch (error) {
      console.error('Error updating applicant status:', error);
      setError('Failed to update status. Please try again.');
    }
  };

  const viewStudentProfile = (studentId) => {
    setSelectedStudent(studentId);
  };

  const closeStudentProfile = () => {
    setSelectedStudent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Reviewed': return 'bg-blue-100 text-blue-800';
      case 'Shortlisted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Applicants
              </h2>
              <p className="text-gray-600">For: {jobTitle}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No applicants yet for this job posting.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applicants.map((applicant) => (
                      <tr key={applicant._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => viewStudentProfile(applicant.student?._id)}
                          >
                            {applicant.student?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">{applicant.student?.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(applicant.appliedAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(applicant.appliedAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(applicant.status)}`}>
                            {applicant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={applicant.status}
                            onChange={(e) => handleStatusChange(applicant._id, e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            )}
          </div>
        </div>
      </div>

      {selectedStudent && (
        <StudentProfileModal 
          studentId={selectedStudent} 
          onClose={closeStudentProfile} 
        />
      )}
    </>
  );
};

export default ApplicantsList; 
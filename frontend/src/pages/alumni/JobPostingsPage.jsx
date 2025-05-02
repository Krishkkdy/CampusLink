import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JobPostingForm from "../../components/alumni/JobPostingForm";
import StatsCard from "../../components/alumni/StatsCard";
import JobPostingCard from "../../components/alumni/JobPostingCard";

const JobPostingsPage = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobPostingStats, setJobPostingStats] = useState({
    total: 0,
    active: 0,
    applicationsReceived: 0
  });

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const fetchJobPostings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/my-postings?populate=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setJobPostings(data);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Job Postings
            </span>
          </h1>
          <button 
            onClick={() => setIsJobFormOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center sm:justify-start space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Job Posting</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title="Total Jobs"
            value={jobPostingStats.total}
            icon="briefcase"
            color="blue"
          />
          <StatsCard
            title="Active Jobs"
            value={jobPostingStats.active}
            icon="check-circle"
            color="green"
          />
          <StatsCard
            title="Total Applications"
            value={jobPostingStats.applicationsReceived}
            icon="users"
            color="purple"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Your Job Postings</h2>
            <div className="w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="w-full sm:w-64 px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {jobPostings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {jobPostings.map((job) => (
                <div key={job._id} className="transition-all duration-200">
                  <JobPostingCard job={job} onRefresh={fetchJobPostings} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-6 sm:py-8 px-3 sm:px-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-base sm:text-lg">You haven't created any job postings yet.</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Click the "Create Job Posting" button to get started.</p>
            </div>
          )}
        </div>

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
    </div>
  );
};

export default JobPostingsPage;

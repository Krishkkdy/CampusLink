import React from 'react';

const JobDetailsModal = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Job Details
          </h2>
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
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-semibold text-gray-800">{job.title}</h3>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {job.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <p className="text-lg text-gray-700">
                <span className="font-medium">Company:</span> {job.company}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-medium">Location:</span> {job.location}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-medium">Job Type:</span> {job.jobType}
              </p>
              {job.salary && (
                <p className="text-lg text-gray-700">
                  <span className="font-medium">Salary:</span> {job.salary}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-lg text-gray-700">
                <span className="font-medium">Posted:</span> {new Date(job.createdAt).toLocaleDateString()}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-medium">Deadline:</span> {new Date(job.applicationDeadline).toLocaleDateString()}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-medium">Contact:</span> {job.contactEmail}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h4>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h4>
              <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;

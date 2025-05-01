import React from 'react';

const FacultyProfileModal = ({ faculty, onClose, onConnect, connectionStatus, showConnect = true }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={faculty.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${faculty.name}`}
              alt={faculty.name}
              className="w-24 h-24 rounded-full border-4 border-purple-100"
            />
            <div>
              <h2 className="text-2xl font-bold">{faculty.name}</h2>
              <p className="text-gray-600">{faculty.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Basic Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Department:</span> {faculty.profile?.basicInfo?.department}</p>
              <p><span className="font-medium">Designation:</span> {faculty.profile?.basicInfo?.designation}</p>
              <p><span className="font-medium">Employee ID:</span> {faculty.profile?.basicInfo?.employeeId}</p>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Academic Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Specialization:</span> {faculty.profile?.academic?.specialization}</p>
              <div>
                <span className="font-medium">Subjects:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {faculty.profile?.academic?.subjects?.map((subject, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="col-span-full bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Office Location:</span> {faculty.profile?.contact?.officeLocation}</p>
              <p><span className="font-medium">Office Hours:</span> {faculty.profile?.contact?.officeHours}</p>
              {faculty.profile?.contact?.website && (
                <p>
                  <span className="font-medium">Website:</span>{" "}
                  <a 
                    href={faculty.profile.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {faculty.profile.contact.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Connection Controls */}
        {showConnect && onConnect && (
          <div className="col-span-full mt-4 border-t pt-4">
            {!connectionStatus && (
              <button
                onClick={onConnect}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Connect
              </button>
            )}
            {connectionStatus === 'sent' && (
              <button disabled className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded">
                Request Sent
              </button>
            )}
            {connectionStatus === 'accepted' && (
              <button disabled className="w-full bg-green-100 text-green-600 px-4 py-2 rounded">
                Connected
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyProfileModal;

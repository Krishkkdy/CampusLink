import React from 'react';

const AlumniProfileModal = ({ alumnus, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
              alt={alumnus.name}
              className="w-24 h-24 rounded-full border-4 border-blue-100"
            />
            <div>
              <h2 className="text-2xl font-bold">{alumnus.name}</h2>
              <p className="text-gray-600">{alumnus.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Basic Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Department:</span> {alumnus.profile?.basicInfo?.department}</p>
              <p><span className="font-medium">Location:</span> {alumnus.profile?.basicInfo?.location}</p>
              <p><span className="font-medium">Phone:</span> {alumnus.profile?.basicInfo?.phone}</p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Professional Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Current Company:</span> {alumnus.profile?.professional?.currentCompany}</p>
              <p><span className="font-medium">Designation:</span> {alumnus.profile?.professional?.designation}</p>
              <p><span className="font-medium">Experience:</span> {alumnus.profile?.professional?.experience}</p>
            </div>
          </div>

          {/* Skills Section */}
          {alumnus.profile?.professional?.skills?.length > 0 && (
            <div className="col-span-full bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {alumnus.profile.professional.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(alumnus.profile?.social?.linkedin || alumnus.profile?.social?.github) && (
            <div className="col-span-full bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Links</h3>
              <div className="flex space-x-4">
                {alumnus.profile?.social?.linkedin && (
                  <a 
                    href={alumnus.profile.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .4C4.698.4.4 4.698.4 10s4.298 9.6 9.6 9.6 9.6-4.298 9.6-9.6S15.302.4 10 .4zM7.65 13.979H5.706V7.723H7.65v6.256zm-.984-7.024c-.614 0-1.011-.435-1.011-.973 0-.549.409-.971 1.036-.971s1.011.422 1.023.971c0 .538-.396.973-1.048.973zm8.084 7.024h-1.944v-3.467c0-.807-.282-1.355-.985-1.355-.537 0-.856.371-.997.728-.052.127-.065.307-.065.486v3.607H8.814v-4.26c0" />
                    </svg>
                    LinkedIn Profile
                  </a>
                )}
                {alumnus.profile?.social?.github && (
                  <a
                    href={alumnus.profile.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
                    </svg>
                    GitHub Profile
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileModal;

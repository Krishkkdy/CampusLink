import React, { useState, useEffect } from 'react';

const StudentProfileModal = ({ studentId, onClose }) => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch student profile');
      }
      
      const data = await response.json();
      setStudentProfile(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      setError('Failed to load student profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Student Profile
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : studentProfile ? (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                {studentProfile.profilePicture ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/${studentProfile.profilePicture}`} 
                    alt={studentProfile.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-100" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {studentProfile.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{studentProfile.name}</h3>
                  <p className="text-gray-600">{studentProfile.email}</p>
                  {studentProfile.phone && (
                    <p className="text-gray-600">{studentProfile.phone}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Education</h4>
                {studentProfile.education && studentProfile.education.length > 0 ? (
                  <div className="space-y-2">
                    {studentProfile.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{edu.institution}</p>
                        <p className="text-sm text-gray-600">{edu.degree} • {edu.year}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No education information available</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Skills</h4>
                {studentProfile.skills && studentProfile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {studentProfile.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills listed</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Experience</h4>
                {studentProfile.experience && studentProfile.experience.length > 0 ? (
                  <div className="space-y-3">
                    {studentProfile.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{exp.role} at {exp.company}</p>
                        <p className="text-sm text-gray-600">{exp.duration}</p>
                        <p className="text-sm mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No experience listed</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Projects</h4>
                {studentProfile.projects && studentProfile.projects.length > 0 ? (
                  <div className="space-y-3">
                    {studentProfile.projects.map((project, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm mt-1">{project.description}</p>
                        <p className="text-sm text-blue-600 mt-1">Technologies: {project.technologies}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No projects listed</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Student profile not found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal; 
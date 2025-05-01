import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ViewResumeFeedback = () => {
  const { user } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, [user]);

  const fetchResumes = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/resumes/student/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resume feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Resume Reviews & Feedback
          </span>
        </h1>
        <p className="mt-2 text-gray-600">Track your resume submissions and view feedback from alumni</p>
      </div>

      <div className="space-y-6">
        {resumes.map(resume => (
          <div key={resume._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {/* Resume Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Resume Submission</h2>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  resume.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                  resume.status === 'reviewed' ? 'bg-green-100 text-green-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {resume.status === 'pending' && '⏳ '}
                  {resume.status === 'reviewed' && '✓ '}
                  {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Resume Content */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resume Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resume Details
                </h3>
                
                {/* Education Section */}
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Education
                  </h4>
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-medium text-blue-600">{edu.institution}</p>
                      <p className="text-sm text-gray-600">{edu.degree} - {edu.year}</p>
                    </div>
                  ))}
                </div>

                {/* Experience Section */}
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Experience
                  </h4>
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <p className="font-medium text-blue-600">{exp.role} at {exp.company}</p>
                      <p className="text-sm text-gray-600">{exp.duration}</p>
                      <p className="text-sm mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>

                {/* Resume File */}
                {resume.fileUrl && (
                  <a 
                    href={resume.fileUrl}
                    download
                    className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Resume
                  </a>
                )}
              </div>

              {/* Feedback Section */}
              <div className="border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 pt-6 lg:pt-0">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Alumni Feedback
                </h3>
                {resume.feedback.length > 0 ? (
                  <div className="space-y-4">
                    {resume.feedback.map((fb, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-4 mb-2">
                          <img
                            src={fb.alumni.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${fb.alumni.name}`}
                            alt={fb.alumni.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{fb.alumni.name}</p>
                                <p className="text-sm text-gray-600">
                                  {fb.alumni.profile?.professional?.designation}
                                  {fb.alumni.profile?.professional?.currentCompany && 
                                    ` at ${fb.alumni.profile.professional.currentCompany}`}
                                </p>
                              </div>
                              <span className="text-sm text-gray-600">
                                {new Date(fb.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mt-2">{fb.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No feedback received yet.</p>
                    {resume.status === 'pending' && (
                      <p className="text-sm text-gray-500 mt-2">Your resume is under review.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {resumes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg mb-2">No Resume Submissions Yet</p>
            <p className="text-gray-500">Submit your resume to get feedback from alumni</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewResumeFeedback;

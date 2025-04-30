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
    return <div className="p-6 text-center">Loading resumes...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Resume Reviews</h1>

      <div className="space-y-8">
        {resumes.map(resume => (
          <div key={resume._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Resume Header */}
            <div className="bg-blue-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Resume Submission</h2>
                  <p className="text-sm text-gray-600">
                    Submitted on: {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  resume.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  resume.status === 'reviewed' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Resume Content */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resume Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Resume Details</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Education</h4>
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-medium text-blue-600">{edu.institution}</p>
                      <p className="text-sm text-gray-600">{edu.degree} - {edu.year}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Experience</h4>
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <p className="font-medium text-blue-600">{exp.role} at {exp.company}</p>
                      <p className="text-sm text-gray-600">{exp.duration}</p>
                      <p className="text-sm mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>

                {resume.fileUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Resume File</h4>
                    <a 
                      href={resume.fileUrl}
                      download
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Resume
                    </a>
                  </div>
                )}
              </div>

              {/* Feedback Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Feedback from Alumni</h3>
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
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">You haven't submitted any resumes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewResumeFeedback;

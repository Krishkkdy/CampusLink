import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ResumeReview = () => {
  const { user } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resumes/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }

      const data = await response.json();
      setResumes(data);

      const initialFeedbacks = {};
      data.forEach(resume => {
        initialFeedbacks[resume._id] = '';
      });
      setFeedbacks(initialFeedbacks);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      alert('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (resumeId) => {
    if (!feedbacks[resumeId]?.trim()) {
      alert('Please enter feedback before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resumes/${resumeId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          comment: feedbacks[resumeId],
          alumniId: user._id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      setFeedbacks(prev => ({
        ...prev,
        [resumeId]: ''
      }));

      setResumes(prev => prev.filter(resume => resume._id !== resumeId));
      
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackChange = (resumeId, value) => {
    setFeedbacks(prev => ({
      ...prev,
      [resumeId]: value
    }));
  };

  if (loading) {
    return <div className="p-6 text-center">Loading resumes...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Resume Reviews
          </span>
        </h1>

        <div className="space-y-6">
          {resumes.map(resume => (
            <div key={resume._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={resume.student?.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${resume.student?.name}`}
                      alt={resume.student?.name}
                      className="w-16 h-16 rounded-full ring-2 ring-blue-100"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{resume.student?.name}</h2>
                      <p className="text-sm text-gray-600">
                        {resume.student?.profile?.basicInfo?.department || 'Department not specified'} | 
                        Enrollment: {resume.student?.profile?.basicInfo?.enrollmentNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Education</h3>
                    <div className="space-y-3">
                      {resume.education?.map((edu, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="font-medium">{edu.institution}</p>
                          <p className="text-sm text-gray-600">{edu.degree} - {edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-3">Experience</h3>
                    <div className="space-y-3">
                      {resume.experience?.map((exp, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="font-medium">{exp.role} at {exp.company}</p>
                          <p className="text-sm text-gray-600">{exp.duration}</p>
                          <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills?.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {resume.fileUrl && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">Resume File</h3>
                      <a 
                        href={resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-purple-700 hover:text-purple-800"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Full Resume
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Provide Feedback</h3>
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows="4"
                    placeholder="Enter your feedback here..."
                    value={feedbacks[resume._id] || ''}
                    onChange={(e) => handleFeedbackChange(resume._id, e.target.value)}
                    disabled={submitting}
                  />
                  <button
                    onClick={() => handleSubmitFeedback(resume._id)}
                    disabled={submitting || !feedbacks[resume._id]?.trim()}
                    className={`mt-3 px-6 py-2 rounded-lg ${
                      submitting || !feedbacks[resume._id]?.trim()
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-lg'
                    } text-white transition-all duration-200`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {resumes.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No resumes pending review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeReview;

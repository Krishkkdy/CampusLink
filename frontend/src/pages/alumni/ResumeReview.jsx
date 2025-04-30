import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ResumeReview = () => {
  const { user } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({}); // Store feedback for each resume
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
      
      // Initialize feedback state for each resume
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

      // Clear feedback for this resume
      setFeedbacks(prev => ({
        ...prev,
        [resumeId]: ''
      }));

      // Remove this resume from the list
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Review Student Resumes</h1>

      <div className="space-y-8">
        {resumes.map(resume => (
          <div key={resume._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Resume Header */}
            <div className="bg-blue-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{resume.student?.name || 'Unknown Student'}</h2>
                  <p className="text-sm text-gray-600">
                    {resume.student?.profile?.basicInfo?.department || 'Department not specified'} | Enrollment: {resume.student?.profile?.basicInfo?.enrollmentNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  Pending Review
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Education Section */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Education</h3>
                {resume.education?.map((edu, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="font-medium">{edu.institution}</p>
                    <p className="text-sm text-gray-600">{edu.degree} - {edu.year}</p>
                  </div>
                ))}
              </div>

              {/* Experience Section */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Experience</h3>
                {resume.experience?.map((exp, idx) => (
                  <div key={idx} className="mb-3">
                    <p className="font-medium">{exp.role} at {exp.company}</p>
                    <p className="text-sm text-gray-600">{exp.duration}</p>
                    <p className="text-sm mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>

              {/* Resume File */}
              {resume.fileUrl && (
                <div className="mb-6">
                  <a 
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Full Resume
                  </a>
                </div>
              )}

              {/* Feedback Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Provide Feedback</h3>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter your feedback here..."
                  value={feedbacks[resume._id] || ''}
                  onChange={(e) => handleFeedbackChange(resume._id, e.target.value)}
                  disabled={submitting}
                />
                <button
                  onClick={() => handleSubmitFeedback(resume._id)}
                  disabled={submitting || !feedbacks[resume._id]?.trim()}
                  className={`mt-3 px-4 py-2 rounded ${
                    submitting || !feedbacks[resume._id]?.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {resumes.length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No resumes pending review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeReview;

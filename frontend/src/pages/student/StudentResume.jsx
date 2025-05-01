import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

const StudentResume = () => {
  const { user } = useContext(AuthContext);
  const [resume, setResume] = useState({
    education: [{ institution: '', degree: '', year: '' }],
    experience: [{ company: '', role: '', duration: '', description: '' }],
    skills: [],
    projects: [{ name: '', description: '', technologies: '' }],
    certifications: [],
    file: null,
    status: 'draft', // draft, pending, reviewed
    feedback: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...resume.education];
    newEducation[index][field] = value;
    setResume({...resume, education: newEducation});
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...resume.experience];
    newExperience[index][field] = value;
    setResume({...resume, experience: newExperience});
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...resume.projects];
    newProjects[index][field] = value;
    setResume({...resume, projects: newProjects});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('resumeData', JSON.stringify(resume));
    if (resume.file) {
      formData.append('file', resume.file);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resumes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Resume submitted successfully for review');
      }
    } catch (error) {
      console.error('Error submitting resume:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Resume Builder
          </span>
        </h1>
        <p className="mt-2 text-gray-600">Create and submit your resume for professional review</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Education Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Education
          </h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Institution</label>
                <input
                  type="text"
                  placeholder="Enter institution name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={edu.institution}
                  onChange={e => handleEducationChange(index, 'institution', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Degree</label>
                <input
                  type="text"
                  placeholder="Enter degree"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={edu.degree}
                  onChange={e => handleEducationChange(index, 'degree', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Year</label>
                <input
                  type="text"
                  placeholder="Year of completion"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={edu.year}
                  onChange={e => handleEducationChange(index, 'year', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button 
            type="button"
            onClick={() => setResume(prev => ({
              ...prev,
              education: [...prev.education, { institution: '', degree: '', year: '' }]
            }))}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Education
          </button>
        </section>

        {/* Experience Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Experience
          </h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={exp.company}
                  onChange={e => handleExperienceChange(index, 'company', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Role"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={exp.role}
                  onChange={e => handleExperienceChange(index, 'role', e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Duration"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={exp.duration}
                onChange={e => handleExperienceChange(index, 'duration', e.target.value)}
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={exp.description}
                onChange={e => handleExperienceChange(index, 'description', e.target.value)}
                rows={3}
              />
            </div>
          ))}
          <button 
            type="button"
            onClick={() => setResume(prev => ({
              ...prev,
              experience: [...prev.experience, { company: '', role: '', duration: '', description: '' }]
            }))}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Experience
          </button>
        </section>

        {/* Skills Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Skills
          </h2>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Technical Skills</label>
            <textarea
              placeholder="Enter skills (comma separated)"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={resume.skills.join(', ')}
              onChange={e => setResume({
                ...resume,
                skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
              })}
              rows={3}
            />
          </div>
        </section>

        {/* Projects Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Projects
          </h2>
          {resume.projects.map((project, index) => (
            <div key={index} className="space-y-4 mb-4">
              <input
                type="text"
                placeholder="Project Name"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={project.name}
                onChange={e => handleProjectChange(index, 'name', e.target.value)}
              />
              <textarea
                placeholder="Project Description"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={project.description}
                onChange={e => handleProjectChange(index, 'description', e.target.value)}
                rows={3}
              />
              <input
                type="text"
                placeholder="Technologies Used"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={project.technologies}
                onChange={e => handleProjectChange(index, 'technologies', e.target.value)}
              />
            </div>
          ))}
          <button 
            type="button"
            onClick={() => setResume(prev => ({
              ...prev,
              projects: [...prev.projects, { name: '', description: '', technologies: '' }]
            }))}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Project
          </button>
        </section>

        {/* File Upload Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Resume File
          </h2>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={(e) => setResume(prev => ({ ...prev, file: e.target.files[0] }))}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-900 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
};

export default StudentResume;

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
      <h1 className="text-2xl font-bold mb-6">Resume Review</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Education Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Institution"
                className="p-2 border rounded"
                value={edu.institution}
                onChange={e => handleEducationChange(index, 'institution', e.target.value)}
              />
              <input
                type="text"
                placeholder="Degree"
                className="p-2 border rounded"
                value={edu.degree}
                onChange={e => handleEducationChange(index, 'degree', e.target.value)}
              />
              <input
                type="text"
                placeholder="Year"
                className="p-2 border rounded"
                value={edu.year}
                onChange={e => handleEducationChange(index, 'year', e.target.value)}
              />
            </div>
          ))}
          <button 
            type="button"
            onClick={() => setResume(prev => ({
              ...prev,
              education: [...prev.education, { institution: '', degree: '', year: '' }]
            }))}
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Education
          </button>
        </section>

        {/* Experience Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Experience</h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company"
                  className="p-2 border rounded"
                  value={exp.company}
                  onChange={e => handleExperienceChange(index, 'company', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Role"
                  className="p-2 border rounded"
                  value={exp.role}
                  onChange={e => handleExperienceChange(index, 'role', e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Duration"
                className="p-2 border rounded w-full"
                value={exp.duration}
                onChange={e => handleExperienceChange(index, 'duration', e.target.value)}
              />
              <textarea
                placeholder="Description"
                className="p-2 border rounded w-full"
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
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Experience
          </button>
        </section>

        {/* Skills Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <textarea
            placeholder="Enter skills (comma separated)"
            className="p-2 border rounded w-full"
            value={resume.skills.join(', ')}
            onChange={e => setResume({
              ...resume,
              skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
            })}
            rows={3}
          />
        </section>

        {/* Projects Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          {resume.projects.map((project, index) => (
            <div key={index} className="space-y-4 mb-4">
              <input
                type="text"
                placeholder="Project Name"
                className="p-2 border rounded w-full"
                value={project.name}
                onChange={e => handleProjectChange(index, 'name', e.target.value)}
              />
              <textarea
                placeholder="Project Description"
                className="p-2 border rounded w-full"
                value={project.description}
                onChange={e => handleProjectChange(index, 'description', e.target.value)}
                rows={3}
              />
              <input
                type="text"
                placeholder="Technologies Used"
                className="p-2 border rounded w-full"
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
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Project
          </button>
        </section>

        {/* File Upload Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Resume File</h2>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(prev => ({ ...prev, file: e.target.files[0] }))}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-2">Upload your resume in PDF, DOC, or DOCX format</p>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
};

export default StudentResume;

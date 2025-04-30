import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ViewStudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    basicInfo: {
      name: '',
      email: '',
      phone: '',
      avatar: '',
      department: '',
      enrollmentNumber: '',
      semester: ''
    },
    academic: {
      batch: '',
      cgpa: '',
      skills: [],
      achievements: [],
      projects: []
    },
    social: {
      linkedin: '',
      github: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${studentId}/profile`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();

        // Check if profile exists in response
        if (data && data.profile) {
          setProfile({
            basicInfo: {
              name: data.name || '',
              email: data.email || '',
              phone: data.profile.basicInfo?.phone || '',
              avatar: data.profile.basicInfo?.avatar || '',
              department: data.profile.basicInfo?.department || '',
              enrollmentNumber: data.profile.basicInfo?.enrollmentNumber || '',
              semester: data.profile.basicInfo?.semester || ''
            },
            academic: {
              batch: data.profile.academic?.batch || '',
              cgpa: data.profile.academic?.cgpa || '',
              skills: Array.isArray(data.profile.academic?.skills) ? data.profile.academic.skills : [],
              achievements: Array.isArray(data.profile.academic?.achievements) ? data.profile.academic.achievements : [],
              projects: Array.isArray(data.profile.academic?.projects) ? data.profile.academic.projects : []
            },
            social: {
              linkedin: data.profile.social?.linkedin || '',
              github: data.profile.social?.github || ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchProfile();
    }
  }, [studentId]);

  if (loading) {
    return <div className="page-container"><p>Loading student profile...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-center space-x-4">
            <img
              src={profile.basicInfo.avatar || `https://ui-avatars.com/api/?name=${profile.basicInfo.name}`}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white"
            />
            <div>
              <h1 className="text-2xl font-bold">{profile.basicInfo.name}</h1>
              <p>Student at {profile.basicInfo.department}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Basic Information */}
          <section className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(profile.basicInfo)
                .filter(([key]) => key !== 'avatar') // Skip avatar as it's already shown
                .map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <p className="mt-1 text-gray-900">{value || 'Not provided'}</p>
                  </div>
                ))}
            </div>
          </section>

          {/* Academic Information */}
          <section className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold border-b pb-2">Academic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(profile.academic).map(([key, value]) => (
                <div key={key} className={key === 'projects' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  {Array.isArray(value) ? (
                    <ul className="mt-1 list-disc list-inside text-gray-900">
                      {value.length > 0 ? (
                        value.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">None provided</li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-1 text-gray-900">{value || 'Not provided'}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Social Links</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(profile.social).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  {value ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 text-gray-500 italic">Not provided</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentProfile; 
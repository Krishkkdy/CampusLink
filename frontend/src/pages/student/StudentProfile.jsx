import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

const StudentProfile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
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
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${user._id}/profile`,
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
        console.log('Fetched profile data:', data);

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
      }
    };

    if (user?._id) {
      fetchProfile();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user._id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ profile }),
      });
      
      if (res.ok) {
        setIsEditing(false);
        // Refresh the profile data after successful update
        const data = await res.json();
        setProfile(prev => ({
          ...prev,
          ...data.profile
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
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
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(profile.basicInfo).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    {isEditing ? (
                      <input
                        type={key === 'semester' ? 'number' : 'text'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        value={value}
                        onChange={(e) => setProfile({
                          ...profile,
                          basicInfo: {...profile.basicInfo, [key]: e.target.value}
                        })}
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Academic Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Academic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(profile.academic).map(([key, value]) => (
                  <div key={key} className={key === 'projects' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    {isEditing ? (
                      Array.isArray(value) ? (
                        <textarea
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                          value={value.join('\n')}
                          onChange={(e) => setProfile({
                            ...profile,
                            academic: {
                              ...profile.academic,
                              [key]: e.target.value.split('\n').filter(item => item.trim())
                            }
                          })}
                          rows={4}
                          placeholder={`Enter ${key} (one per line)`}
                        />
                      ) : (
                        <input
                          type={key === 'cgpa' ? 'number' : 'text'}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                          value={value}
                          onChange={(e) => setProfile({
                            ...profile,
                            academic: {...profile.academic, [key]: e.target.value}
                          })}
                          step={key === 'cgpa' ? '0.01' : undefined}
                        />
                      )
                    ) : (
                      Array.isArray(value) ? (
                        <ul className="mt-1 list-disc list-inside text-gray-900">
                          {value.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-gray-900">{value || 'Not provided'}</p>
                      )
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
                    {isEditing ? (
                      <input
                        type="url"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        value={value}
                        onChange={(e) => setProfile({
                          ...profile,
                          social: {...profile.social, [key]: e.target.value}
                        })}
                        placeholder={`Enter ${key} URL`}
                      />
                    ) : value ? (
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

            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-6">
                <img
                  src={profile.basicInfo.avatar || `https://ui-avatars.com/api/?name=${profile.basicInfo.name}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold">{profile.basicInfo.name}</h1>
                  <p className="text-green-100 mt-1">
                    {profile.basicInfo.department} • Semester {profile.basicInfo.semester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isEditing 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">
                  Basic Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(profile.basicInfo)
                    .filter(([key]) => key !== 'avatar')
                    .map(([key, value]) => (
                      <div key={key} className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            value={value}
                            onChange={(e) => setProfile({
                              ...profile,
                              basicInfo: {...profile.basicInfo, [key]: e.target.value}
                            })}
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{value || 'Not provided'}</p>
                        )}
                      </div>
                    ))}
                </div>
              </section>

              {/* Academic Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">
                  Academic Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(profile.academic).map(([key, value]) => (
                    <div key={key} className={key === 'projects' || key === 'skills' ? 'col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {isEditing ? (
                        Array.isArray(value) ? (
                          <textarea
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                          <div className="mt-1">
                            {value.length > 0 ? (
                              key === 'skills' ? (
                                <div className="flex flex-wrap gap-2">
                                  {value.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <ul className="list-disc pl-4 space-y-1">
                                  {value.map((item, idx) => (
                                    <li key={idx} className="text-gray-700">{item}</li>
                                  ))}
                                </ul>
                              )
                            ) : (
                              <p className="text-gray-500 italic">No {key} listed</p>
                            )}
                          </div>
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
                <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">
                  Social Links
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(profile.social).map(([key, value]) => (
                    <div key={key} className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                          className="mt-1 text-blue-600 hover:underline block"
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
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

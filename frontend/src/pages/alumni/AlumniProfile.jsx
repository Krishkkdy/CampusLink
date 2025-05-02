import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

const AlumniProfile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    basicInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      avatar: '',
      department: '',
    },
    professional: {
      currentCompany: '',
      designation: '',
      experience: '',
      skills: [],
      achievements: [],
    },
    academic: {
      graduationYear: '',
      degree: '',
      specialization: '',
      qualifications: [],
      subjects: [],
    },
    social: {
      linkedin: '',
      github: '',
      website: '',
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
        setProfile(prev => ({
          ...prev,
          ...data.profile,
          basicInfo: {
            ...prev.basicInfo,
            ...data.profile?.basicInfo,
            name: data.name,
            email: data.email
          },
          professional: {
            ...prev.professional,
            ...data.profile?.professional,
            skills: data.profile?.professional?.skills || [],
            achievements: data.profile?.professional?.achievements || [],
          },
          academic: {
            ...prev.academic,
            ...data.profile?.academic,
            qualifications: data.profile?.academic?.qualifications || [],
            subjects: data.profile?.academic?.subjects || [],
          },
          social: {
            ...prev.social,
            ...data.profile?.social,
          }
        }));
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
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <img
                  src={profile.basicInfo.avatar || `https://ui-avatars.com/api/?name=${profile.basicInfo.name}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{profile.basicInfo.name}</h1>
                  <p className="text-blue-100 mt-1">
                    {profile.professional.designation} • {profile.professional.currentCompany}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-all duration-200 ${
                  isEditing 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold border-b pb-2 text-gray-800">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

              {/* Professional Information */}
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold border-b pb-2 text-gray-800">
                  Professional Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(profile.professional).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                      {isEditing ? (
                        Array.isArray(value) ? (
                          <textarea
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={value.join('\n')}
                            onChange={(e) => setProfile({
                              ...profile,
                              professional: {
                                ...profile.professional,
                                [key]: e.target.value.split('\n').filter(item => item.trim())
                              }
                            })}
                            rows={4}
                            placeholder={`Enter ${key} (one per line)`}
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={value}
                            onChange={(e) => setProfile({
                              ...profile,
                              professional: {...profile.professional, [key]: e.target.value}
                            })}
                          />
                        )
                      ) : (
                        Array.isArray(value) ? (
                          <div className="mt-1">
                            {value.length > 0 ? (
                              key === 'skills' ? (
                                <div className="flex flex-wrap gap-2">
                                  {value.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
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

              {/* Academic Information */}
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold border-b pb-2 text-gray-800">
                  Academic Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(profile.academic)
                    .map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        {isEditing ? (
                          Array.isArray(value) ? (
                            <textarea
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              value={value}
                              onChange={(e) => setProfile({
                                ...profile,
                                academic: {...profile.academic, [key]: e.target.value}
                              })}
                            />
                          )
                        ) : (
                          Array.isArray(value) ? (
                            <div className="mt-1">
                              {value.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-1">
                                  {value.map((item, idx) => (
                                    <li key={idx} className="text-gray-700">{item}</li>
                                  ))}
                                </ul>
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
                <h2 className="text-lg sm:text-xl font-semibold border-b pb-2 text-gray-800">
                  Social Links
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {Object.entries(profile.social).map(([key, value]) => (
                    <div key={key} className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
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

export default AlumniProfile;

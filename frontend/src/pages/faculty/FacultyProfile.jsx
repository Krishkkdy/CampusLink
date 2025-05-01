import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

const FacultyProfile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    basicInfo: {
      phone: '',
      avatar: '',
      department: '',
      designation: '',
      employeeId: ''
    },
    academic: {
      specialization: '',
      qualifications: [],
      subjects: [],
      experience: ''
    },
    research: {
      publications: [],
      projects: [],
      areas: []
    },
    contact: {
      officeLocation: '',
      officeHours: '',
      website: ''
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
          basicInfo: {
            ...prev.basicInfo,
            ...data.profile?.basicInfo,
          },
          academic: {
            ...prev.academic,
            ...data.profile?.academic,
          },
          research: {
            ...prev.research,
            ...data.profile?.research,
          },
          contact: {
            ...prev.contact,
            ...data.profile?.contact,
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
                  src={profile.basicInfo.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <p className="text-blue-100 mt-1">
                    {profile.basicInfo.designation} • {profile.basicInfo.department}
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
                  {Object.entries(profile.basicInfo).map(([key, value]) => (
                    <div key={key} className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {isEditing ? (
                        key === 'avatar' ? (
                          <input
                            type="url"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={value}
                            onChange={(e) => setProfile({
                              ...profile,
                              basicInfo: {...profile.basicInfo, [key]: e.target.value}
                            })}
                            placeholder="Enter image URL"
                          />
                        ) : (
                          <input
                            type={key === 'phone' ? 'tel' : 'text'}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={value}
                            onChange={(e) => setProfile({
                              ...profile,
                              basicInfo: {...profile.basicInfo, [key]: e.target.value}
                            })}
                          />
                        )
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
                    <div key={key} className={key === 'experience' ? 'col-span-2' : 'col-span-1'}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {isEditing ? (
                        Array.isArray(value) ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={value.join(', ')}
                            onChange={(e) => setProfile({
                              ...profile,
                              academic: {
                                ...profile.academic,
                                [key]: e.target.value.split(',').map(item => item.trim())
                              }
                            })}
                            placeholder={`Enter ${key} separated by commas`}
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
                        <p className="mt-1 text-gray-900">
                          {Array.isArray(value) ? value.join(', ') : value || 'Not provided'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Research Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">
                  Research & Publications
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {Object.entries(profile.research).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {isEditing ? (
                        <textarea
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={value.join('\n')}
                          onChange={(e) => setProfile({
                            ...profile,
                            research: {
                              ...profile.research,
                              [key]: e.target.value.split('\n').filter(item => item.trim())
                            }
                          })}
                          rows={4}
                          placeholder={`Enter ${key} (one per line)`}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">
                          {value.length > 0 ? (
                            <ul className="list-disc pl-4">
                              {value.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic">No {key} listed</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">
                  Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(profile.contact).map(([key, value]) => (
                    <div key={key} className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.split(/(?=[A-Z])/).join(' ').charAt(0).toUpperCase() + key.split(/(?=[A-Z])/).join(' ').slice(1)}
                      </label>
                      {isEditing ? (
                        key === 'website' ? (
                          <input
                            type="url"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={value}
                            onChange={(e) => setProfile({
                              ...profile,
                              contact: {...profile.contact, [key]: e.target.value}
                            })}
                            placeholder="Enter website URL"
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={value}
                            onChange={(e) => setProfile({
                              ...profile,
                              contact: {...profile.contact, [key]: e.target.value}
                            })}
                          />
                        )
                      ) : (
                        key === 'website' ? (
                          value ? (
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
                          )
                        ) : (
                          <p className="mt-1 text-gray-900">{value || 'Not provided'}</p>
                        )
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

export default FacultyProfile;

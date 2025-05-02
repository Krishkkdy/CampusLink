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

  const handleInputChange = (section, key, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleAddSubject = () => {
    setProfile(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        subjects: [...prev.academic.subjects, '']
      }
    }));
  };

  const handleRemoveSubject = (index) => {
    setProfile(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        subjects: prev.academic.subjects.filter((_, i) => i !== index)
      }
    }));
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
                  src={profile.basicInfo.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{user?.name}</h1>
                  <p className="text-blue-100 mt-1">
                    {profile.basicInfo.designation} • {profile.basicInfo.department}
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
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleInputChange('basicInfo', key, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-600 py-2">{value}</p>
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.academic.specialization}
                        onChange={(e) => handleInputChange('academic', 'specialization', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{profile.academic.specialization}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subjects
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profile.academic.subjects.map((subject, index) => (
                        <div key={index} className={`inline-flex items-center ${
                          isEditing ? 'bg-blue-50 pl-3 pr-2 py-1' : 'bg-blue-100 px-3 py-1'
                        } rounded-full`}>
                          <span className="text-blue-800 text-sm">{subject}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(index)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <span className="sr-only">Remove</span>
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleAddSubject}
                          className="inline-flex items-center px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-gray-600 hover:border-blue-500 hover:text-blue-500"
                        >
                          + Add Subject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold border-b pb-2 text-gray-800">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {Object.entries(profile.contact).map(([key, value]) => (
                    <div key={key} className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleInputChange('contact', key, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-600 py-2">{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Form Actions */}
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

export default FacultyProfile;

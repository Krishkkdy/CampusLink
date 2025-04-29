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
    <div className="max-w-4xl mx-auto p-6">
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
              <p>{profile.professional.designation} at {profile.professional.currentCompany}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

            {/* Professional Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Professional Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Company & Designation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Company</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.professional.currentCompany}
                      onChange={(e) => setProfile({
                        ...profile,
                        professional: {...profile.professional, currentCompany: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile.professional.currentCompany || <span className="text-gray-500 italic">Not provided</span>}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"  
                      value={profile.professional.designation}
                      onChange={(e) => setProfile({
                        ...profile,
                        professional: {...profile.professional, designation: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile.professional.designation || <span className="text-gray-500 italic">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Experience */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.professional.experience}
                      onChange={(e) => setProfile({
                        ...profile,
                        professional: {...profile.professional, experience: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile.professional.experience || <span className="text-gray-500 italic">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Skills</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.professional.skills.join(', ')}
                      onChange={(e) => setProfile({
                        ...profile,
                        professional: {
                          ...profile.professional,
                          skills: e.target.value.split(',').map(item => item.trim())
                        }
                      })}
                      placeholder="Enter skills separated by commas"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile.professional.skills.length > 0 ? profile.professional.skills.join(', ') : 
                        <span className="text-gray-500 italic">No skills listed</span>}
                    </p>
                  )}
                </div>

                {/* Achievements */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Achievements</label>
                  {isEditing ? (
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.professional.achievements.join('\n')}
                      onChange={(e) => setProfile({
                        ...profile,
                        professional: {
                          ...profile.professional,
                          achievements: e.target.value.split('\n').filter(item => item.trim())
                        }
                      })}
                      rows={4}
                      placeholder="Enter achievements (one per line)"
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {profile.professional.achievements.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {profile.professional.achievements.map((achievement, idx) => (
                            <li key={idx}>{achievement}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500 italic">No achievements listed</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Academic Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Academic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Single value fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.academic.graduationYear}
                      onChange={(e) => setProfile({
                        ...profile,
                        academic: { ...profile.academic, graduationYear: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profile.academic.graduationYear || <span className="text-gray-500 italic">Not provided</span>}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Degree</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.academic.degree}
                      onChange={(e) => setProfile({
                        ...profile,
                        academic: { ...profile.academic, degree: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profile.academic.degree || <span className="text-gray-500 italic">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.academic.specialization}
                      onChange={(e) => setProfile({
                        ...profile,
                        academic: { ...profile.academic, specialization: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profile.academic.specialization || <span className="text-gray-500 italic">Not provided</span>}</p>
                  )}
                </div>

                {/* Array fields */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.academic.qualifications.join(', ')}
                      onChange={(e) => setProfile({
                        ...profile,
                        academic: { 
                          ...profile.academic, 
                          qualifications: e.target.value.split(',').map(item => item.trim())
                        }
                      })}
                      placeholder="Enter qualifications separated by commas"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile.academic.qualifications.length > 0 ? 
                        profile.academic.qualifications.join(', ') : 
                        <span className="text-gray-500 italic">Not provided</span>}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Subjects</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={profile.academic.subjects.join(', ')}
                      onChange={(e) => setProfile({
                        ...profile,
                        academic: { 
                          ...profile.academic, 
                          subjects: e.target.value.split(',').map(item => item.trim())
                        }
                      })}
                      placeholder="Enter subjects separated by commas"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile.academic.subjects.length > 0 ? 
                        profile.academic.subjects.join(', ') : 
                        <span className="text-gray-500 italic">Not provided</span>}
                    </p>
                  )}
                </div>
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={value}
                        onChange={(e) => setProfile({
                          ...profile,
                          social: { ...profile.social, [key]: e.target.value }
                        })}
                        placeholder={`Enter your ${key} URL`}
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

export default AlumniProfile;

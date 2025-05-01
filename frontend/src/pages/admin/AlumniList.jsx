import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/alumni`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
      });
      const data = await response.json();
      setAlumni(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to remove this alumni?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/remove-alumni/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (response.ok) {
          await fetchAlumni();
          alert('Alumni removed successfully');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to remove alumni');
      }
    }
  };

  const filteredAlumni = alumni.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.profile?.professional?.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.profile?.professional?.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Alumni List
            </span>
          </h1>
          <Link 
            to="/admin/add-alumni"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Add New Alumni
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, department, or company..."
              className="w-full p-4 pl-12 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="absolute left-4 top-4 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAlumni.map((alumnus) => (
            <div 
              key={alumnus._id} 
              onClick={() => setSelectedAlumnus(alumnus)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-300 cursor-pointer flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                  alt={alumnus.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{alumnus.name}</h3>
                  <p className="text-gray-600">{alumnus.email}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(alumnus._id);
                }}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Alumni Profile Modal */}
        {selectedAlumnus && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedAlumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${selectedAlumnus.name}`}
                    alt={selectedAlumnus.name}
                    className="w-24 h-24 rounded-full border-4 border-blue-100"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAlumnus.name}</h2>
                    <p className="text-gray-600">{selectedAlumnus.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAlumnus(null)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Department:</span> {selectedAlumnus.profile?.basicInfo?.department}</p>
                    <p><span className="font-medium">Location:</span> {selectedAlumnus.profile?.basicInfo?.location}</p>
                    <p><span className="font-medium">Phone:</span> {selectedAlumnus.profile?.basicInfo?.phone}</p>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Professional Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Current Company:</span> {selectedAlumnus.profile?.professional?.currentCompany}</p>
                    <p><span className="font-medium">Designation:</span> {selectedAlumnus.profile?.professional?.designation}</p>
                    <p><span className="font-medium">Experience:</span> {selectedAlumnus.profile?.professional?.experience}</p>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Academic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Graduation Year:</span> {selectedAlumnus.profile?.academic?.graduationYear}</p>
                    <p><span className="font-medium">Degree:</span> {selectedAlumnus.profile?.academic?.degree}</p>
                    <p><span className="font-medium">Specialization:</span> {selectedAlumnus.profile?.academic?.specialization}</p>
                  </div>
                </div>

                {/* Skills & Achievements */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Skills & Achievements</h3>
                  {selectedAlumnus.profile?.professional?.skills?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlumnus.profile.professional.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedAlumnus.profile?.professional?.achievements?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Achievements</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedAlumnus.profile.professional.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-gray-700">{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(selectedAlumnus.profile?.social?.linkedin || selectedAlumnus.profile?.social?.github) && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Links</h3>
                  <div className="flex space-x-4">
                    {selectedAlumnus.profile?.social?.linkedin && (
                      <a href={selectedAlumnus.profile.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                    {selectedAlumnus.profile?.social?.github && (
                      <a href={selectedAlumnus.profile.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900 flex items-center"
                      >
                        GitHub Profile
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniList;

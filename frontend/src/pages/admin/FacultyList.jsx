import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/faculty`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
      });
      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to remove this faculty member?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/remove-faculty/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (response.ok) {
          await fetchFaculty();
          alert('Faculty removed successfully');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to remove faculty');
      }
    }
  };

  const filteredFaculty = faculty.filter(f => 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Faculty List
            </span>
          </h1>
          <Link 
            to="/admin/add-faculty"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Add New Faculty
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full p-4 pl-12 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaculty.map((faculty) => (
            <div 
              key={faculty._id} 
              onClick={() => setSelectedFaculty(faculty)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-300 cursor-pointer flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={faculty.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${faculty.name}`}
                  alt={faculty.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{faculty.name}</h3>
                  <p className="text-gray-600">{faculty.email}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(faculty._id);
                }}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Faculty Profile Modal */}
        {selectedFaculty && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedFaculty.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${selectedFaculty.name}`}
                    alt={selectedFaculty.name}
                    className="w-24 h-24 rounded-full border-4 border-blue-100"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedFaculty.name}</h2>
                    <p className="text-gray-600">{selectedFaculty.email}</p>
                    <p className="text-gray-600">{selectedFaculty.profile?.basicInfo?.designation}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFaculty(null)}
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
                    <p><span className="font-medium">Employee ID:</span> {selectedFaculty.profile?.basicInfo?.employeeId}</p>
                    <p><span className="font-medium">Department:</span> {selectedFaculty.profile?.basicInfo?.department}</p>
                    <p><span className="font-medium">Phone:</span> {selectedFaculty.profile?.basicInfo?.phone}</p>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Academic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Specialization:</span> {selectedFaculty.profile?.academic?.specialization}</p>
                    <p><span className="font-medium">Experience:</span> {selectedFaculty.profile?.academic?.experience}</p>
                    <div>
                      <span className="font-medium">Qualifications:</span>
                      <ul className="list-disc list-inside mt-1">
                        {selectedFaculty.profile?.academic?.qualifications?.map((qual, idx) => (
                          <li key={idx} className="text-gray-700">{qual}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Research Information */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Research & Publications</h3>
                  <div className="space-y-4">
                    {selectedFaculty.profile?.research?.areas?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Research Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFaculty.profile.research.areas.map((area, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedFaculty.profile?.research?.publications?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Publications</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedFaculty.profile.research.publications.map((pub, idx) => (
                            <li key={idx} className="text-gray-700">{pub}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Office Location:</span> {selectedFaculty.profile?.contact?.officeLocation}</p>
                    <p><span className="font-medium">Office Hours:</span> {selectedFaculty.profile?.contact?.officeHours}</p>
                    {selectedFaculty.profile?.contact?.website && (
                      <p>
                        <span className="font-medium">Website:</span>{" "}
                        <a 
                          href={selectedFaculty.profile.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedFaculty.profile.contact.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyList;

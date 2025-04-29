import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ViewAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/alumni`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch alumni');
      }

      const data = await res.json();
      setAlumni(data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      alert('Error loading alumni data');
    }
  };

  const handleBack = () => {
    navigate('/faculty');
  };

  const filteredAlumni = alumni.filter(alumnus => 
    alumnus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alumnus.profile?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">View Alumni</h2>
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>
      <input
        type="text"
        placeholder="Search by name or department..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlumni.map((alumnus) => (
            <div key={alumnus._id} className="border p-4 rounded shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                  alt={alumnus.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-bold text-lg">{alumnus.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {alumnus.profile?.professional?.designation || 'Not specified'}
                    {alumnus.profile?.professional?.currentCompany && 
                      ` at ${alumnus.profile.professional.currentCompany}`}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {/* Academic Info */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1">Academic Information</h4>
                  <p><span className="font-medium">Department:</span> {alumnus.profile?.basicInfo?.department || 'Not specified'}</p>
                  <p><span className="font-medium">Graduation Year:</span> {alumnus.profile?.academic?.graduationYear || 'Not specified'}</p>
                  <p><span className="font-medium">Degree:</span> {alumnus.profile?.academic?.degree || 'Not specified'}</p>
                </div>

                {/* Professional Info */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1">Professional Information</h4>
                  <p><span className="font-medium">Experience:</span> {alumnus.profile?.professional?.experience || 'Not specified'}</p>
                  <p><span className="font-medium">Skills:</span> {alumnus.profile?.professional?.skills?.join(', ') || 'Not specified'}</p>
                </div>

                {/* Contact Info */}
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-1">Contact Information</h4>
                  <p><span className="font-medium">Email:</span> {alumnus.email}</p>
                  <p><span className="font-medium">Phone:</span> {alumnus.profile?.basicInfo?.phone || 'Not specified'}</p>
                  <p><span className="font-medium">Location:</span> {alumnus.profile?.basicInfo?.location || 'Not specified'}</p>
                </div>

                {/* Social Links */}
                {(alumnus.profile?.social?.linkedin || alumnus.profile?.social?.github) && (
                  <div className="flex space-x-3 mt-2">
                    {alumnus.profile?.social?.linkedin && (
                      <a 
                        href={alumnus.profile.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        LinkedIn
                      </a>
                    )}
                    {alumnus.profile?.social?.github && (
                      <a 
                        href={alumnus.profile.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No alumni found matching your search criteria.
        </div>
      )}
    </div>
  );
};

const ViewEventDetails = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{event.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{event.date}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Venue</p>
              <p className="font-semibold">{event.venue}</p>
            </div>
          </div>
          <p className="text-gray-600">{event.description}</p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Interested Alumni ({event.interestedAlumni?.length || 0})</h4>
          <div className="max-h-60 overflow-y-auto">
            {event.interestedAlumni?.map((alumnus) => (
              <div key={alumnus.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <img src={alumnus.avatar} alt={alumnus.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium">{alumnus.name}</p>
                  <p className="text-sm text-gray-600">{alumnus.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAlumni;

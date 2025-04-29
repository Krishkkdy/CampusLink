import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Alumni List</h2>
        <Link 
          to="/admin/add-alumni"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Alumni
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name, email or department..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlumni.map((alumnus) => (
          <div key={alumnus._id} className="border p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{alumnus.name}</h3>
                <p className="text-gray-600">{alumnus.email}</p>
                <p className="text-gray-600">Department: {alumnus.profile?.basicInfo?.department || 'Not specified'}</p>
                <p className="text-gray-600">Company: {alumnus.profile?.professional?.currentCompany || 'Not specified'}</p>
                <p className="text-gray-600">Designation: {alumnus.profile?.professional?.designation || 'Not specified'}</p>
                <p className="text-gray-600">Graduation Year: {alumnus.profile?.academic?.graduationYear || 'Not specified'}</p>
              </div>
              <button
                onClick={() => handleRemove(alumnus._id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumniList;

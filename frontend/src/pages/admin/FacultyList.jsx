import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.profile?.basicInfo?.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Faculty List</h2>
        <Link 
          to="/admin/add-faculty"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add New Faculty
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
        {filteredFaculty.map((f) => (
          <div key={f._id} className="border p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{f.name}</h3>
                <p className="text-gray-600">{f.email}</p>
                <p className="text-gray-600">Department: {f.profile?.basicInfo?.department || 'Not specified'}</p>
                <p className="text-gray-600">Designation: {f.profile?.basicInfo?.designation || 'Not specified'}</p>
                <p className="text-gray-600">Employee ID: {f.profile?.basicInfo?.employeeId || 'Not specified'}</p>
                <p className="text-gray-600">Specialization: {f.profile?.academic?.specialization || 'Not specified'}</p>
              </div>
              <button
                onClick={() => handleRemove(f._id)}
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

export default FacultyList;

import React, { useState, useEffect } from "react";

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: ''
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/faculty`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setFaculty([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          ...formData,
          profile: {
            basicInfo: {
              department: formData.department
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add faculty');
      }

      await fetchFaculty();
      alert('Faculty added successfully! They can now login with their email and password.');
      setFormData({
        name: '',
        email: '',
        password: '',
        department: '',
        designation: ''
      });
    } catch (error) {
      console.error('Error creating faculty:', error);
      alert(`Error adding faculty: ${error.message}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Faculty</h2>

      {/* Add Faculty Form */}
      <form onSubmit={handleSubmit} className="max-w-lg mb-8 space-y-4">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Set Password"
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Department"
            className="w-full p-2 border rounded"
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Designation"
            className="w-full p-2 border rounded"
            value={formData.designation}
            onChange={(e) => setFormData({...formData, designation: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Add Faculty
        </button>
      </form>

      {/* Faculty List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faculty.map((f) => (
          <div key={f._id} className="border p-4 rounded shadow">
            <h3 className="font-bold text-lg">{f.name}</h3>
            <p className="text-gray-600">{f.email}</p>
            <p className="text-gray-600">{f.profile?.basicInfo?.department}</p>
            <p className="text-gray-600">{f.profile?.basicInfo?.designation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageFaculty;

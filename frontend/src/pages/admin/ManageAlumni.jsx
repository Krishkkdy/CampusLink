import React, { useState, useEffect } from "react";

const ManageAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // Added password field
    profile: {
      department: '',
      graduationYear: '',
      currentCompany: '',
      designation: ''
    }
  });

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/alumni`, {
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
      setAlumni(data);
    } catch (error) {
      console.error('Error fetching alumni:', error.message);
      setAlumni([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-alumni`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add alumni');
      }

      const data = await response.json();
      fetchAlumni();
      alert('Alumni added successfully! They can now login with their email and password.');
      setFormData({
        name: '',
        email: '',
        password: '',
        profile: {
          department: '',
          graduationYear: '',
          currentCompany: '',
          designation: ''
        }
      });
    } catch (error) {
      console.error('Error creating alumni:', error.message);
      alert(`Error adding alumni: ${error.message}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Alumni</h2>
      
      {/* Add Alumni Form */}
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
            value={formData.profile.department}
            onChange={(e) => setFormData({
              ...formData,
              profile: {...formData.profile, department: e.target.value}
            })}
            required
          />
          <input
            type="text"
            placeholder="Graduation Year"
            className="w-full p-2 border rounded"
            value={formData.profile.graduationYear}
            onChange={(e) => setFormData({
              ...formData,
              profile: {...formData.profile, graduationYear: e.target.value}
            })}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Alumni
        </button>
      </form>

      {/* Alumni List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alumni.map((alumnus) => (
          <div key={alumnus._id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{alumnus.name}</h3>
            <p>{alumnus.email}</p>
            <p>{alumnus.profile?.department}</p>
            <p>{alumnus.profile?.graduationYear}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAlumni;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddFaculty = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: ''
  });

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
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          designation: formData.designation // Send designation in request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add faculty');
      }

      alert('Faculty added successfully!');
      navigate('/faculty-list'); // Changed from '/manage-faculty' to '/faculty-list'
    } catch (error) {
      console.error('Error:', error);
      alert(`Error adding faculty: ${error.message}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Faculty</h2>
        <button
          onClick={() => navigate('/faculty-list')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
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
          placeholder="Password"
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
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Add Faculty
        </button>
      </form>
    </div>
  );
};

export default AddFaculty;

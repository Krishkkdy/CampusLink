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
          designation: formData.designation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add faculty');
      }

      alert('Faculty added successfully!');
      navigate('/faculty-list');
    } catch (error) {
      console.error('Error:', error);
      alert(`Error adding faculty: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/90 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            Add New Faculty
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/faculty-list')}
              className="flex items-center px-4 py-2 text-gray-700 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              Back to List
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg hover:opacity-90"
            >
              Add Faculty
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;

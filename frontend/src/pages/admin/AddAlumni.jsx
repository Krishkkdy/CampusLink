import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

const AddAlumni = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile: {
      department: '',
      graduationYear: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-alumni`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          profile: {
            basicInfo: {
              department: formData.profile.department
            },
            academic: {
              graduationYear: formData.profile.graduationYear
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add alumni');
      }

      alert('Alumni added successfully!');
      navigate('/alumni-list');
    } catch (error) {
      console.error('Error:', error);
      alert(`Error adding alumni: ${error.message}`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formattedAlumni = jsonData.map(alumni => ({
        name: alumni.name,
        email: alumni.email,
        password: alumni.password,
        profile: {
          basicInfo: {
            department: alumni.department || ''
          },
          academic: {
            graduationYear: alumni.graduationYear || ''
          }
        }
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-alumni-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ alumni: formattedAlumni }),
      });

      if (!response.ok) {
        throw new Error('Failed to add alumni');
      }

      alert('Alumni added successfully!');
      navigate('/alumni-list');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add alumni: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Alumni</h2>
        <button
          onClick={() => navigate('/alumni-list')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to List
        </button>
      </div>

      {/* Bulk Upload Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Bulk Upload Alumni</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload an Excel file (.xlsx) with columns: name, email, password, department, graduationYear
          </p>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <a 
              href="/templates/alumni-template.xlsx" 
              download="alumni-template.xlsx"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Download Template
            </a>
          </div>
        </div>
      </div>

      {/* Single Alumni Form */}
      <form onSubmit={handleSubmit} className="max-w-lg mb-8 bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold mb-4">Add Single Alumni</h3>
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
          value={formData.profile.department}
          onChange={(e) => setFormData({
            ...formData,
            profile: { ...formData.profile, department: e.target.value }
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
            profile: {
              ...formData.profile,
              graduationYear: e.target.value
            }
          })}
          required
        />
        <button
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Alumni
        </button>
      </form>
    </div>
  );
};

export default AddAlumni;

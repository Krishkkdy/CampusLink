import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile: {
      basicInfo: {
        department: '',
        enrollmentNumber: '',
        semester: ''
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add student');
      }

      alert('Student added successfully!');
      navigate('/student-list');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add student');
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

      const formattedStudents = jsonData.map(student => ({
        name: student.name,
        email: student.email,
        password: student.password,
        profile: {
          basicInfo: {
            department: student.department || '',
            enrollmentNumber: student.enrollmentNumber || '',
            semester: student.semester || ''
          }
        }
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/add-students-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ students: formattedStudents }),
      });

      if (!response.ok) {
        throw new Error('Failed to add students');
      }

      alert('Students added successfully!');
      navigate('/student-list');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add students: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Student</h2>
        <button
          onClick={() => navigate('/student-list')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to List
        </button>
      </div>  
      {/* Bulk Upload Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Bulk Upload Students</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload an Excel file (.xlsx) with columns: name, email, password, department, enrollmentNumber, semester
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
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
            />
            <a 
              href="/templates/student-template.xlsx" 
              download="student-template.xlsx"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Download Template
            </a>
          </div>
        </div>
      </div>

      {/* Single Student Form */}
      <form onSubmit={handleSubmit} className="max-w-lg mb-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Add Single Student</h3>
        {/* ...existing form inputs... */}
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
            value={formData.profile.basicInfo.department}
            onChange={(e) => setFormData({
              ...formData,
              profile: {
                ...formData.profile,
                basicInfo: {
                  ...formData.profile.basicInfo,
                  department: e.target.value
                }
              }
            })}
            required
          />
          <input
            type="text"
            placeholder="Enrollment Number"
            className="w-full p-2 border rounded"
            value={formData.profile.basicInfo.enrollmentNumber}
            onChange={(e) => setFormData({
              ...formData,
              profile: {
                ...formData.profile,
                basicInfo: {
                  ...formData.profile.basicInfo,
                  enrollmentNumber: e.target.value
                }
              }
            })}
            required
          />
          <input
            type="number"
            placeholder="Semester"
            min="1"
            max="8"
            className="w-full p-2 border rounded"
            value={formData.profile.basicInfo.semester}
            onChange={(e) => setFormData({
              ...formData,
              profile: {
                ...formData.profile,
                basicInfo: {
                  ...formData.profile.basicInfo,
                  semester: e.target.value
                }
              }
            })}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 mt-4"
        >
          Add Student
        </button>
      </form>
    </div>
  );
};

export default AddStudent;

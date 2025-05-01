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
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

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
    <div className="min-h-screen bg-gray-50/90 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            Add New Student
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/student-list')}
              className="flex items-center px-4 py-2 text-gray-700 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              Back to List
            </button>
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow hover:opacity-90"
            >
              Bulk Upload
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
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Enrollment Number</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <input
                  type="number"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg hover:opacity-90"
            >
              Add Student
            </button>
          </form>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUploadModal && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
            <div className="relative h-full flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 transform transition-all animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                    Bulk Upload Students
                  </h3>
                  <button 
                    onClick={() => setShowBulkUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-600">
                      Upload an Excel file (.xlsx) containing student information. Make sure the file follows the required format.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileUpload}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-50"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <a 
                      href="/templates/student-template.xlsx" 
                      download
                      className="inline-flex items-center text-blue-600 font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Template
                    </a>
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

export default AddStudent;

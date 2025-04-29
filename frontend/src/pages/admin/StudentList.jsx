import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/remove-student/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (response.ok) {
          await fetchStudents();
          alert('Student removed successfully');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to remove student');
      }
    }
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profile?.basicInfo?.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student List</h2>
        <Link 
          to="/admin/add-student"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add New Student
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name, email, department or enrollment number..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div key={student._id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3">
                  <img
                    src={student.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${student.name}`}
                    alt={student.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-gray-600">{student.email}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-gray-600">
                    <span className="font-medium">Department:</span> {student.profile?.basicInfo?.department || 'Not specified'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Enrollment:</span> {student.profile?.basicInfo?.enrollmentNumber || 'Not specified'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Semester:</span> {student.profile?.basicInfo?.semester || 'Not specified'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(student._id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentList;

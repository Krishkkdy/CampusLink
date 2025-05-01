import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Student List
            </span>
          </h1>
          <Link 
            to="/admin/add-student"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Add New Student
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, department or enrollment number..."
              className="w-full p-4 pl-12 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div 
              key={student._id} 
              onClick={() => setSelectedStudent(student)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-300 cursor-pointer flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={student.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${student.name}`}
                  alt={student.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{student.name}</h3>
                  <p className="text-gray-600">{student.email}</p>
                  <p className="text-sm text-gray-500">
                    {student.profile?.basicInfo?.department} • Semester {student.profile?.basicInfo?.semester}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(student._id);
                }}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Student Profile Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedStudent.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${selectedStudent.name}`}
                    alt={selectedStudent.name}
                    className="w-24 h-24 rounded-full border-4 border-blue-100"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Department:</span> {selectedStudent.profile?.basicInfo?.department}</p>
                    <p><span className="font-medium">Enrollment Number:</span> {selectedStudent.profile?.basicInfo?.enrollmentNumber}</p>
                    <p><span className="font-medium">Semester:</span> {selectedStudent.profile?.basicInfo?.semester}</p>
                    <p><span className="font-medium">Phone:</span> {selectedStudent.profile?.basicInfo?.phone}</p>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Academic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">CGPA:</span> {selectedStudent.profile?.academic?.cgpa}</p>
                    <p><span className="font-medium">Batch:</span> {selectedStudent.profile?.academic?.batch}</p>
                    {selectedStudent.profile?.academic?.skills?.length > 0 && (
                      <div>
                        <span className="font-medium">Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedStudent.profile.academic.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Projects & Achievements */}
                {(selectedStudent.profile?.academic?.projects?.length > 0 || 
                  selectedStudent.profile?.academic?.achievements?.length > 0) && (
                  <div className="col-span-full bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">Projects & Achievements</h3>
                    <div className="space-y-4">
                      {selectedStudent.profile?.academic?.projects?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Projects</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedStudent.profile.academic.projects.map((project, idx) => (
                              <li key={idx} className="text-gray-700">{project}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedStudent.profile?.academic?.achievements?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Achievements</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedStudent.profile.academic.achievements.map((achievement, idx) => (
                              <li key={idx} className="text-gray-700">{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;

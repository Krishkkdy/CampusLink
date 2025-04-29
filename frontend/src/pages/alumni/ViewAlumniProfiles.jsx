import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import StudentProfileModal from '../../components/StudentProfileModal';
import FacultyProfileModal from '../../components/FacultyProfileModal';
import MessageModal from "../../components/MessageModal";

const ViewAlumniProfiles = () => {
  const { user } = useContext(AuthContext);
  const [alumni, setAlumni] = useState([]);
  const [faculty, setFaculty] = useState([]); // Add faculty state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null); // Add selected faculty state
  const [connections, setConnections] = useState({});
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('alumni'); // 'alumni' or 'students' or 'faculty'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [messageUser, setMessageUser] = useState(null);

  useEffect(() => {
    fetchAlumni();
    fetchFaculty(); // Add fetchFaculty call
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/alumni`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch alumni data');
      }
      const data = await response.json();
      console.log('Fetched alumni data:', data); // Add this for debugging
      setAlumni(data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add fetchFaculty function
  const fetchFaculty = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/faculty`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch faculty data');
      }
      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleConnect = async (alumniId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${alumniId}/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (response.ok) {
        // Update local state
        setConnections(prev => ({
          ...prev,
          [alumniId]: { status: 'sent' }
        }));
        alert('Connection request sent!');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    }
  };

  const handleConnectionResponse = async (userId, status) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${user._id}/connections/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          [userId]: { status }
        }));
        setPendingRequests(prev => prev.filter(req => req._id !== userId));
      }
    } catch (error) {
      console.error('Error updating connection:', error);
      alert('Failed to update connection');
    }
  };

  const handleRemoveConnection = async (alumniId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${user._id}/connections/${alumniId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );

      if (response.ok) {
        setConnections(prev => {
          const updated = { ...prev };
          delete updated[alumniId];
          return updated;
        });
        alert('Connection removed successfully');
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Failed to remove connection');
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${user._id}/connections`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
          }
        );
        const data = await response.json();
        // Update to properly track connection status and type
        const connectionsMap = data.reduce((acc, conn) => {
          acc[conn.user._id] = {
            status: conn.status,
            type: conn.user._id === user._id ? 'sent' : 'received'
          };
          return acc;
        }, {});
        setConnections(connectionsMap);
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };

    if (user?._id) {
      fetchConnections();
    }
  }, [user]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/students`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch students data');
        }
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentConnect = async (studentId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${studentId}/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          [studentId]: { status: 'sent' }
        }));
        alert('Connection request sent!');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    }
  };

  useEffect(() => {
    // Update pending requests to include faculty
    const pending = [...alumni, ...students, ...faculty].filter(user => 
      connections[user._id]?.status === 'pending' &&
      connections[user._id]?.type === 'received'
    );
    setPendingRequests(pending);
  }, [connections, alumni, students, faculty]);

  // Add filtered faculty
  const filteredFaculty = faculty.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.profile?.academic?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlumni = alumni.filter(a =>
    a._id !== user?._id &&
    (
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.profile?.academic?.graduationYear?.toString().includes(searchTerm) ||
      a.profile?.professional?.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.profile?.professional?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.profile?.professional?.skills?.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.basicInfo?.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.academic?.skills?.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return <div className="p-6 text-center">Loading profiles...</div>;
  }

  const handleViewProfile = (alumnus) => {
    setSelectedAlumnus(alumnus);
  };

  return (
    <div className="page-container space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="page-title">Network</h2>
        {pendingRequests.length > 0 && (
          <button 
            onClick={() => document.getElementById('requestsSection').scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center space-x-2"
          >
            <span className="text-sm font-medium">Connection Requests</span>
            <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-full text-xs">
              {pendingRequests.length}
            </span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'alumni' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('alumni')}
        >
          Alumni
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'students' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'faculty' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('faculty')}
        >
          Faculty
        </button>
      </div>

      {/* Connection Requests Section */}
      {pendingRequests.length > 0 && (
        <div id="requestsSection" className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-blue-900">
            Connection Requests ({pendingRequests.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((user) => (
              <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div 
                  className="flex items-center space-x-4 cursor-pointer mb-4"
                  onClick={() => user.role === 'student' ? setSelectedStudent(user) : setSelectedAlumnus(user)}
                >
                  <img
                    src={user.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-sm text-gray-600">
                      {user.role === 'student' ? 
                        `Student - ${user.profile?.basicInfo?.department || 'Department not specified'}` :
                        `${user.profile?.professional?.designation || 'Alumni'} ${user.profile?.professional?.currentCompany ? `at ${user.profile.professional.currentCompany}` : ''}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleConnectionResponse(user._id, 'accepted')}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleConnectionResponse(user._id, 'rejected')}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main List Section */}
      <section>
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search ${activeTab === 'alumni' ? 'alumni' : activeTab === 'students' ? 'students' : 'faculty'}...`}
            className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'alumni' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredAlumni.length > 0 ? (
              filteredAlumni.map((alumnus) => (
                <div key={alumnus._id} 
                  className="card hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewProfile(alumnus)}
                >
                  <div className="flex items-start space-x-4 p-6">
                    <img 
                      src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`} 
                      alt={alumnus.name}
                      className="w-24 h-24 rounded-full border-4 border-blue-100"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{alumnus.name}</h3>
                      <p className="text-blue-600">
                        {alumnus.profile?.professional?.designation} 
                        {alumnus.profile?.professional?.currentCompany && 
                          ` at ${alumnus.profile.professional.currentCompany}`}
                      </p>
                      <p className="text-gray-600">
                        {alumnus.profile?.basicInfo?.department} 
                        {alumnus.profile?.academic?.graduationYear && 
                          ` | Batch of ${alumnus.profile.academic.graduationYear}`}
                      </p>

                      {/* Contact and Social Links */}
                      <div className="mt-4 space-y-2">
                        {/* Skills Section */}
                        {alumnus.profile?.professional?.skills?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700">Skills</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {alumnus.profile.professional.skills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Social Links */}
                        <div className="mt-4 flex space-x-3">
                          {alumnus.profile?.social?.linkedin && (
                            <a href={alumnus.profile.social.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:underline flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .4C4.698.4.4 4.698.4 10s4.298 9.6 9.6 9.6 9.6-4.298 9.6-9.6S15.302.4 10 .4zM7.65 13.979H5.706V7.723H7.65v6.256zm-.984-7.024c-.614 0-1.011-.435-1.011-.973 0-.549.409-.971 1.036-.971s1.011.422 1.023.971c0 .538-.396.973-1.048.973zm8.084 7.024h-1.944v-3.467c0-.807-.282-1.355-.985-1.355-.537 0-.856.371-.997.728-.052.127-.065.307-.065.486v3.607H8.814v-4.26c0-.781-.025-1.434-.051-1.996h1.689l.089.869h.039c.256-.408.883-1.01 1.932-1.01 1.279 0 2.238.857 2.238 2.699v3.699z"/>
                            </svg>
                            LinkedIn
                          </a>
                          )}
                          {alumnus.profile?.social?.github && (
                            <a href={alumnus.profile.social.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-700 hover:underline flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
                              </svg>
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {user._id !== alumnus._id && (
                    <div className="mt-4 border-t pt-4">
                      {!connections[alumnus._id] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(alumnus._id);
                          }}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Connect
                        </button>
                      )}

                      {connections[alumnus._id]?.status === 'sent' && (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded"
                        >
                          Request Sent
                        </button>
                      )}

                      {connections[alumnus._id]?.status === 'accepted' && (
                        <div className="flex space-x-2">
                          <button
                            disabled
                            className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded"
                          >
                            Connected
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveConnection(alumnus._id);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-500 py-8">
                No alumni profiles found matching your search.
              </div>
            )}
          </div>
        ) : activeTab === 'students' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div 
                  key={student._id} 
                  className="cursor-pointer card hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6" onClick={() => setSelectedStudent(student)}>
                    {/* Existing student card content */}
                    <div className="flex items-start space-x-4 p-6">
                      <img 
                        src={student.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${student.name}`} 
                        alt={student.name}
                        className="w-24 h-24 rounded-full border-4 border-green-100"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                        <p className="text-gray-600">
                          {student.profile?.basicInfo?.department} | Semester {student.profile?.basicInfo?.semester}
                        </p>
                        <p className="text-gray-600">
                          Enrollment: {student.profile?.basicInfo?.enrollmentNumber}
                        </p>
                        
                        {/* Skills Section */}
                        {student.profile?.academic?.skills?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700">Skills</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {student.profile.academic.skills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection Controls */}
                  <div className="px-6 pb-4 border-t pt-4 mt-4">
                    {!connections[student._id] && (
                      <button
                        onClick={() => handleStudentConnect(student._id)}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Connect
                      </button>
                    )}
                    {connections[student._id]?.status === 'sent' && (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded"
                      >
                        Request Sent
                      </button>
                    )}
                    {connections[student._id]?.status === 'accepted' && (
                      <div className="flex space-x-2">
                        <button
                          disabled
                          className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded"
                        >
                          Connected
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMessageUser(student);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveConnection(student._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-500 py-8">
                No students found matching your search.
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map((faculty) => (
                <div key={faculty._id} 
                  className="card hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedFaculty(faculty)}
                >
                  <div className="flex items-start space-x-4 p-6">
                    <img 
                      src={faculty.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${faculty.name}`} 
                      alt={faculty.name}
                      className="w-24 h-24 rounded-full border-4 border-purple-100"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{faculty.name}</h3>
                      <p className="text-purple-600">
                        {faculty.profile?.basicInfo?.designation || 'Faculty'}
                      </p>
                      <p className="text-gray-600">
                        {faculty.profile?.basicInfo?.department}
                      </p>
                      <p className="text-gray-600">
                        {faculty.profile?.academic?.specialization && 
                          `Specialization: ${faculty.profile.academic.specialization}`}
                      </p>

                      {/* Contact Information */}
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          {faculty.profile?.contact?.officeLocation && 
                            `Office: ${faculty.profile.contact.officeLocation}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {faculty.profile?.contact?.officeHours && 
                            `Office Hours: ${faculty.profile.contact.officeHours}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Connection Controls */}
                  <div className="mt-4 pt-4 border-t">
                    {!connections[faculty._id] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(faculty._id);
                        }}
                        className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                      >
                        Connect
                      </button>
                    )}
                    {connections[faculty._id]?.status === 'accepted' && (
                      <div className="flex space-x-2">
                        <button disabled className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded">
                          Connected
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveConnection(faculty._id);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {connections[faculty._id]?.status === 'sent' && (
                      <button disabled className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded">
                        Request Sent
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-500 py-8">
                No faculty profiles found matching your search.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Profile Modal */}
      {selectedAlumnus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedAlumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${selectedAlumnus.name}`}
                  alt={selectedAlumnus.name}
                  className="w-24 h-24 rounded-full border-4 border-blue-100"
                />
                <div>
                  <h2 className="text-2xl font-bold">{selectedAlumnus.name}</h2>
                  <p className="text-gray-600">{selectedAlumnus.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlumnus(null)}
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
                  <p><span className="font-medium">Department:</span> {selectedAlumnus.profile?.basicInfo?.department}</p>
                  <p><span className="font-medium">Location:</span> {selectedAlumnus.profile?.basicInfo?.location}</p>
                  <p><span className="font-medium">Phone:</span> {selectedAlumnus.profile?.basicInfo?.phone}</p>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Professional Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Current Company:</span> {selectedAlumnus.profile?.professional?.currentCompany}</p>
                  <p><span className="font-medium">Designation:</span> {selectedAlumnus.profile?.professional?.designation}</p>
                  <p><span className="font-medium">Experience:</span> {selectedAlumnus.profile?.professional?.experience}</p>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">Academic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Graduation Year:</span> {selectedAlumnus.profile?.academic?.graduationYear}</p>
                  <p><span className="font-medium">Degree:</span> {selectedAlumnus.profile?.academic?.degree}</p>
                  <p><span className="font-medium">Specialization:</span> {selectedAlumnus.profile?.academic?.specialization}</p>
                </div>
              </div>

              {/* Skills & Achievements */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Skills & Achievements</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlumnus.profile?.professional?.skills?.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Achievements</h4>
                    <ul className="list-disc list-inside">
                      {selectedAlumnus.profile?.professional?.achievements?.map((achievement, idx) => (
                        <li key={idx} className="text-gray-700">{achievement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="col-span-full bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Links</h3>
                <div className="flex space-x-4">
                  {selectedAlumnus.profile?.social?.linkedin && (
                    <a href={selectedAlumnus.profile.social.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .4C4.698.4.4 4.698.4 10s4.298 9.6 9.6 9.6 9.6-4.298 9.6-9.6S15.302.4 10 .4zM7.65 13.979H5.706V7.723H7.65v6.256zm-.984-7.024c-.614 0-1.011-.435-1.011-.973 0-.549.409-.971 1.036-.971s1.011.422 1.023.971c0 .538-.396.973-1.048.973zm8.084 7.024h-1.944v-3.467c0-.807-.282-1.355-.985-1.355-.537 0-.856.371-.997.728-.052.127-.065.307-.065.486v3.607H8.814v-4.26c0-.781-.025-1.434-.051-1.996h1.689l.089.869h.039c.256-.408.883-1.01 1.932-1.01 1.279 0 2.238.857 2.238 2.699v3.699z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  )}
                  {selectedAlumnus.profile?.social?.github && (
                    <a href={selectedAlumnus.profile.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
                      </svg>
                      GitHub Profile
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onConnect={() => handleStudentConnect(selectedStudent._id)}
          connectionStatus={connections[selectedStudent._id]?.status}
        />
      )}

      {selectedFaculty && (
        <FacultyProfileModal
          faculty={selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
        />
      )}

      {messageUser && (
        <MessageModal
          user={messageUser}
          onClose={() => setMessageUser(null)}
        />
      )}
    </div>
  );
};

export default ViewAlumniProfiles;

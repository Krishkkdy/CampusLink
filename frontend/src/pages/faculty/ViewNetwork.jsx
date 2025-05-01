import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AlumniProfileModal from "../../components/AlumniProfileModal";
import StudentProfileModal from "../../components/StudentProfileModal";

const ViewNetwork = () => {
  const { user } = useContext(AuthContext);
  const [alumni, setAlumni] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [connections, setConnections] = useState({});
  const [activeTab, setActiveTab] = useState('alumni');
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchAlumni();
    fetchStudents();
    fetchFaculty();
    fetchConnections();
  }, [user]);

  const fetchAlumni = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/alumni`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setAlumni(data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/faculty`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

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
      const connectionsMap = data.reduce((acc, conn) => {
        acc[conn.user._id] = { status: conn.status };
        return acc;
      }, {});
      setConnections(connectionsMap);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleConnect = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          [userId]: { status: 'sent' }
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
        setPendingRequests(prev => 
          prev.filter(req => req._id !== userId)
        );
      }
    } catch (error) {
      console.error('Error updating connection:', error);
      alert('Failed to update connection');
    }
  };

  const handleRemoveConnection = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${user._id}/connections/${userId}`,
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
          delete updated[userId];
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
    const pending = [...alumni, ...students].filter(user => 
      connections[user._id]?.status === 'pending'
    );
    setPendingRequests(pending);
  }, [connections, alumni, students]);

  const filteredAlumni = alumni.filter(a =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-center">Loading network...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-white mb-8">
            <h1 className="text-3xl font-bold">Professional Network</h1>
            <p className="mt-2 text-blue-100">Connect and collaborate with alumni, students, and faculty members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-blue-100">Connected Alumni</p>
                  <p className="text-2xl font-bold">{alumni.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-blue-100">Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-blue-100">Faculty Members</p>
                  <p className="text-2xl font-bold">{faculty.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Connection Requests <span className="text-blue-600">({pendingRequests.length})</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Enhanced Search and Filters */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, department, or specialization..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Network Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['alumni', 'students', 'faculty'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 text-sm font-medium text-center capitalize transition-colors
                    ${activeTab === tab 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTab === 'alumni' ? (
                filteredAlumni.map(alumnus => (
                  <div key={alumnus._id} className="card p-6">
                    <div className="flex items-start cursor-pointer" onClick={() => setSelectedAlumnus(alumnus)}>
                      <img
                        src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                        alt={alumnus.name}
                        className="w-16 h-16 rounded-full"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="font-bold text-lg">{alumnus.name}</h3>
                        <p className="text-gray-600">{alumnus.profile?.basicInfo?.department}</p>
                        <p className="text-gray-600">{alumnus.profile?.professional?.currentCompany}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      {!connections[alumnus._id] && (
                        <button
                          onClick={() => handleConnect(alumnus._id)}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Connect
                        </button>
                      )}
                      {connections[alumnus._id]?.status === 'accepted' && (
                        <div className="flex space-x-2">
                          <button disabled className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded">
                            Connected
                          </button>
                          <button
                            onClick={() => handleRemoveConnection(alumnus._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {connections[alumnus._id]?.status === 'sent' && (
                        <button disabled className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded">
                          Request Sent
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                filteredStudents.map(student => (
                  <div key={student._id} className="card p-6">
                    <div className="flex items-start cursor-pointer" onClick={() => setSelectedStudent(student)}>
                      <img
                        src={student.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${student.name}`}
                        alt={student.name}
                        className="w-16 h-16 rounded-full"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <p className="text-gray-600">{student.profile?.basicInfo?.department}</p>
                        <p className="text-gray-600">Semester: {student.profile?.basicInfo?.semester}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      {!connections[student._id] && (
                        <button
                          onClick={() => handleConnect(student._id)}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Connect
                        </button>
                      )}
                      {connections[student._id]?.status === 'accepted' && (
                        <div className="flex space-x-2">
                          <button disabled className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded">
                            Connected
                          </button>
                          <button
                            onClick={() => handleRemoveConnection(student._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {connections[student._id]?.status === 'sent' && (
                        <button disabled className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded">
                          Request Sent
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedAlumnus && (
        <AlumniProfileModal
          alumnus={selectedAlumnus}
          onClose={() => setSelectedAlumnus(null)}
          onConnect={
            !connections[selectedAlumnus._id] ? 
            () => handleConnect(selectedAlumnus._id) : 
            undefined
          }
          connectionStatus={connections[selectedAlumnus._id]?.status}
        />
      )}

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onConnect={
            !connections[selectedStudent._id] ? 
            () => handleConnect(selectedStudent._id) : 
            undefined
          }
          connectionStatus={connections[selectedStudent._id]?.status}
        />
      )}
    </div>
  );
};

export default ViewNetwork;

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AlumniProfileModal from "../../components/AlumniProfileModal";
import StudentProfileModal from "../../components/StudentProfileModal";
import FacultyProfileModal from "../../components/FacultyProfileModal";
import MessageModal from "../../components/MessageModal";

const ViewNetwork = () => {
  const { user } = useContext(AuthContext);
  const [alumni, setAlumni] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [connections, setConnections] = useState({});
  const [activeTab, setActiveTab] = useState('alumni');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [messageUser, setMessageUser] = useState(null);

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

      if (!response.ok) {
        throw new Error('Failed to fetch faculty data');
      }

      const data = await response.json();
      setFaculty(data.filter(f => f._id !== user?._id));
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
    const pending = [...alumni, ...faculty].filter(user => 
      connections[user._id]?.status === 'pending' && 
      connections[user._id]?.type === 'received'
    );
    setPendingRequests(pending);
  }, [connections, alumni, faculty]);

  const filteredAlumni = alumni.filter(a =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaculty = faculty.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.profile?.basicInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.profile?.academic?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-center">Loading network...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              View Network
            </span>
          </h1>
          {pendingRequests.length > 0 && (
            <button 
              onClick={() => document.getElementById('requestsSection').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center sm:justify-start gap-2"
            >
              <span className="text-sm sm:text-base font-medium whitespace-nowrap">Connection Requests</span>
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 bg-blue-500/20 rounded-full text-xs">
                {pendingRequests.length}
              </span>
            </button>
          )}
        </div>

        {pendingRequests.length > 0 && (
          <div id="requestsSection" className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-3 sm:p-6 mb-4 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-6 text-gray-900">
              Connection Requests ({pendingRequests.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-max">
              {['alumni', 'students', 'faculty'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[120px] px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-center capitalize transition-colors
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

          <div className="p-4 sm:p-6">
            <div className="relative mb-4 sm:mb-6">
              <input
                type="text"
                placeholder="Search network..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {activeTab === 'alumni' && filteredAlumni.map(alumnus => (
                <div key={alumnus._id} className="group bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-4 sm:p-6 cursor-pointer" onClick={() => setSelectedAlumnus(alumnus)}>
                    <div className="flex items-start space-x-4">
                      <img
                        src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                        alt={alumnus.name}
                        className="w-16 h-16 rounded-full ring-2 ring-blue-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{alumnus.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{alumnus.profile?.basicInfo?.department || 'Department not specified'}</p>
                        {alumnus.profile?.professional?.currentCompany && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {alumnus.profile.professional.currentCompany}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
                    {!connections[alumnus._id] && (
                      <button
                        onClick={() => handleConnect(alumnus._id)}
                        className="w-full bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Connect</span>
                      </button>
                    )}
                    {connections[alumnus._id]?.status === 'accepted' && (
                      <div className="flex space-x-2">
                        <button disabled className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded">
                          Connected
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMessageUser(alumnus);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded "
                        >
                          Message
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
              ))}
              {activeTab === 'students' && filteredStudents.map(student => (
                <div key={student._id} className="group bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-4 sm:p-6 cursor-pointer" onClick={() => setSelectedStudent(student)}>
                    <div className="flex items-start space-x-4">
                      <img
                        src={student.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${student.name}`}
                        alt={student.name}
                        className="w-16 h-16 rounded-full ring-2 ring-green-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{student.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{student.profile?.basicInfo?.department || 'Department not specified'}</p>
                        <div className="flex items-center text-gray-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Semester {student.profile?.basicInfo?.semester || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {activeTab === 'faculty' && filteredFaculty.map(faculty => (
                <div key={faculty._id} className="group bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-4 sm:p-6 cursor-pointer" onClick={() => setSelectedFaculty(faculty)}>
                    <div className="flex items-start space-x-4">
                      <img
                        src={faculty.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${faculty.name}`}
                        alt={faculty.name}
                        className="w-16 h-16 rounded-full ring-2 ring-purple-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{faculty.name}</h3>
                        <p className="text-sm text-gray-600">{faculty.profile?.basicInfo?.designation || 'Faculty'}</p>
                        <p className="text-sm text-gray-600">{faculty.profile?.basicInfo?.department}</p>
                        {faculty.profile?.academic?.specialization && (
                          <div className="flex items-center text-gray-600 text-sm mt-1">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            {faculty.profile.academic.specialization}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
                    {!connections[faculty._id] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(faculty._id);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded "
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
                            setMessageUser(faculty);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded "
                        >
                          Message
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedAlumnus && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
          
          <div className="relative h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 transform transition-all animate-fade-in">
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
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
          
          <div className="relative h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 transform transition-all animate-fade-in">
              <StudentProfileModal
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
              />
            </div>
          </div>
        </div>
      )}

      {selectedFaculty && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
          
          <div className="relative h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 transform transition-all animate-fade-in">
              <FacultyProfileModal
                faculty={selectedFaculty}
                onClose={() => setSelectedFaculty(null)}
                onConnect={
                  !connections[selectedFaculty._id] ? 
                  () => handleConnect(selectedFaculty._id) : 
                  undefined
                }
                connectionStatus={connections[selectedFaculty._id]?.status}
                showConnect={false}
              />
            </div>
          </div>
        </div>
      )}

      {messageUser && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
          
          <div className="relative h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 transform transition-all animate-fade-in">
              <MessageModal
                user={messageUser}
                onClose={() => setMessageUser(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewNetwork;

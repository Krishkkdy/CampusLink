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
      // Filter out the current user from faculty list
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
    // Only show received pending requests from alumni and faculty
    const pending = [...alumni, ...faculty].filter(user => 
      connections[user._id]?.status === 'pending' && 
      connections[user._id]?.type === 'received'
    );
    setPendingRequests(pending);
  }, [connections, alumni, faculty]); // Remove students from dependency

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
    <div className="page-container space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="page-title">My Network</h2>
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

      <input
        type="text"
        placeholder="Search by name or department..."
        className="w-full p-4 border rounded-lg"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessageUser(alumnus);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
          ))
        ) : activeTab === 'students' ? (
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
              {/* Remove connection controls section for students */}
            </div>
          ))
        ) : activeTab === 'faculty' && (
          filteredFaculty.length > 0 ? (
            filteredFaculty.map(faculty => (
              <div key={faculty._id} className="card p-6">
                <div className="flex items-start cursor-pointer" onClick={() => setSelectedFaculty(faculty)}>
                  <img
                    src={faculty.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${faculty.name}`}
                    alt={faculty.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-bold text-lg">{faculty.name}</h3>
                    <p className="text-gray-600">{faculty.profile?.basicInfo?.department}</p>
                    <p className="text-gray-600">{faculty.profile?.basicInfo?.designation}</p>
                    {faculty.profile?.academic?.specialization && (
                      <p className="text-gray-600">Specialization: {faculty.profile.academic.specialization}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  {!connections[faculty._id] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(faculty._id);
                      }}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-500 py-8">
              No faculty profiles found matching your search.
            </div>
          )
        )}
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
        />
      )}

      {selectedFaculty && (
        <FacultyProfileModal
          faculty={selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
          onConnect={
            !connections[selectedFaculty._id] ? 
            () => handleConnect(selectedFaculty._id) : 
            undefined
          }
          connectionStatus={connections[selectedFaculty._id]?.status}
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

export default ViewNetwork;

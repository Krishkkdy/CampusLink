import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AlumniProfileModal from "../../components/AlumniProfileModal";
import StudentProfileModal from "../../components/StudentProfileModal";

const ViewNetwork = () => {
  const { user } = useContext(AuthContext);
  const [alumni, setAlumni] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [connections, setConnections] = useState({});
  const [activeTab, setActiveTab] = useState('alumni');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequester, setSelectedRequester] = useState(null);

  useEffect(() => {
    fetchAlumni();
    fetchStudents();
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
      setStudents(data.filter(s => s._id !== user._id));
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    const pending = [...alumni, ...students].filter(user => 
      connections[user._id]?.status === 'pending'
    );
    setPendingRequests(pending);
  }, [connections, alumni, students]);

  const handleViewProfile = (user) => {
    if (user.role === 'alumni') {
      setSelectedAlumnus(user);
    } else {
      setSelectedStudent(user);
    }
  };

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            My Network
          </span>
        </h1>
      </div>

      {/* Connection Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Connection Requests ({pendingRequests.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((user) => (
              <div key={user._id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
              >
                <div className="flex items-center space-x-4 mb-4 cursor-pointer"
                  onClick={() => user.role === 'alumni' ? setSelectedAlumnus(user) : setSelectedStudent(user)}
                >
                  <img
                    src={user.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-600">
                      {user.role === 'alumni' ? (
                        `${user.profile?.professional?.designation || 'Alumni'} at ${user.profile?.professional?.currentCompany || 'Not specified'}`
                      ) : (
                        `Student - ${user.profile?.basicInfo?.department || 'Department not specified'}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectionResponse(user._id, 'accepted');
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectionResponse(user._id, 'rejected');
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Tabs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex space-x-4 border-b mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'alumni' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('alumni')}
          >
            Alumni Network
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'students' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('students')}
          >
            Student Network
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, department, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Network Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'alumni' ? (
            filteredAlumni.map(alumnus => (
              <div key={alumnus._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
                <div 
                  className="flex items-start space-x-4 cursor-pointer mb-4" 
                  onClick={() => setSelectedAlumnus(alumnus)}
                >
                  <img
                    src={alumnus.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${alumnus.name}`}
                    alt={alumnus.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{alumnus.name}</h3>
                    <p className="text-sm text-gray-600">
                      {alumnus.profile?.professional?.designation || 'Alumni'}
                      {alumnus.profile?.professional?.currentCompany && 
                        ` at ${alumnus.profile.professional.currentCompany}`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  {!connections[alumnus._id] && (
                    <button
                      onClick={() => handleConnect(alumnus._id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded hover:bg-blue-600"
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
              <div key={student._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
                <div 
                  className="flex items-start space-x-4 cursor-pointer mb-4" 
                  onClick={() => setSelectedStudent(student)}
                >
                  <img
                    src={student.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${student.name}`}
                    alt={student.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-600">
                      {student.profile?.basicInfo?.department || 'Department not specified'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Semester: {student.profile?.basicInfo?.semester || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  {!connections[student._id] && (
                    <button
                      onClick={() => handleConnect(student._id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded hover:bg-blue-600"
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

      {/* Profile Modals */}
      {selectedAlumnus && (
        <AlumniProfileModal
          alumnus={selectedAlumnus}
          onClose={() => setSelectedAlumnus(null)}
        />
      )}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
      {selectedRequester && (
        selectedRequester.role === 'alumni' ? (
          <AlumniProfileModal
            alumnus={selectedRequester}
            onClose={() => setSelectedRequester(null)}
          />
        ) : (
          <StudentProfileModal
            student={selectedRequester}
            onClose={() => setSelectedRequester(null)}
          />
        )
      )}
    </div>
  );
};

export default ViewNetwork;

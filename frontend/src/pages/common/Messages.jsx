import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import MessageModal from '../../components/MessageModal';

const Messages = () => {
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

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
        const acceptedConnections = data.filter(conn => conn.status === 'accepted');
        setConnections(acceptedConnections);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchConnections();
    }
  }, [user]);

  if (loading) {
    return <div className="p-6 text-center">Loading messages...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Messages
            </span>
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex h-[calc(100vh-200px)]">
            {/* Contacts Sidebar */}
            <div className="w-1/3 border-r border-gray-200 bg-white">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800">
                <h2 className="text-xl font-semibold text-white">Conversations</h2>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-280px)]">
                {connections.map(connection => (
                  <div
                    key={connection.user._id}
                    onClick={() => setSelectedUser(connection.user)}
                    className={`flex items-center p-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-gray-100
                      ${selectedUser?._id === connection.user._id ? 'bg-blue-50' : ''}`}
                  >
                    <img
                      src={connection.user.profile?.basicInfo?.avatar || 
                        `https://ui-avatars.com/api/?name=${connection.user.name}`}
                      alt={connection.user.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-200"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-gray-900">{connection.user.name}</h3>
                        <span className="text-xs text-gray-500">
                          {connection.lastMessage?.timestamp && 
                            new Date(connection.lastMessage.timestamp).toLocaleTimeString([], 
                              {hour: '2-digit', minute:'2-digit'}
                            )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {connection.lastMessage?.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50">
              {selectedUser ? (
                <MessageModal user={selectedUser} onClose={() => setSelectedUser(null)} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-6 mx-auto mb-4 w-fit">
                      <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Conversation</h3>
                    <p className="text-gray-600">Choose someone from your connections to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

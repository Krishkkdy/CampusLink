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
        // Filter only accepted connections
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
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r flex flex-col">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {connections.map(connection => (
              <div
                key={connection.user._id}
                onClick={() => setSelectedUser(connection.user)}
                className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors
                  ${selectedUser?._id === connection.user._id ? 'bg-blue-50' : ''}`}
              >
                <img
                  src={connection.user.profile?.basicInfo?.avatar || 
                    `https://ui-avatars.com/api/?name=${connection.user.name}`}
                  alt={connection.user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-gray-900">{connection.user.name}</h3>
                    <span className="text-xs text-gray-500">
                      {connection.lastMessage?.timestamp ? 
                        new Date(connection.lastMessage.timestamp).toLocaleTimeString([], 
                          {hour: '2-digit', minute:'2-digit'}
                        ) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {connection.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#f0f2f5]">
          {selectedUser ? (
            <MessageModal user={selectedUser} onClose={() => setSelectedUser(null)} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-xl font-medium">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import MessageModal from '../../components/MessageModal';

const Messages = () => {
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState({});

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

    const fetchUnreadCounts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/messages/unread-counts`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
          }
        );
        const data = await response.json();
        setUnreadMessages(data);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    if (user?._id) {
      fetchConnections();
      fetchUnreadCounts();
    }
  }, [user]);

  const handleSelectUser = (connection) => {
    setSelectedUser(connection.user);
    // Clear unread count for this user
    setUnreadMessages(prev => ({
      ...prev,
      [connection.user._id]: 0
    }));
  };

  if (loading) {
    return <div className="p-6 text-center">Loading messages...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Messages
            </span>
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row h-[calc(100vh-180px)]">
            {/* Contacts Sidebar - Hide on mobile when chat is open */}
            <div className={`${
              selectedUser ? 'hidden md:block' : 'block'
            } w-full md:w-1/3 border-r border-gray-200 bg-white`}>
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Conversations</h2>
                {selectedUser && (
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden text-white"
                  >
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="overflow-y-auto h-[calc(100vh-280px)]">
                {connections.map(connection => (
                  <div
                    key={connection.user._id}
                    onClick={() => handleSelectUser(connection)}
                    className={`flex items-center p-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-gray-100
                      ${selectedUser?._id === connection.user._id ? 'bg-blue-50' : ''}`}
                  >
                    <img
                      src={connection.user.profile?.basicInfo?.avatar || 
                        `https://ui-avatars.com/api/?name=${connection.user.name}`}
                      alt={connection.user.name}
                      className="w-10 h-10 rounded-full border-2 border-gray-200"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {connection.user.name}
                          {unreadMessages[connection.user._id] > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {unreadMessages[connection.user._id]}
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {connection.lastMessage?.timestamp && 
                            new Date(connection.lastMessage.timestamp).toLocaleTimeString([], 
                              {hour: '2-digit', minute:'2-digit'}
                            )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{connection.lastMessage?.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area - Show on mobile when chat is selected */}
            <div className={`${
              selectedUser ? 'block' : 'hidden md:block'
            } flex-1 bg-gray-50`}>
              {selectedUser ? (
                <MessageModal user={selectedUser} onClose={() => setSelectedUser(null)} />
              ) : (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="text-center max-w-md mx-auto">
                    <div className="bg-blue-100 rounded-full p-4 mx-auto mb-4 w-fit">
                      <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Select a Conversation</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Choose someone from your connections to start chatting</p>
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

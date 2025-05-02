import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const MessageModal = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [canSendMessage, setCanSendMessage] = useState(false);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    
    if (socket) {
      socket.on('new message', (message) => {
        // Only add message if it's between current user and selected user
        if ((message.sender._id === user._id && message.receiver._id === currentUser._id) ||
            (message.sender._id === currentUser._id && message.receiver._id === user._id)) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(m => m._id === message._id);
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
        }
      });

      socket.on('message sent', (message) => {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      });

      socket.on('message error', (error) => {
        console.error('Message error:', error);
        alert(`Failed to send message: ${error}`);
      });
    }

    return () => {
      if (socket) {
        socket.off('new message');
        socket.off('message sent');
        socket.off('message error');
      }
    };
  }, [socket, user._id, currentUser._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkMessagePermissions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/messages/${user._id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
          }
        );
        const data = await response.json();
        
        // If student messaging alumni, check if alumni initiated
        if (currentUser.role === 'student' && user.role === 'alumni') {
          const hasAlumniMessage = data.some(msg => msg.sender._id === user._id);
          setCanSendMessage(hasAlumniMessage);
        } else {
          setCanSendMessage(true);
        }
      } catch (error) {
        console.error('Error checking message permissions:', error);
      }
    };

    if (user?._id) {
      checkMessagePermissions();
    }
  }, [user._id, currentUser.role]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    try {
      console.log('Sending message:', {
        from: currentUser._id,
        to: user._id,
        content: newMessage
      }); // Debug log

      socket.emit('private message', {
        from: currentUser._id,
        to: user._id,
        content: newMessage.trim()
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <button
            onClick={onClose}
            className="md:hidden mr-3 text-white hover:bg-blue-700 p-1 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src={user.profile?.basicInfo?.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div className="ml-3">
            <h2 className="font-medium text-white">{user.name}</h2>
            <p className="text-sm text-blue-100">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.sender._id === currentUser._id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm
              ${message.sender._id === currentUser._id 
                ? 'bg-blue-600 text-white' 
                : 'bg-white'}`}
            >
              <p>{message.content}</p>
              <p className={`text-xs ${message.sender._id === currentUser._id ? 'text-blue-100' : 'text-gray-500'} text-right mt-1`}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={
            !canSendMessage && currentUser.role === 'student' 
              ? "Wait for alumni to send first message" 
              : "Type a message..."
          }
          disabled={!canSendMessage && currentUser.role === 'student'}
        />
        <button
          type="submit"
          disabled={!canSendMessage && currentUser.role === 'student'}
          className={`p-3 rounded-full ${
            (!canSendMessage && currentUser.role === 'student')
              ? 'bg-gray-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageModal;

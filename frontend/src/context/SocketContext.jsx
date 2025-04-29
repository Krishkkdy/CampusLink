import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?._id) {
      // Initialize socket connection
      const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));
      
      socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('login', user._id);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(socket);

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

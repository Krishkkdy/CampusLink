import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage
    try {
      const savedUser = localStorage.getItem('user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userToken', user.token);
      localStorage.setItem('userId', user._id); // Add this line
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId'); // Add this line
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

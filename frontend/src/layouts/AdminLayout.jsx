import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSignOut = () => {
    // Clear user data and token
    setUser(null);
    localStorage.removeItem('userToken');
    // Redirect to login
    navigate('/login');
  };

  return (
    <div>
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin" className="text-xl font-bold">Admin Dashboard</Link>
            </div>
            <div className="flex items-center space-x-4">
              {[
                { path: '/admin', label: 'Dashboard' },
                { path: '/alumni-list', label: 'Alumni List' },
                { path: '/faculty-list', label: 'Faculty List' },
                { path: '/student-list', label: 'Student List' },
                { path: '/send-emails', label: 'Send Emails' }
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-md ${
                    location.pathname === path 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

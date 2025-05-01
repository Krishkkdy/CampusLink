import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    // Clear user data and token
    setUser(null);
    localStorage.removeItem('userToken');
    // Redirect to login
    navigate('/login');
  };

  const navigationLinks = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/alumni-list', label: 'Alumni List' },
    { path: '/faculty-list', label: 'Faculty List' },
    { path: '/student-list', label: 'Student List' },
    { path: '/send-emails', label: 'Send Emails' }
  ];

  return (
    <div>
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <Link to="/admin" className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                CampusLink
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              {navigationLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Sign out
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

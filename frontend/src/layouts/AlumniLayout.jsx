import React, { useState, useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

const AlumniLayout = () => {
  const { user, setUser } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div>
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <Link to="/alumni" className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                CampusLink
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              {[
                { path: '/alumni', label: 'Dashboard' },
                { path: '/alumni/view-events', label: 'Events' },
                { path: '/alumni/messages', label: 'Message' },
                { path: '/alumni/job-postings', label: 'Job Postings' },
                { path: '/alumni/view-alumni-profiles', label: 'Network' },
                { path: '/alumni/resume-review', label: 'Resume Review' }
              ].map(({ path, label }) => (
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
              
              <NotificationBell userId={localStorage.getItem('userId')} />

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-50"
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user?.name}</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/alumni/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
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

export default AlumniLayout;

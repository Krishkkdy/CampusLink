import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname.startsWith(path) ? "bg-blue-700" : "";
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-white text-xl font-bold">Alumni Connect</span>
          </Link>
          
          <div className="flex space-x-4">
            {["admin", "faculty", "alumni"].map((role) => (
              <Link
                key={role}
                to={`/${role === "admin" ? "" : role}`}
                className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 
                hover:bg-blue-700 ${isActiveLink(`/${role}`)}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

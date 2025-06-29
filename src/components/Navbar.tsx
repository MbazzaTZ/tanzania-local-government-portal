import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // We use this to check login status
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import logo from '../assets/logo.png'; // Your project's logo

export default function Navbar() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // After logout, navigate the user to the login page
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Decide which dashboard link to show
  const dashboardPath = userRole === 'admin' ? '/admin' : '/mwananchi';

  return (
    <nav className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img className="h-10 w-auto" src={logo} alt="Portal Logo" />
            <span className="ml-3 font-bold text-xl text-gray-800 hidden sm:block">Government Portal</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              // --- SHOW THESE LINKS IF USER IS LOGGED IN ---
              <>
                <Link to={dashboardPath} className="text-gray-600 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              // --- SHOW THESE LINKS IF USER IS LOGGED OUT ---
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-lg w-full transform transition-all duration-300 hover:scale-105">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Tanzania Local Government Portal
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Select your portal to get started
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Register
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";
import logo from '../assets/logo.png'; // 1. IMPORT THE LOGO

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // ... your logout logic
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-lg w-full transform transition-all duration-300 hover:scale-105">
        
        {/* 2. ADD THE LOGO IMAGE HERE */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Portal Logo" className="h-24 w-auto" /> {/* Adjust size with h-24 */}
        </div>

        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Tanzania Local Government Portal
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Select your portal to get started
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {/* ... your buttons ... */}
        </div>
      </div>
    </div>
  );
}
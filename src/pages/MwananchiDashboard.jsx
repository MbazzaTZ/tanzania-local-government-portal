import React, { useEffect, useState } from "react";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function MwananchiDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(auth.currentUser?.uid || 'anonymous'); // Display userId

  useEffect(() => {
    // Ensure auth.currentUser is available before setting userId
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId('anonymous');
      }
    });

    return () => unsubscribe(); // Cleanup auth listener
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-500 to-cyan-600 p-4 text-white">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-lg w-full transform transition-all duration-300 hover:scale-105 text-gray-800">
        <h2 className="text-3xl font-bold mb-4">Mwananchi Dashboard</h2>
        <p className="text-lg mb-6">Welcome, Citizen! Here you can access services and information.</p>
        <p className="text-gray-600 mb-6">Your User ID: <span className="font-mono text-sm bg-gray-200 p-1 rounded">{userId}</span></p>

        <div className="space-y-4">
          <button
            onClick={() => console.log("Apply for Services")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Apply for Services
          </button>
          <button
            onClick={() => console.log("View Application Status")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            View Application Status
          </button>
          <button
            onClick={() => console.log("Access Public Resources")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            Access Public Resources
          </button>
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}


// In MwananchiDashboard.jsx
import ChatBox from './ChatBox';
const { currentUser } = useAuth();

// ...
<ChatBox chatId={currentUser.uid} />
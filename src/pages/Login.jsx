import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();

  // Redirect user if they are already logged in and have a role
  useEffect(() => {
    if (currentUser && userRole) {
      navigate(userRole === "admin" ? "/admin" : "/mwananchi");
    }
  }, [userRole, currentUser, navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The AuthContext will automatically pick up the new user and their role.
      // The useEffect hook above will handle the redirection.
    } catch (error) {
      setMessage("Login failed: " + error.message);
    }
  };
  
  // ... (Return JSX is the same)
  return (
    // Your JSX here
    <div/>
  );
}


import React, { useState } from "react";
// ... other imports
import logo from '../assets/logo.png'; // 1. IMPORT THE LOGO

export default function Login() {
  // ... your login state and functions ...

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        
        {/* 2. ADD THE LOGO IMAGE HERE */}
        <div className="flex justify-center mb-6">
            <img src={logo} alt="Portal Logo" className="h-20 w-auto" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h2>
        <form /* ... your form ... */>
          {/* ... your form fields and buttons ... */}
        </form>

        {/* ... rest of your component ... */}
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      setMessage("Error sending password reset email: " + error.message);
      console.error("Password reset error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 to-red-500 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>
        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition duration-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
          >
            Send Reset Email
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-blue-600 font-semibold">{message}</p>
        )}

        <div className="mt-6 text-center text-gray-600">
          <p>Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-orange-600 hover:underline font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { useAuth } from "../context/AuthContext";
import { fetchUsers, updateUserRole, deleteUserInFirestore } from "../services/firebaseService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersList = await fetchUsers();
        setUsers(usersList);
      } catch (err) {
        setError(err.message);
      }
    };
    loadUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setError("Error logging out. Please try again.");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, new_role);
      setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
      setMessage(`User role updated successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userIdToDelete) => {
    if (window.confirm("Are you sure? This only deletes the user from the database, not from authentication.")) {
      try {
        await deleteUserInFirestore(userIdToDelete);
        setUsers(users.filter(user => user.id !== userIdToDelete));
        setMessage(`User deleted successfully.`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // ... (Return JSX remains largely the same, but hooks up to these new handlers)
  // ... You would also display the `error` state in the UI.
  return (
    // Your JSX here, using currentUser.uid instead of the local userId state
    <div/>
  );
}

import React, { useState } from 'react';
// ... other imports for AdminDashboard
import ManageUsers from './ManageUsers'; // Assume you moved the user table to its own component
import VerificationQueue from './admin/VerificationQueue'; // Import the new component

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'verification'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'verification' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Pending Verifications
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'users' && <ManageUsers />}
          {activeTab === 'verification' && <VerificationQueue />}
        </div>
      </div>
    </div>
  );
}

// ... other imports
import VerificationQueue from './admin/VerificationQueue';
import EscalatedQueue from './admin/EscalatedQueue'; // Import the new component

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('verification'); // Default to the verification queue

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('verification')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'verification' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Pending Verifications
            </button>
            <button
              onClick={() => setActiveTab('escalated')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'escalated' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Escalated Cases
            </button>
             <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Manage All Users
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'verification' && <VerificationQueue />}
          {activeTab === 'escalated' && <EscalatedQueue />}
          {/* You would have a component for managing all users here */}
          {activeTab === 'users' && <div>Manage All Users Component</div>}
        </div>
      </div>
    </div>
  );
}


// In a new AdminChatInterface.jsx component
const [selectedChatId, setSelectedChatId] = useState(null);
// ... logic to get a list of users/chats ...

// ...
{selectedChatId && <ChatBox chatId={selectedChatId} />}
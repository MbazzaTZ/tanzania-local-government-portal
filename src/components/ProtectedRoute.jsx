import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    // Optionally, return a loading spinner
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // Or a dedicated "Unauthorized" page
  }

  return <Outlet />;
};

export default ProtectedRoute;
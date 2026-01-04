import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requiredRole, redirectTo = '/login' }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect to unauthorized or home page if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const DeptHeadRoute = () => (
  <ProtectedRoute requiredRole="depthead" redirectTo="/depthead/dashboard" />
);

export const GeneralManagerRoute = () => (
  <ProtectedRoute requiredRole="generalmanager" redirectTo="/gm/dashboard" />
);

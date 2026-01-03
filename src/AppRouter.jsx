import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { DeptHeadRoute, GeneralManagerRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import DeptHeadDashboard from './pages/depthead/Dashboard';
import GeneralManagerDashboard from './pages/gm/Dashboard';
import NotFound from './pages/NotFound';

// Component to handle root path redirection
function RootRedirect() {
  const { user } = useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'depthead') return <Navigate to="/depthead/dashboard" replace />;
  if (user.role === 'generalmanager') return <Navigate to="/gm/dashboard" replace />;
  
  return <Navigate to="/login" replace />;
}

function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Department Head Routes */}
          <Route element={<DeptHeadRoute />}>
            <Route path="/depthead/dashboard" element={<DeptHeadDashboard />} />
            <Route path="/depthead" element={<Navigate to="/depthead/dashboard" replace />} />
          </Route>
          
          {/* General Manager Routes */}
          <Route element={<GeneralManagerRoute />}>
            <Route path="/gm/dashboard" element={<GeneralManagerDashboard />} />
            <Route path="/gm" element={<Navigate to="/gm/dashboard" replace />} />
          </Route>
          
          {/* Default redirect based on role */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRouter;

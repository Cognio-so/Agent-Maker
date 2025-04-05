import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import UserPage from './pages/UserPage'
import Homepage from './pages/Homepage'
import Admin from './pages/Admin'
import { useAuth } from './context/AuthContext'

// ProtectedRoute component for user-level authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login page and save the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// AdminRoute component for admin-level authentication
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (user.role !== 'admin') {
    // If user is not an admin, redirect to user page
    return <Navigate to="/user" replace />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Initialize Google client
    if (window.google && document.getElementById('google-signin-script')) {
      return; // Already initialized
    }
    
    // Load the Google Sign-In API script
    const script = document.createElement('script');
    script.id = 'google-signin-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    
    return () => {
      const scriptTag = document.getElementById('google-signin-script');
      if (scriptTag) document.body.removeChild(scriptTag);
    };
  }, []);

  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={
        user ? (
          <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />
        ) : (
          <LoginPage />
        )
      } />
      <Route path="/signup" element={
        user ? (
          <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />
        ) : (
          <SignupPage />
        )
      } />

      {/* Protected user route */}
      <Route path="/user" element={
        <ProtectedRoute>
          <UserPage />
        </ProtectedRoute>
      } />

      {/* Protected admin routes */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      } />

      {/* Fallback route for any other path */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

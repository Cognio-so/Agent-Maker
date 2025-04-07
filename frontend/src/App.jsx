import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import Homepage from './pages/Homepage'
import UserPage from './pages/UserPage'
import Admin from './pages/Admin'
import UnauthorizedPage from './pages/UnauthorizedPage'
import { useAuth } from './context/AuthContext'
import AuthCallback from './components/AuthCallback'
import ProtectedRoute from './components/ProtectedRoute'

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

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getDefaultPathForUser = (loggedInUser) => {
    if (!loggedInUser) return "/";
    return loggedInUser.role === 'admin' ? '/admin' : '/employee';
  };

  return (
    <Routes>

      <Route path="/" element={!user ? <Homepage /> : <Navigate to={getDefaultPathForUser(user)} replace />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={getDefaultPathForUser(user)} replace />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={getDefaultPathForUser(user)} replace />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/employee" element={
        <ProtectedRoute allowedRoles={['employee', 'admin']}>
          <UserPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Admin />
        </ProtectedRoute>
      } />

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="*" element={<Navigate to={getDefaultPathForUser(user)} replace />} />
    </Routes>
  )
}

export default App

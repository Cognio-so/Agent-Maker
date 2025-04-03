import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import UserPage from './pages/UserPage'
import AdminPage from './pages/Adminpage'
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

  return (
    <Routes>
      <Route path="/user" element={<UserPage/>} />
      <Route path="/admin" element={<AdminPage/>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  )
}

export default App

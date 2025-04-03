import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const BASE_URL = 'https://agent-maker-backend.vercel.app';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);     
  const navigate = useNavigate(); 

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/auth/me`, { withCredentials: true });
        if (response.data) {
          setUser(response.data);
          // This depends on your app's needs - you may want to comment this out
          if (response.data.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        }
      } catch (err) {
        console.log("Not authenticated");
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true });
      console.log("Login response:", response.data);
      if (response.data) {
        setUser(response.data);
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, { name, email, password }, { withCredentials: true });
      if (response.data) {
        navigate('/login');
      }
    } catch (err) {
       setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
        await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
        setUser(null);
        navigate('/login'); 
    } catch (err) {
        setError(err.response?.data?.message || 'Logout failed');
        console.error("Logout error:", err);
    } finally {
        setLoading(false);
    }
  };

  const googleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Redirect to backend Google Auth initiation endpoint
      window.location.href = `${BASE_URL}/api/auth/google`;
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication initiation failed');
      console.error("Google auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      signup, 
      logout, 
      googleAuth, 
      setError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  return useContext(AuthContext);
};

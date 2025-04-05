import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FiUser, FiBell, FiMonitor, FiLock, FiChevronRight, 
  FiEdit2, FiCamera, FiCheck, FiInfo 
} from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profileImage: user?.profilePic || null,
    darkMode: true,
    emailNotifications: true,
    securityAlerts: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        profileImage: user.profilePic || null
      }));
    }
  }, [user]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to server
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      showNotification('success', 'Password updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }, 800);
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    
    // Simulate API call
    setTimeout(() => {
      showNotification('success', 'Account information updated successfully');
    }, 800);
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    
    // Simulate API call
    setTimeout(() => {
      showNotification('success', 'Preferences updated successfully');
    }, 800);
  };

  // Account settings section
  const renderAccountSettings = () => (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-1">Account Information</h2>
        <p className="text-gray-400 text-sm">Manage your personal information and email address</p>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-center md:justify-start mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-800 to-purple-800 border-2 border-white/10">
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-semibold text-white/70">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer border-2 border-gray-800 hover:bg-blue-700 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <FiCamera size={16} />
            </label>
          </div>
        </div>
      
        <form onSubmit={handleAccountUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="your.email@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">Your email address is used for notifications and account recovery</p>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg transition duration-200 font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      
      <div className="border-t border-gray-700 pt-8">
        <h2 className="text-xl font-semibold mb-1">Change Password</h2>
        <p className="text-gray-400 text-sm mb-5">Update your password to maintain account security</p>
        
        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
            <input 
              type="password" 
              name="currentPassword" 
              value={formData.currentPassword} 
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="••••••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
            <input 
              type="password" 
              name="newPassword" 
              value={formData.newPassword} 
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="••••••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="••••••••••••"
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg transition duration-200 font-medium"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Preferences section
  const renderPreferences = () => (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-1">Appearance</h2>
        <p className="text-gray-400 text-sm">Customize how the application looks and feels</p>
      </div>
      
      <form onSubmit={handlePreferencesUpdate}>
        <div className="space-y-5 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium">Dark Mode</h3>
              <p className="text-sm text-gray-400">Use dark theme throughout the application</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="darkMode" 
                checked={formData.darkMode} 
                onChange={handleInputChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium">Compact View</h3>
              <p className="text-sm text-gray-400">Reduce spacing in the interface</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="compactView" 
                checked={formData.compactView} 
                onChange={handleInputChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-3">
            <h3 className="text-base font-medium mb-2">Font Size</h3>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="fontSize" 
                  value="small" 
                  checked={formData.fontSize === 'small'} 
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="relative peer-checked:text-blue-500 peer-checked:border-blue-500 border-2 border-gray-700 rounded-lg px-4 py-2 cursor-pointer">
                  <span className="text-sm">Small</span>
                  <FiCheck className="absolute top-1.5 right-1.5 opacity-0 peer-checked:opacity-100 text-blue-500" size={14} />
                </div>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="fontSize" 
                  value="medium" 
                  checked={formData.fontSize === 'medium'} 
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="relative peer-checked:text-blue-500 peer-checked:border-blue-500 border-2 border-gray-700 rounded-lg px-4 py-2 cursor-pointer">
                  <span className="text-sm">Medium</span>
                  <FiCheck className="absolute top-1.5 right-1.5 opacity-0 peer-checked:opacity-100 text-blue-500" size={14} />
                </div>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="fontSize" 
                  value="large" 
                  checked={formData.fontSize === 'large'} 
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="relative peer-checked:text-blue-500 peer-checked:border-blue-500 border-2 border-gray-700 rounded-lg px-4 py-2 cursor-pointer">
                  <span className="text-sm">Large</span>
                  <FiCheck className="absolute top-1.5 right-1.5 opacity-0 peer-checked:opacity-100 text-blue-500" size={14} />
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 mb-8">
          <h2 className="text-xl font-semibold mb-1">Notifications</h2>
          <p className="text-gray-400 text-sm mb-5">Manage how you receive notifications</p>
          
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-400">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="emailNotifications" 
                  checked={formData.emailNotifications} 
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Security Alerts</h3>
                <p className="text-sm text-gray-400">Get notified about security events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="securityAlerts" 
                  checked={formData.securityAlerts} 
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg transition duration-200 font-medium"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      <div className="text-center md:text-left p-5 mb-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 text-sm">Configure your account and preferences</p>
      </div>
      
      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg transition-all transform animate-slideIn ${
          notification.type === 'success' ? 'bg-green-900/70 text-green-200 border border-green-700' : 
          'bg-red-900/70 text-red-200 border border-red-700'
        }`}>
          {notification.type === 'success' ? 
            <FiCheck className="inline-block mr-2" /> : 
            <FiInfo className="inline-block mr-2" />
          }
          {notification.message}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-full md:w-60 lg:w-72 bg-gray-900 p-5 border-b md:border-b-0 md:border-r border-gray-800 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('account')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'account' ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <FiUser className="mr-3" size={20} />
                <span>Account</span>
              </div>
              <FiChevronRight size={16} className={activeSection === 'account' ? 'opacity-100' : 'opacity-30'} />
            </button>
            
            <button
              onClick={() => setActiveSection('preferences')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'preferences' ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <FiMonitor className="mr-3" size={20} />
                <span>Preferences</span>
              </div>
              <FiChevronRight size={16} className={activeSection === 'preferences' ? 'opacity-100' : 'opacity-30'} />
            </button>
          </nav>
          
          <div className="mt-10 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-medium text-sm">Need Help?</h3>
            <p className="text-xs text-gray-400 mt-1 mb-3">Contact our support team for assistance with account settings.</p>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {activeSection === 'account' ? renderAccountSettings() : renderPreferences()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 
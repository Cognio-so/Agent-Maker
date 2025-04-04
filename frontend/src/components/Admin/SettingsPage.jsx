import React, { useState, useEffect, useRef } from 'react';
import { IoSave, IoMoon, IoSunny, IoShieldCheckmark, IoNotificationsOutline, IoPersonOutline, IoKey, IoWarning, IoEyeOutline, IoEyeOffOutline, IoChevronDown, IoCheckmarkCircle } from 'react-icons/io5';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const SettingsPage = () => {
    const { user, loading: authLoading } = useAuth();
    
    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });
    
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    
    // State to manage visibility of API keys
    const [showKeys, setShowKeys] = useState({
        openai: false,
        claude: false,
        gemini: false,
        llama: false,
    });
    
    // API keys state
    const [apiKeys, setApiKeys] = useState({
        openai: '',
        claude: '',
        gemini: '',
        llama: '',
    });
    
    // Add back the general settings state
    const [generalSettings, setGeneralSettings] = useState({
        emailNotifications: true,
        desktopNotifications: false,
    });
    
    // Load settings from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            document.documentElement.classList.toggle('dark', isDarkMode);
        }
        
        const savedKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
        setApiKeys(prev => ({ ...prev, ...savedKeys }));

        const savedGeneralSettings = JSON.parse(localStorage.getItem('generalSettings') || '{}');
        setGeneralSettings(prev => ({ ...prev, ...savedGeneralSettings }));
    }, []);
    
    // Apply theme and save preference when isDarkMode changes
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);
    
    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const toggleKeyVisibility = (keyName) => {
        setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
    };
    
    const handleApiKeyChange = (e) => {
        const { name, value } = e.target;
        setApiKeys({ ...apiKeys, [name]: value });
    };
    
    const saveApiKeys = async () => {
        try {
            setIsLoading(true);
            localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
            toast.success("API keys updated successfully");
        } catch (error) {
            console.error("Error saving API keys:", error);
            toast.error("Failed to save API keys");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGeneralSettingChange = (setting) => {
        setGeneralSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const saveGeneralSettings = () => {
        try {
            localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
            toast.success("Preferences saved successfully");
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("Failed to save preferences");
        }
    };

    // Helper function to render API key input field
    const renderApiKeyInput = (modelName, placeholder) => (
        <div className="relative overflow-hidden group transition-all duration-300 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:border-indigo-500/30">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium capitalize text-white/90">{modelName} API Key</label>
                <a 
                    href="#"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/30 py-1 px-2.5 rounded-full transition-colors"
                >
                    Get API Key
                </a>
            </div>
            <div className="relative">
                <input
                    type={showKeys[modelName] ? 'text' : 'password'}
                    name={modelName}
                    value={apiKeys[modelName]}
                    onChange={handleApiKeyChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-white/80 placeholder-white/30"
                    placeholder={placeholder}
                />
                <button 
                    type="button"
                    onClick={() => toggleKeyVisibility(modelName)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-white/50 hover:text-white/80"
                    aria-label={showKeys[modelName] ? `Hide ${modelName} key` : `Show ${modelName} key`}
                >
                    {showKeys[modelName] ? <IoEyeOffOutline size={18}/> : <IoEyeOutline size={18} />}
                </button>
            </div>
            <p className="text-xs text-white/40 mt-1.5">Used for {modelName.charAt(0).toUpperCase() + modelName.slice(1)} models</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-white/90 overflow-hidden">
            {/* Top glass panel */}
            <div className="relative z-10 px-6 pt-8 pb-6 backdrop-blur-md bg-white/5 border-b border-white/10 flex-shrink-0 text-center sm:text-left">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">Settings</h1>
                <p className="text-sm text-white/50 mt-1">Customize your experience and manage your account</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="px-6 pt-4 flex-shrink-0">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-white/10 pb-2">
                    {[
                        { id: 'general', label: 'General', icon: IoPersonOutline },
                        { id: 'api-keys', label: 'API Keys', icon: IoKey },
                        { id: 'notifications', label: 'Notifications', icon: IoNotificationsOutline },
                        { id: 'security', label: 'Security', icon: IoShieldCheckmark },
                    ].map(tab => (
                         <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                                ${activeTab === tab.id 
                                    ? 'text-white border-b-2 border-indigo-500 bg-white/5' 
                                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={16} /> 
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {activeTab === 'general' && (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        {/* Account Details Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
                            <div className="p-6 z-10 relative">
                                <h3 className="text-xl font-semibold text-white mb-6">Account Details</h3>
                                {authLoading ? (
                                    <div className="animate-pulse flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-white/10"></div>
                                        <div className="space-y-3 flex-1">
                                            <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                            <div className="h-3 bg-white/10 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ) : user ? (
                                    <div className="flex items-center space-x-6">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <p className="text-xl font-medium text-white">{user.name || 'N/A'}</p>
                                            <p className="text-white/50 mt-1">{user.email || 'N/A'}</p>
                                            <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-sm">
                                                <IoCheckmarkCircle size={16} />
                                                <span>Verified account</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                     <p className="text-white/50">Could not load user information.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Appearance Card */}
                        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Appearance</h3>
                                    <p className="text-white/50 mt-1">Choose your preferred theme</p>
                                </div>
                                <button 
                                    onClick={toggleTheme}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
                                >
                                    {isDarkMode ? (
                                        <IoSunny size={20} className="text-amber-300" />
                                    ) : (
                                        <IoMoon size={20} className="text-blue-300" />
                                    )}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setIsDarkMode(true)}
                                    className={`relative overflow-hidden group p-4 rounded-xl transition-all duration-300 ${
                                        isDarkMode 
                                            ? 'border-2 border-indigo-500 bg-black/40' 
                                            : 'border border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-center">
                                            <div className="p-2 rounded-xl bg-black/60 mb-3">
                                                <IoMoon size={20} className="text-indigo-400" />
                                            </div>
                                        </div>
                                        <p className="text-center font-medium text-white">Dark Mode</p>
                                        <p className="text-xs text-center text-white/40 mt-1">Reduced light emission</p>
                                    </div>
                                </button>
                                
                                <button 
                                    onClick={() => setIsDarkMode(false)}
                                    className={`relative overflow-hidden group p-4 rounded-xl transition-all duration-300 ${
                                        !isDarkMode 
                                            ? 'border-2 border-indigo-500 bg-white/10' 
                                            : 'border border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-center">
                                            <div className="p-2 rounded-xl bg-white/20 mb-3">
                                                <IoSunny size={20} className="text-amber-300" />
                                            </div>
                                        </div>
                                        <p className="text-center font-medium text-white">Light Mode</p>
                                        <p className="text-xs text-center text-white/40 mt-1">Enhanced visibility</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'api-keys' && (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 shadow-xl p-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-white">Model API Keys</h3>
                                <p className="text-white/50 mt-1">Connect your AI models with API keys</p>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                {renderApiKeyInput('openai', 'sk-...')}
                                {renderApiKeyInput('claude', 'sk-ant-...')}
                                {renderApiKeyInput('gemini', 'AIza...')}
                                {renderApiKeyInput('llama', 'meta-llama-...')}
                            </div>
                            
                            <div className="bg-white/5 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 mt-6">
                                <IoWarning className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-amber-200/80">
                                    API keys are stored locally in your browser. For better security in production, server-side storage is recommended.
                                </p>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={saveApiKeys}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <IoSave size={18} />
                                    )}
                                    <span>{isLoading ? 'Saving...' : 'Save API Keys'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'notifications' && (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 shadow-xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-6">Notification Settings</h3>
                            
                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 transition-all hover:border-indigo-500/30">
                                    <div>
                                        <p className="font-medium text-white">Email Notifications</p>
                                        <p className="text-sm text-white/50 mt-1">Receive updates and alerts via email</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={generalSettings.emailNotifications}
                                            onChange={() => handleGeneralSettingChange('emailNotifications')}
                                        />
                                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 transition-all hover:border-indigo-500/30">
                                    <div>
                                        <p className="font-medium text-white">Desktop Notifications</p>
                                        <p className="text-sm text-white/50 mt-1">Show notifications on your desktop</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={generalSettings.desktopNotifications}
                                            onChange={() => handleGeneralSettingChange('desktopNotifications')}
                                        />
                                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={saveGeneralSettings}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    <IoSave size={18} />
                                    <span>Save Settings</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'security' && (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 shadow-xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-6">Change Password</h3>
                            <div className="space-y-4">
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder-white/30"
                                    placeholder="Current password"
                                    autoComplete="current-password"
                                />
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder-white/30"
                                    placeholder="New password"
                                    autoComplete="new-password"
                                />
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder-white/30"
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                />
                                <div className="pt-2 flex justify-end">
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all shadow-lg shadow-indigo-600/20">
                                        <IoSave size={18} />
                                        <span>Update Password</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 shadow-xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Two-Factor Authentication</h3>
                                    <p className="text-white/50 mt-1">Add an extra layer of security</p>
                                    <div className="mt-2 px-3 py-1 bg-red-400/20 text-red-300 rounded-full inline-flex items-center text-xs">
                                        <span className="relative flex h-2 w-2 mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                        Not Enabled
                                    </div>
                                </div>
                                <button className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                                    Setup 2FA
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 shadow-xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Session Management</h3>
                            <button className="w-full text-left px-5 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-300 transition-colors font-medium">
                                Log out from all other devices
                            </button>
                            <p className="text-xs text-white/40 mt-3">This will sign you out of all sessions except the current one.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage; 
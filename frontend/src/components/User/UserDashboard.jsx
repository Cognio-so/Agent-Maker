import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatInput from './ChatInput';
import { useAuth } from '../../context/AuthContext';
import { IoPersonCircleOutline, IoSettingsOutline, IoPersonOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, loading } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    
    // Use effect to debug and handle user data changes
    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user, loading]);
    
    const predefinedPrompts = [
        {
            id: 1,
            title: 'Create an Agent',
            prompt: 'I want to create a new AI agent for customer service tasks. What capabilities should I include?'
        },
        {
            id: 2,
            title: 'Configure Agent Settings',
            prompt: 'Help me configure the response patterns and permissions for my marketing assistant agent.'
        },
        {
            id: 3,
            title: 'Agent Performance',
            prompt: 'Can you show me analytics on how my support agents have been performing this month?'
        },
    ]

    const handlePromptClick = (item) => {
        console.log("Prompt clicked:", item.prompt);
    }

    const handleChatSubmit = (message) => {
        console.log("Message submitted:", message);
        // Process the message here
    }
    
    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    }

    // For development/testing only
    const mockUser = {
        name: "Test User",
        email: "test@example.com",
        profilePic: null
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-black text-white p-3 sm:p-5 md:p-8 w-full relative'>
            {/* Profile Picture */}
            <div className="absolute top-4 right-4 z-20">
                <button 
                    onClick={toggleProfile}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors"
                >
                    {userData?.profilePic ? (
                        <img 
                            src={userData.profilePic} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <IoPersonCircleOutline size={24} className="text-white" />
                        </div>
                    )}
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                    <div className="absolute top-12 right-0 w-64 bg-[#1e1e1e] rounded-xl shadow-lg border border-white/10 overflow-hidden z-30">
                        <div className="p-4 border-b border-white/10">
                            {/* Show actual user data or fallback */}
                            <p className="font-medium text-white">
                                {userData?.name || mockUser.name}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                                {userData?.email || mockUser.email}
                            </p>
                        </div>
                        <div className="py-1">
                            <button className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-white/5 text-gray-300">
                                <IoPersonOutline size={18} />
                                <span>Profile</span>
                            </button>
                            <button className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-white/5 text-gray-300">
                                <IoSettingsOutline size={18} />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Rest of the dashboard */}
            <div className='text-center mb-6 sm:mb-8 md:mb-12 mt-16 md:mt-0 px-2'>
                <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold'>Welcome to AI Agent</h1>
                <span className='text-base sm:text-lg md:text-xl font-medium mt-2 block'>How can I assist you today?</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-xs sm:max-w-2xl lg:max-w-3xl xl:max-w-3xl px-2 sm:px-4">
                {predefinedPrompts.map((item) => (
                    <motion.div
                        key={item.id}
                        className={`group relative bg-white/[0.05] backdrop-blur-xl border border-white/20 hover:bg-white/[0.08] shadow-[0_0_15px_rgba(204,43,94,0.2)] hover:shadow-[0_0_20px_rgba(204,43,94,0.4)] rounded-xl p-3 cursor-pointer transition-all duration-150 text-left`}
                        whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePromptClick(item)}
                    >
                        <div className="relative z-10">
                            <h3 className="font-medium text-sm sm:text-base mb-1">{item.title}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{item.prompt}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Chat Input Component */}
            <div className="mt-6 sm:mt-8 w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-2 sm:px-4">
                <ChatInput onSubmit={handleChatSubmit} />
            </div>
            
            {/* Close profile dropdown when clicking outside */}
            {isProfileOpen && (
                <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileOpen(false)}
                />
            )}
        </div>
    )
}

export default UserDashboard;



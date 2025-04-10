import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import AdminMessageInput from './AdminMessageInput';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { IoPersonCircleOutline, IoSettingsOutline, IoPersonOutline, IoArrowBack } from 'react-icons/io5';
import { axiosInstance } from '../../api/axiosInstance';

const AdminChat = () => {
    const { gptId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { isDarkMode } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingGpt, setIsFetchingGpt] = useState(false);
    const [gptData, setGptData] = useState(null);
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    
    // Use effect to handle user data changes
    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);
    
    // Fetch GPT data if gptId is provided
    useEffect(() => {
        if (gptId) {
            const fetchGptData = async () => {
                try {
                    setIsFetchingGpt(true);
                    const response = await axiosInstance.get(`/api/custom-gpts/${gptId}`, { withCredentials: true });
                    
                    if (response.data.success) {
                        setGptData(response.data.customGpt);
                        setMessages([]);
                    } else {
                        console.error("Failed to load GPT data, success false");
                        navigate(-1);
                    }
                } catch (err) {
                    console.error("Error fetching GPT data:", err);
                    navigate(-1);
                } finally {
                    setIsFetchingGpt(false);
                }
            };
            
            fetchGptData();
        } else {
            setGptData(null);
            setMessages([]);
        }
    }, [gptId, navigate]);
    
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
    ];

    const handlePromptClick = (item) => {
        handleChatSubmit(item.prompt);
    };

    const handleChatSubmit = async (message) => {
        if (!message.trim()) return;

        try {
            const userMessage = {
                id: Date.now(),
                role: 'user',
                content: message,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, userMessage]);
            
            setIsLoading(true);
            
            setTimeout(() => {
                const aiResponse = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: `Mock Response: "${message}" ${gptData ? `(via ${gptData.name})` : '(via General AI)'}`,
                    timestamp: new Date()
                };
                
                setMessages(prev => [...prev, aiResponse]);
                setIsLoading(false);
            }, 1000);
            
        } catch (err) {
            console.error("Error in handleChatSubmit:", err);
            setIsLoading(false);
        }
    };
    
    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const mockUser = {
        name: "Admin User",
        email: "admin@example.com",
        profilePic: null
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className='flex flex-col h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden'>
            <div className="flex-shrink-0 bg-white dark:bg-black px-4 py-3 flex items-center justify-between">
                <div className="w-10 h-10">
                    {gptId && (
                        <button 
                            onClick={handleGoBack}
                            className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center w-full h-full"
                            aria-label="Go back"
                        >
                            <IoArrowBack size={20} />
                        </button>
                    )}
                </div>
                <div className="relative">
                    <button 
                        onClick={toggleProfile}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-white/40 transition-colors"
                    >
                        {(userData || mockUser)?.profilePic ? (
                            <img 
                                src={(userData || mockUser).profilePic} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <IoPersonCircleOutline size={24} className="text-gray-500 dark:text-white" />
                            </div>
                        )}
                    </button>
                    
                    {isProfileOpen && (
                        <div className="absolute top-12 right-0 w-64 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden z-30">
                            <div className="p-4 border-b border-gray-200 dark:border-white/10">
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {userData?.name || mockUser.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {userData?.email || mockUser.email}
                                </p>
                            </div>
                            <div className="py-1">
                                <button className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300">
                                    <IoPersonOutline size={18} />
                                    <span>Profile</span>
                                </button>
                                <button className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300" onClick={() => navigate('/admin/settings')}>
                                    <IoSettingsOutline size={18} />
                                    <span>Settings</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-white dark:bg-black">
                <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col space-y-4 pb-4">
                    {isFetchingGpt ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                            {gptId && gptData ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                                        {gptData.imageUrl ? (
                                            <img src={gptData.imageUrl} alt={gptData.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="text-2xl text-white">{gptData.name?.charAt(0) || '?'}</span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{gptData.name}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md">{gptData.description || 'Start a conversation...'}</p>
                                    
                                    {/* Truncated conversation starter */}
                                    {gptData.conversationStarter && (
                                        <div 
                                            onClick={() => handleChatSubmit(gptData.conversationStarter)}
                                            className="mt-5 max-w-xs p-3 bg-gray-100 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700/70 rounded-lg text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600/70 transition-colors"
                                        >
                                            <p className="text-gray-800 dark:text-white text-sm">
                                                {gptData.conversationStarter.length > 40 
                                                    ? gptData.conversationStarter.substring(0, 40) + '...' 
                                                    : gptData.conversationStarter
                                                }
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white'>Welcome to AI Agent</h1>
                                    <span className='text-base sm:text-lg md:text-xl font-medium text-gray-500 dark:text-gray-400 mb-8 block'>How can I assist you today?</span>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
                                        {predefinedPrompts.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                className={`group relative bg-white dark:bg-white/[0.05] backdrop-blur-xl border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.08] shadow-md hover:shadow-lg rounded-xl p-3 cursor-pointer transition-all duration-150 text-left`}
                                                whileHover={{ scale: 1.03, y: -2, transition: { duration: 0.15 } }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handlePromptClick(item)}
                                            >
                                                <div className="relative z-10">
                                                    <h3 className="font-medium text-sm sm:text-base mb-1 text-gray-800 dark:text-gray-100">{item.title}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2">{item.prompt}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {messages.map(message => (
                                <div 
                                    key={message.id} 
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                                            message.role === 'user' 
                                                ? 'bg-blue-600 text-white rounded-br-none' 
                                                : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-bl-none'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p> 
                                        <div 
                                            className={`text-xs mt-1 text-right ${
                                                message.role === 'user' ? 'text-blue-200/80' : 'text-gray-400/80'
                                            }`}
                                        >
                                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && messages.length > 0 && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm bg-gray-200 dark:bg-gray-700 rounded-bl-none flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>
            
            <div className="flex-shrink-0 w-[95%] max-w-3xl  mx-auto">
                <AdminMessageInput
                    onSubmit={handleChatSubmit}
                    isLoading={isLoading}
                />
            </div>
            
            {isProfileOpen && (
                <div 
                    className="fixed inset-0 z-20"
                    onClick={() => setIsProfileOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminChat;



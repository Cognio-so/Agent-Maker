import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatInput from './ChatInput';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { IoPersonCircleOutline, IoSettingsOutline, IoPersonOutline, IoArrowBack, IoSparkles } from 'react-icons/io5';
import { axiosInstance } from '../../api/axiosInstance';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { IoClose } from 'react-icons/io5';
import { FaFilePdf, FaFileWord, FaFileAlt, FaFile } from 'react-icons/fa';

const UserChat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const gptId = queryParams.get('gptId');
    const { user, loading: authLoading } = useAuth();
    const { isDarkMode } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingGpt, setIsFetchingGpt] = useState(false);
    const [gptData, setGptData] = useState(null);
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [collectionName, setCollectionName] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [userDocuments, setUserDocuments] = useState([]);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [conversationMemory, setConversationMemory] = useState([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);
    
    useEffect(() => {
        if (!gptId) {
            setGptData(null);
            setMessages([]);
            return;
        }
        
        const fetchGptData = async () => {
            try {
                setIsFetchingGpt(true);
                setMessages([]);
                
                const response = await axiosInstance.get(`/api/custom-gpts/user/assigned/${gptId}`, { 
                    withCredentials: true 
                });
                
                if (response.data && response.data.success && response.data.customGpt) {
                    setGptData(response.data.customGpt);
                    
                    // Create a collection name for RAG
                    const sanitizedEmail = (userData?.email || 'user').replace(/[^a-zA-Z0-9]/g, '_');
                    const sanitizedGptName = (response.data.customGpt.name || 'gpt').replace(/[^a-zA-Z0-9]/g, '_');
                    const collectionName = `kb_${sanitizedEmail}_${sanitizedGptName}_${gptId}`;
                    setCollectionName(collectionName);
                    
                    // Try to notify backend (non-blocking)
                    try {
                        notifyGptOpened(response.data.customGpt, userData)
                            .then(result => console.log("GPT opened notification result:", result))
                            .catch(notifyErr => console.warn("Failed to notify GPT opened:", notifyErr));
                    } catch (notifyErr) {
                        console.warn("Error preparing GPT notification:", notifyErr);
                    }
                } else {
                    // Handle case where the API returned success: false or missing customGpt
                    console.warn("Failed to load GPT data or invalid response format:", response.data);
                    
                    // Set a fallback GPT object
                    setGptData({
                        _id: gptId,
                        name: "GPT Assistant",
                        description: "This GPT may not be available right now.",
                        model: "gpt-4o-mini"
                    });
                    
                    // Set a fallback collection name
                    setCollectionName(`kb_user_${gptId}`);
                }
            } catch (err) {
                console.error("Error fetching GPT data:", err);
                
                // Set a fallback GPT object
                setGptData({
                    _id: gptId,
                    name: "GPT Assistant",
                    description: "This GPT may not be available right now.",
                    model: "gpt-4o-mini"
                });
                
                // Set a fallback collection name
                setCollectionName(`kb_user_${gptId}`);
            } finally {
                setIsFetchingGpt(false);
            }
        };
        
        fetchGptData();
    }, [gptId, userData]);
    
    const predefinedPrompts = [
        {
            id: 1,
            title: 'About this GPT',
            prompt: 'What can you tell me about yourself and your capabilities?'
        },
        {
            id: 2,
            title: 'Help me with',
            prompt: 'I need help with a specific task. Can you guide me through it?'
        },
        {
            id: 3,
            title: 'Examples',
            prompt: 'Can you show me some examples of how to use you effectively?'
        },
    ];

    const handlePromptClick = (item) => {
        handleChatSubmit(item.prompt);
    };

    const handleChatSubmit = async (message) => {
        if (!message.trim()) return;

        // Set interaction flag to hide files
        setHasInteracted(true);
        
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Update conversation memory with relevant context
            const updatedMemory = [...conversationMemory];
            if (updatedMemory.length >= 10) {
                // Keep only the most recent messages if memory gets too large
                updatedMemory.splice(0, updatedMemory.length - 9);
            }
            updatedMemory.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });
            setConversationMemory(updatedMemory);
            
            // Use the userDocuments in your API call
            const backendUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
            
            const payload = {
                message,
                collection_name: collectionName,
                user_documents: userDocuments,
                model: gptData?.model,
                memory: updatedMemory, // Pass complete conversation memory
                history: messages.slice(-6).map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            };

            // Try streaming first - same as AdminChat
            try {
                const response = await fetch(`${backendUrl}/chat-stream`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    // FIXED: Properly handle streaming response
                    await handleStreamingResponse(response);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (streamingError) {
                console.warn("Streaming failed, falling back to regular chat API:", streamingError);
                
                // Fallback to regular chat
                const fallbackResponse = await axios.post(
                    `${backendUrl}/chat`, 
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
                
                // FIXED: Use the actual response from the API
                if (fallbackResponse.data && fallbackResponse.data.success && fallbackResponse.data.response) {
                    const aiResponse = {
                        id: Date.now() + 1,
                        role: 'assistant',
                        content: fallbackResponse.data.response,
                        timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, aiResponse]);
                } else {
                    throw new Error("Invalid response from server");
                }
            }
        } catch (err) {
            console.error("Error submitting chat message:", err);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Sorry, I encountered an error trying to respond. The knowledge base for this GPT might not be properly indexed.",
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Add this function to handle streaming responses (copied from AdminChat)
    const handleStreamingResponse = async (response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamingMessageId = Date.now() + 1;
        
        // Create initial streaming message
        const initialMessage = {
            id: streamingMessageId,
            role: 'assistant',
            content: '',
            isStreaming: true,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, initialMessage]);
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    // Also update conversation memory when streaming completes
                    const completedMessage = messages.find(msg => msg.id === streamingMessageId);
                    if (completedMessage) {
                        setConversationMemory(prev => [...prev, {
                            role: 'assistant',
                            content: completedMessage.content,
                            timestamp: new Date().toISOString()
                        }]);
                    }
                    
                    // Mark streaming as complete
                    setMessages(prev => prev.map(msg => 
                        msg.id === streamingMessageId ? { ...msg, isStreaming: false } : msg
                    ));
                    break;
                }
                
                const text = decoder.decode(value, {stream: true});
                const lines = text.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.substring(6);
                            const parsed = JSON.parse(jsonStr);
                            
                            if (parsed.error) {
                                console.error("Streaming Error:", parsed.error);
                                setMessages(prev => prev.map(msg => 
                                    msg.id === streamingMessageId ? 
                                    { ...msg, content: `Error: ${parsed.error}`, isStreaming: false } : 
                                    msg
                                ));
                                return;
                            }
                            
                            if (parsed.done === true) {
                                setMessages(prev => prev.map(msg => 
                                    msg.id === streamingMessageId ? { ...msg, isStreaming: false } : msg
                                ));
                                return;
                            }
                            
                            if (parsed.content) {
                                setMessages(prev => prev.map(msg => 
                                    msg.id === streamingMessageId ? 
                                    { ...msg, content: msg.content + parsed.content } : 
                                    msg
                                ));
                            }
                        } catch (e) {
                            console.error("Error parsing streaming line:", e, "Line:", line);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Error reading stream:", err);
            setMessages(prev => prev.map(msg => 
                msg.id === streamingMessageId ? 
                { ...msg, content: "Error reading response stream.", isStreaming: false } : 
                msg
            ));
        }
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const goToSettings = () => {
        navigate('/user/settings');
        setIsProfileOpen(false);
    };

    const mockUser = {
        name: "Test User",
        email: "test@example.com",
        profilePic: null
    };

    const showWebSearch = gptData?.capabilities?.webBrowsing === true;

    const notifyGptOpened = async (gptData, userData) => {
        try {
            if (!gptData) return false;
            
            // Check backend availability but don't block if check fails
            let isAvailable = true;
            try {
                const backendUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
                const checkResponse = await fetch(`${backendUrl}/`);
                isAvailable = checkResponse.ok;
            } catch (e) {
                isAvailable = false;
            }
            
            if (!isAvailable) {
                console.warn("Backend appears to be unavailable");
                return false;
            }
            
            const backendUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
            
            const payload = {
                user_email: userData?.email || 'user@example.com',
                gpt_name: gptData.name || 'Unnamed GPT',
                gpt_id: gptData._id,
                file_urls: gptData.files || [],
                schema: {
                    model: gptData.model || "gpt-4o-mini"
                }
            };
            
            const response = await fetch(`${backendUrl}/gpt-opened`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("GPT opened notification successful");
                
                // Store the collection name if provided
                if (data && data.collection_name) {
                    setCollectionName(data.collection_name);
                }
                
                return true;
            } else {
                console.error("Failed to notify GPT opened:", await response.text());
                return false;
            }
        } catch (err) {
            console.error("Error notifying GPT opened:", err);
            return false;
        }
    };

    const handleFileUpload = async (files) => {
        if (!files.length || !gptData) return;
        
        try {
            // Set uploading state to true
            setIsUploading(true);
            setUploadProgress(0);
            // Store file information for display
            setUploadedFiles(Array.from(files).map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            })));
            
            // Create FormData for file upload
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            formData.append('user_email', userData?.email || 'user@example.com');
            formData.append('gpt_id', gptData._id);
            formData.append('gpt_name', gptData.name);
            formData.append('collection_name', collectionName || gptData._id);
            formData.append('is_user_document', 'true');
            
            // Use a faster progress simulation for better perceived performance
            const startTime = Date.now();
            const uploadDuration = 1500; // 1.5 seconds for initial upload phase
            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                if (elapsed < uploadDuration) {
                    // Fast progress to 60% during "upload" phase
                    const progress = Math.min(60, (elapsed / uploadDuration) * 60);
                    setUploadProgress(progress);
                } else {
                    // Then slower progress to 90% during "processing" phase
                    setUploadProgress(prev => {
                        if (prev < 90) {
                            return prev + (90 - prev) * 0.08;
                        }
                        return prev;
                    });
                }
            }, 100); // Update progress more frequently
            
            // Get the backend URL from environment
            const backendUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
            
            // Upload files to backend
            const response = await axios.post(
                `${backendUrl}/upload-chat-files`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        // Only use real progress for the first 60%
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 60) / (progressEvent.total || 100)
                        );
                        // Cap at 60% since processing happens after upload
                        setUploadProgress(Math.min(percentCompleted, 60));
                    }
                }
            );
            
            // Clear the progress interval
            clearInterval(progressInterval);
            
            // Complete the progress bar
            setUploadProgress(100);
            
            // Small delay before removing the progress indicator
            setTimeout(() => {
                setIsUploading(false);
            }, 500);
            
            if (response.data.success) {
                // Track the user documents
                setUserDocuments(response.data.file_urls || []);
            } else {
                throw new Error(response.data.message || "Failed to process files");
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            
            // Stop the animation
            setIsUploading(false);
        }
    };

    // Add this helper function for file icons
    const getFileIcon = (filename) => {
        if (!filename) return <FaFile className="text-white" />;
        
        const extension = filename.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return <FaFilePdf className="text-white" />;
            case 'doc':
            case 'docx':
                return <FaFileWord className="text-white" />;
            case 'txt':
                return <FaFileAlt className="text-white" />;
            default:
                return <FaFile className="text-white" />;
        }
    };

    // Add this function to handle removing uploaded files
    const handleRemoveUploadedFile = (indexToRemove) => {
        setUploadedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-300 ${
            isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
        }`}>
            <div className={`flex-shrink-0 px-4 py-3 flex items-center justify-between  ${
                isDarkMode ? 'bg-black border-gray-800' : 'bg-gray-100 border-gray-200'
            }`}>
                <div className="w-10 h-10">
                    {gptId && (
                        <button 
                            onClick={handleGoBack}
                            className={`p-2 rounded-full transition-colors flex items-center justify-center w-full h-full ${
                                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                            aria-label="Go back"
                        >
                            <IoArrowBack size={20} />
                        </button>
                    )}
                </div>
                
                <div className="relative">
                    <button 
                        onClick={toggleProfile}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors ${
                            isDarkMode ? 'border-white/20 hover:border-white/40' : 'border-gray-300 hover:border-gray-500'
                        }`}
                    >
                        {(userData || mockUser)?.profilePic ? (
                            <img 
                                src={(userData || mockUser).profilePic} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                <IoPersonCircleOutline size={24} className={isDarkMode ? 'text-white' : 'text-gray-600'} />
                            </div>
                        )}
                    </button>
                    
                    {isProfileOpen && (
                        <div className={`absolute top-12 right-0 w-64 rounded-xl shadow-lg border overflow-hidden z-30 ${
                             isDarkMode ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'
                        }`}>
                            <div className={`p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {userData?.name || mockUser.name}
                                </p>
                                <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {userData?.email || mockUser.email}
                                </p>
                            </div>
                            <div className="py-1">
                                <button className={`w-full px-4 py-2.5 text-left flex items-center space-x-3 transition-colors ${
                                    isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'
                                }`}>
                                    <IoPersonOutline size={18} />
                                    <span>Profile</span>
                                </button>
                                <button 
                                    onClick={goToSettings} 
                                    className={`w-full px-4 py-2.5 text-left flex items-center space-x-3 transition-colors ${
                                        isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <IoSettingsOutline size={18} />
                                    <span>Settings</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                <div className="w-full max-w-3xl mx-auto flex flex-col space-y-4">
                    {isFetchingGpt ? (
                        <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-700'}`}>
                            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-blue-500' : 'border-blue-600'}`}></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-2 pt-8 pb-16">
                            {gptId && gptData ? (
                                <>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                        {gptData.imageUrl ? (
                                            <img src={gptData.imageUrl} alt={gptData.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>{gptData.name?.charAt(0) || '?'}</span>
                                        )}
                                    </div>
                                    <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{gptData.name}</h2>
                                    <p className={`max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{gptData.description || 'Start a conversation...'}</p>
                                    
                                    {gptData.conversationStarter && (
                                        <div 
                                            onClick={() => handleChatSubmit(gptData.conversationStarter)}
                                            className={`mt-5 max-w-xs p-3 border rounded-lg text-left cursor-pointer transition-colors ${
                                                isDarkMode 
                                                    ? 'bg-gray-800/70 border-gray-700/70 hover:bg-gray-800 hover:border-gray-600/70 text-white' 
                                                    : 'bg-gray-200 border-gray-300 hover:bg-gray-300 hover:border-gray-400 text-gray-800'
                                            }`}
                                        >
                                            <p className="text-sm line-clamp-3">
                                                {gptData.conversationStarter}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Agent</h1>
                                    <span className={`text-base sm:text-lg md:text-xl font-medium mb-8 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>How can I assist you today?</span>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-xs sm:max-w-2xl lg:max-w-3xl xl:max-w-3xl">
                                        {predefinedPrompts.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                className={`group relative backdrop-blur-xl border rounded-xl p-3 cursor-pointer transition-all duration-150 text-left ${
                                                    isDarkMode 
                                                        ? 'bg-white/[0.05] border-white/20 hover:bg-white/[0.08] shadow-[0_0_15px_rgba(204,43,94,0.2)] hover:shadow-[0_0_20px_rgba(204,43,94,0.4)]' 
                                                        : 'bg-white border-gray-200 hover:bg-gray-50 shadow-md hover:shadow-lg'
                                                }`}
                                                whileHover={{ scale: 1.03, y: -2, transition: { duration: 0.15 } }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handlePromptClick(item)}
                                            >
                                                <div className="relative z-10">
                                                    <h3 className={`font-medium text-sm sm:text-base mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.title}</h3>
                                                    <p className={`text-xs sm:text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.prompt}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <motion.div 
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                        {gptData?.imageUrl ? (
                                            <img src={gptData.imageUrl} alt="GPT" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <IoSparkles size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                                        )}
                                    </div>
                                )}
                                <div 
                                    className={`${
                                        msg.role === 'user' 
                                            ? 'max-w-fit p-3 rounded-lg user-message-glossy text-white rounded-br-none' 
                                            : 'p-3 text-black dark:text-white rounded-bl-none'
                                    }`}
                                >
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-md font-bold my-2" {...props} />,
                                            h4: ({node, ...props}) => <h4 className="font-bold my-2" {...props} />,
                                            p: ({node, children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                            ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                                            li: ({node, index, ...props}) => <li key={index} className="my-1" {...props} />,
                                            a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-500 dark:border-gray-400 pl-4 my-3 italic" {...props} />,
                                            code({node, inline, className, children, ...props}) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline ? (
                                                    <pre className={`p-2 rounded overflow-x-auto my-2 text-sm ${isDarkMode ? 'bg-black/30' : 'bg-gray-100'} ${className}`} {...props}>
                                                        <code>{children}</code>
                                                    </pre>
                                                ) : (
                                                    <code className={`px-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} ${className}`} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            table: ({node, ...props}) => (
                                                <div className="overflow-x-auto my-3">
                                                    <table className="min-w-full border border-gray-400 dark:border-gray-500" {...props} />
                                                </div>
                                            ),
                                            thead: ({node, ...props}) => <thead className="bg-gray-300 dark:bg-gray-600" {...props} />,
                                            tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-400 dark:divide-gray-500" {...props} />,
                                            tr: ({node, ...props}) => <tr className="hover:bg-gray-300 dark:hover:bg-gray-600" {...props} />,
                                            th: ({node, ...props}) => <th className="px-4 py-2 text-left font-medium" {...props} />,
                                            td: ({node, ...props}) => <td className="px-4 py-2" {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                    {msg.isStreaming && (
                                        <div className="flex space-x-1 mt-1">
                                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }} className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></motion.div>
                                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2, repeatDelay: 0.5, ease: "easeInOut" }} className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></motion.div>
                                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4, repeatDelay: 0.5, ease: "easeInOut" }} className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></motion.div>
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border ${isDarkMode ? 'border-white/20 bg-gray-700' : 'border-gray-300 bg-gray-300'}`}>
                                       {userData?.profilePic ? (
                                           <img src={userData.profilePic} alt="You" className="w-full h-full object-cover" />
                                       ) : (
                                            <div className={`w-full h-full flex items-center justify-center`}>
                                               <IoPersonOutline size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                                           </div>
                                       )}
                                   </div>
                                )}
                            </motion.div>
                        ))
                    )}
                    {isLoading && !messages.some(msg => msg.isStreaming) && (
                        <div className="flex justify-start items-end space-x-2">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                {gptData?.imageUrl ? (
                                    <img src={gptData.imageUrl} alt="GPT" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <IoSparkles size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                                )}
                            </div>
                            <div className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div className="flex space-x-1">
                                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }} className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></motion.div>
                                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2, repeatDelay: 0.5, ease: "easeInOut" }} className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></motion.div>
                                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4, repeatDelay: 0.5, ease: "easeInOut" }} className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></motion.div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} /> 
                </div>
            </div>

            <div className={`flex-shrink-0 p-3  ${isDarkMode ? 'bg-black border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
                <div className="w-full max-w-3xl mx-auto">
                    {/* File Upload Animation */}
                    {isUploading && (
                        <div className="mb-1 file-upload-card max-w-md bg-white dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/30 overflow-hidden">
                            <div className="p-1.5 flex items-center">
                                <div className="w-6 h-6 flex items-center justify-center relative mr-2">
                                    <svg className="w-6 h-6 animate-spin text-blue-500" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="flex-1 truncate">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white flex items-center">
                                        Processing
                                        <span className="ml-1 text-[10px] text-gray-500">{uploadedFiles[0]?.name.substring(0, 12)}...</span>
                                        {uploadedFiles.length > 1 && <span className="text-[10px] text-gray-400 ml-1">+{uploadedFiles.length - 1}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Replace the existing uploaded files display with this one */}
                    {uploadedFiles.length > 0 && !isUploading && !hasInteracted && (
                        <div className="mb-0.5">
                            {uploadedFiles.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center py-1 px-2 bg-gray-100 dark:bg-gray-800/70 rounded-lg mb-0.5 max-w-[25%]">
                                    <div className="w-5 h-5 flex items-center justify-center mr-1.5">
                                        {file.type.includes('pdf') ? 
                                            <FaFilePdf size={12} className="text-red-500" /> : 
                                            file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc') ? 
                                            <FaFileWord size={12} className="text-blue-500" /> : 
                                            <FaFileAlt size={12} className="text-gray-500" />
                                        }
                                    </div>
                                    <div className="flex-1 truncate">
                                        <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                            {file.name}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-500 ml-1 whitespace-nowrap">
                                        {file.size ? `${Math.round(file.size / 1024)} KB` : ''}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveUploadedFile(index)}
                                        className="ml-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                        aria-label="Remove file"
                                    >
                                        <IoClose size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <ChatInput 
                        onSubmit={handleChatSubmit} 
                        onFileUpload={handleFileUpload}
                        isLoading={isLoading} 
                        isDarkMode={isDarkMode} 
                        showWebSearch={showWebSearch}
                    />
                </div>
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

export default UserChat;
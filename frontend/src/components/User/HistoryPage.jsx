import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiSearch, FiMessageSquare, FiClock, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { IoEllipse } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

// Mock data moved outside component to prevent recreation on each render
const mockConversations = [
    {
        id: 'conv1',
        gptId: 'gpt1',
        gptName: 'Customer Support Assistant',
        lastMessage: 'How can I request a refund for my recent purchase?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        messageCount: 12,
        model: 'GPT-4',
        summary: 'Discussion about refund policies and procedures'
    },
    {
        id: 'conv2',
        gptId: 'gpt2',
        gptName: 'Product Recommendation Agent',
        lastMessage: 'I need a new laptop for video editing under $1500',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        messageCount: 8,
        model: 'GPT-3.5',
        summary: 'Recommendations for video editing laptops'
    },
    {
        id: 'conv3',
        gptId: 'gpt3',
        gptName: 'Content Writing Assistant',
        lastMessage: 'Can you help me write a blog post about artificial intelligence?',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        messageCount: 15,
        model: 'GPT-4',
        summary: 'Creating a blog post about AI advancements'
    },
    {
        id: 'conv4',
        gptId: 'gpt4',
        gptName: 'Travel Planning Assistant',
        lastMessage: 'I want to plan a 2-week trip to Japan in the spring',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        messageCount: 22,
        model: 'GPT-4',
        summary: 'Planning a comprehensive trip to Japan'
    },
    {
        id: 'conv5',
        gptId: 'gpt5',
        gptName: 'Health & Fitness Coach',
        lastMessage: 'What exercises are best for improving core strength?',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        messageCount: 7,
        model: 'GPT-3.5',
        summary: 'Discussion about core strength exercises'
    }
];

const HistoryPage = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchConversationHistory = async () => {
            try {
                setLoading(true);
                // Removed artificial timeout delay - load data immediately
                setConversations(mockConversations);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching conversation history:", error);
                setError("Failed to load your conversation history");
                setLoading(false);
            }
        };
        
        fetchConversationHistory();
    }, []);
    
    // Memoized filtered conversations based on search and time period
    const filteredConversations = useMemo(() => {
        let filtered = [...conversations];
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(conv => 
                conv.gptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.summary.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply time period filter
        if (filterPeriod !== 'all') {
            const now = new Date();
            let cutoffDate;
            
            switch (filterPeriod) {
                case 'today':
                    cutoffDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    cutoffDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                default:
                    cutoffDate = null;
            }
            
            if (cutoffDate) {
                filtered = filtered.filter(conv => new Date(conv.timestamp) >= cutoffDate);
            }
        }
        
        return filtered;
    }, [conversations, searchTerm, filterPeriod]);
    
    const formatTimestamp = useCallback((timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Today - show time
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }, []);
    
    const handleContinueConversation = useCallback((conv) => {
        navigate(`/user?gptId=${conv.gptId}&conversationId=${conv.id}`);
    }, [navigate]);
    
    const confirmDeleteConversation = useCallback((conv, e) => {
        e.stopPropagation();
        setSelectedConversation(conv);
        setShowDeleteConfirm(true);
    }, []);
    
    const handleDeleteConversation = useCallback(() => {
        if (!selectedConversation) return;
        
        setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
        setShowDeleteConfirm(false);
        setSelectedConversation(null);
    }, [selectedConversation]);
    
    const cancelDelete = useCallback(() => {
        setShowDeleteConfirm(false);
        setSelectedConversation(null);
    }, []);
    
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);
    
    const handleFilterChange = useCallback((e) => {
        setFilterPeriod(e.target.value);
    }, []);
    
    // Loading indicator with reduced complexity
    if (loading && conversations.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black text-white p-4 sm:p-6 overflow-hidden">
            <div className="mb-5 flex-shrink-0 text-center md:text-left">
                <h1 className="text-xl sm:text-2xl font-bold">Conversation History</h1>
                <p className="text-gray-400 text-sm mt-1">View and continue your previous conversations</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 flex-shrink-0">
                <div className="relative w-full sm:w-auto sm:flex-1 max-w-lg">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <FiCalendar className="text-gray-400" size={18} />
                    <select
                        value={filterPeriod}
                        onChange={handleFilterChange}
                        className="bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-400">
                        <p className="text-lg mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center py-12">
                        <FiClock size={48} className="mb-4 text-gray-600" />
                        <p className="text-lg mb-2">
                            {searchTerm ? `No conversations matching "${searchTerm}"` : "No conversation history found"}
                        </p>
                        <p className="text-sm text-gray-500 max-w-md">
                            {searchTerm 
                                ? "Try a different search term or time filter" 
                                : "Start chatting with GPTs to see your conversation history here"}
                        </p>
                        
                        {!searchTerm && (
                            <button 
                                onClick={() => navigate('/user/collections')}
                                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                            >
                                Browse Collections
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">
                        {filteredConversations.map((conv) => (
                            <div 
                                key={conv.id} 
                                className="bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-4 cursor-pointer transition-all"
                                onClick={() => handleContinueConversation(conv)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mr-3">
                                            <span className="text-white font-medium">{conv.gptName.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{conv.gptName}</h3>
                                            <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                                <span className="flex items-center">
                                                    <IoEllipse size={6} className="mr-1 text-green-500" />
                                                    {conv.model}
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span>{conv.messageCount} messages</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xs text-gray-400">
                                            {formatTimestamp(conv.timestamp)}
                                        </span>
                                        <button
                                            onClick={(e) => confirmDeleteConversation(conv, e)}
                                            className="ml-3 p-1.5 text-gray-500 hover:text-red-400 rounded-full hover:bg-gray-700/50 transition-colors"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-3">
                                    <p className="text-gray-300 line-clamp-2 text-sm">{conv.lastMessage}</p>
                                </div>
                                
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {conv.summary}
                                    </span>
                                    <button 
                                        className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-white transition-colors"
                                    >
                                        <FiMessageSquare size={12} />
                                        Continue
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-5 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-medium mb-3">Delete Conversation</h3>
                        <p className="text-gray-300 mb-5">
                            Are you sure you want to delete this conversation with "{selectedConversation?.gptName}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConversation}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(HistoryPage); 
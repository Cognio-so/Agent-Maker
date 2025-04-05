import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  IoArrowBack,
  IoTimeOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoChevronDown,
  IoEllipse
} from 'react-icons/io5';
import { FiUser, FiUsers, FiBox, FiCalendar, FiMail } from 'react-icons/fi';
import axios from 'axios';

// Import team data
import { teamMembers } from './teamData';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const UserHistoryPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    dateRange: 'all', // 'today', 'week', 'month', 'all'
  });
  
  const filterDropdownRef = useRef(null);

  // Extract view type from query parameters
  const queryParams = new URLSearchParams(location.search);
  const previousView = queryParams.get('view') || 'team';

  // Fetch user data and conversations
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Find user from team members data
        const foundUser = teamMembers.find(member => member.id.toString() === userId);
        
        if (foundUser) {
          setUser(foundUser);
          
          // Generate mock conversations for this user
          const mockConversations = generateMockConversations();
          setConversations(mockConversations);
          setFilteredConversations(mockConversations);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Filter conversations based on search and date range
  useEffect(() => {
    let filtered = [...conversations];
    
    if (searchQuery) {
      filtered = filtered.filter(convo => 
        convo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        convo.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterOptions.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      if (filterOptions.dateRange === 'today') {
        cutoffDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (filterOptions.dateRange === 'week') {
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
      } else if (filterOptions.dateRange === 'month') {
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
      }
      
      filtered = filtered.filter(convo => new Date(convo.timestamp) >= cutoffDate);
    }
    
    setFilteredConversations(filtered);
  }, [searchQuery, filterOptions, conversations]);

  // Generate mock conversation data
  const generateMockConversations = () => {
    const titles = [
      'Project requirements discussion',
      'Customer feedback review',
      'Design brainstorming session',
      'Marketing strategy planning',
      'Budget allocation meeting',
      'Team performance review',
      'New feature exploration',
      'Product roadmap planning'
    ];
    
    const mockData = [];
    
    for (let i = 0; i < 15; i++) {
      const title = titles[Math.floor(Math.random() * titles.length)];
      
      const now = new Date();
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);
      
      const messageCount = Math.floor(Math.random() * 20) + 5;
      
      mockData.push({
        id: `conv-${i}`,
        title,
        summary: `Conversation with ${messageCount} messages`,
        messageCount,
        timestamp: timestamp.toISOString(),
      });
    }
    
    return mockData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const timeString = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let relativeString = '';
    if (diffDays === 0 && date.getDate() === now.getDate()) {
      relativeString = 'Today';
    } else if (diffDays === 0 || (diffDays === 1 && date.getDate() !== now.getDate())) {
      relativeString = 'Yesterday';
    } else if (diffDays < 7) {
      relativeString = `${diffDays} days ago`;
    }
    
    return relativeString ? `${relativeString}, ${timeString}` : `${formattedDate}, ${timeString}`;
  };

  // Set date range filter
  const setDateRangeFilter = (range) => {
    setFilterOptions(prev => ({
      ...prev,
      dateRange: range
    }));
    setFilterOpen(false);
  };

  // Click outside handling for filter dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterDropdownRef]);

  // CSS for hiding scrollbars
  const scrollbarHideStyles = `
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
  `;

  return (
    <div className="flex flex-col h-full bg-black text-gray-100 overflow-hidden">
      {/* Add hidden scrollbar styles */}
      <style>{scrollbarHideStyles}</style>
      
      {/* Back button - preserve view type */}
      <div className="px-6 pt-6 pb-3 flex-shrink-0">
        <button 
          onClick={() => navigate(`/admin/history?view=${previousView}`)}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <IoArrowBack size={18} className="mr-1" />
          <span>Back to History</span>
        </button>
      </div>
      
      {/* Main content area - side by side layout */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left side - User profile information */}
        <div className="lg:w-1/3 xl:w-1/4 p-6 border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto hide-scrollbar">
          {user && (
            <>
              <div className="flex items-center mb-6">
                <div className="h-14 w-14 bg-gray-600 rounded-full flex items-center justify-center text-white mr-4">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">{user.name}</h1>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 self-center ${user.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    {user.status}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center">
                    <FiUser className="mr-1" size={14} />
                    {user.role}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm">
                    <FiBox className="mr-2 text-gray-500" size={14} />
                    <span className="text-gray-400">Department:</span>
                    <span className="ml-2 text-white">{user.department}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiUsers className="mr-2 text-gray-500" size={14} />
                    <span className="text-gray-400">Position:</span>
                    <span className="ml-2 text-white">{user.position}</span>
                  </div>
                </div>
              </div>
              
              {/* Stats cards in a column */}
              <div className="space-y-3 mb-6">
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-900 mr-3">
                      <FiCalendar className="text-blue-300" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Joined</p>
                      <p className="text-sm text-white">{user?.joined || '--'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-900 mr-3">
                      <IoTimeOutline className="text-green-300" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Last Active</p>
                      <p className="text-sm text-white">{user?.lastActive || '--'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-900 mr-3">
                      <FiBox className="text-purple-300" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">GPTs</p>
                      <p className="text-sm text-white">{user?.assignedGPTs || 0} Assigned</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-orange-900 mr-3">
                      <FiMail className="text-orange-300" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Conversations</p>
                      <p className="text-sm text-white">{conversations.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional user info section */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-medium text-white mb-2">Recent Activity</h3>
                <p className="text-xs text-gray-400">Last login: {user.lastActive}</p>
                <p className="text-xs text-gray-400 mt-1">Total logins this month: 28</p>
                <p className="text-xs text-gray-400 mt-1">Average session: 45 minutes</p>
              </div>
            </>
          )}
        </div>
        
        {/* Right side - Conversation history */}
        <div className="lg:w-2/3 xl:w-3/4 flex flex-col overflow-hidden">
          {/* Header for conversations */}
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="text-xl font-semibold mb-1">Conversation History</div>
            <p className="text-sm text-gray-400">View all conversations for {user?.name || 'this team member'}</p>
            
            {/* Search and filter controls */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                <span>{filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex flex-1 sm:justify-end gap-2 self-center w-full sm:w-auto">
                <div className="relative flex-1 sm:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoSearchOutline className="text-gray-500" size={18} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-colors"
                  >
                    <IoFilterOutline size={16} className="mr-1.5" />
                    <span>Filter</span>
                    <IoChevronDown size={14} className={`ml-1 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {filterOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-lg bg-gray-900 border border-gray-700 shadow-2xl z-20 p-4">
                      <div>
                        <h3 className="text-gray-300 font-medium text-sm mb-2">Time Period</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['today', 'week', 'month', 'all'].map((range) => (
                            <button
                              key={range}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                filterOptions.dateRange === range
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                              }`}
                              onClick={() => setDateRangeFilter(range)}
                            >
                              {range === 'all' ? 'All Time' : `Last ${range}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Conversation list - scrollable */}
          <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-500 animate-spin"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 px-4">
                <div className="border-2 border-gray-800 rounded-full p-4 mb-4">
                  <IoTimeOutline size={32} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-1">No Conversations Found</h3>
                <p className="text-sm max-w-sm">
                  {searchQuery || filterOptions.dateRange !== 'all'
                    ? "No conversations match your current filters. Try adjusting your search or filter criteria."
                    : `${user?.name || 'This user'} doesn't have any recorded conversations yet.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => {/* Navigate to conversation detail page */}}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-200">{conversation.title}</h3>
                      <span className="text-xs text-gray-500">{formatTimestamp(conversation.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{conversation.summary}</p>
                    <div className="mt-2 text-xs text-gray-600">
                      {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHistoryPage; 
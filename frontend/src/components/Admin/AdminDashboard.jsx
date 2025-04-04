import React, { useState, useRef, useEffect, useMemo } from 'react';
import AdminSidebar from './AdminSidebar';
import CreateCustomGpt from './CreateCustomGpt';
import { FiSearch, FiChevronDown, FiChevronUp, FiGrid, FiList, FiMenu } from 'react-icons/fi';
import AgentCard from './AgentCard';
import CategorySection from './CategorySection';
import axios from 'axios';

// Default image for agents without images

// API URL from environment variables
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const AdminDashboard = ({ userName = "Admin User" }) => {
    const [showCreateGpt, setShowCreateGpt] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortOption, setSortOption] = useState('Default');
    const [viewMode, setViewMode] = useState('grid');
    const sortOptions = ['Default', 'Latest', 'Older'];
    const dropdownRef = useRef(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [agentsData, setAgentsData] = useState({
        featured: [],
        productivity: [],
        education: [],
        entertainment: []
    });
    const [gptCreated, setGptCreated] = useState(false);
    
    // Fetch agents data from the backend
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                setLoading(true);
                console.log("Fetching from:", `${API_URL}/api/custom-gpts`); // Debug log
                const response = await axios.get(`${API_URL}/api/custom-gpts`, { 
                    withCredentials: true 
                });
                
                if (response.data.success && response.data.customGpts) {
                    // Sort by creation date (newest first)
                    const sortedGpts = [...response.data.customGpts].sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    
                    // Categorize GPTs based on their description or name
                    const categorizedData = {
                        featured: [],
                        productivity: [],
                        education: [],
                        entertainment: []
                    };
                    
                    // Take the 4 most recent for featured
                    categorizedData.featured = sortedGpts.slice(0, 4).map(gpt => ({
                        id: gpt._id,
                        image: gpt.imageUrl || defaultAgentImage,
                        name: gpt.name,
                        status: Math.random() > 0.5 ? 'online' : 'offline', // Random status for demo
                        userCount: Math.floor(Math.random() * 100) + 10, // Random metrics for demo
                        messageCount: Math.floor(Math.random() * 400) + 50,
                        modelType: gpt.model
                    }));
                    
                    // Categorize the rest based on keywords in description or name
                    sortedGpts.forEach(gpt => {
                        const text = (gpt.description + ' ' + gpt.name).toLowerCase();
                        const agent = {
                            id: gpt._id,
                            image: gpt.imageUrl || defaultAgentImage,
                            name: gpt.name,
                            status: Math.random() > 0.5 ? 'online' : 'offline',
                            userCount: Math.floor(Math.random() * 100) + 10,
                            messageCount: Math.floor(Math.random() * 400) + 50,
                            modelType: gpt.model
                        };
                        
                        // Skip if already in featured
                        if (categorizedData.featured.some(a => a.name === gpt.name)) {
                            return;
                        }
                        
                        if (text.includes('work') || text.includes('task') || text.includes('productivity')) {
                            categorizedData.productivity.push(agent);
                        } else if (text.includes('learn') || text.includes('study') || text.includes('education')) {
                            categorizedData.education.push(agent);
                        } else if (text.includes('game') || text.includes('movie') || text.includes('fun')) {
                            categorizedData.entertainment.push(agent);
                        } else {
                            // Random assignment if no match
                            const categories = ['productivity', 'education', 'entertainment'];
                            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                            categorizedData[randomCategory].push(agent);
                        }
                    });
                    
                    setAgentsData(categorizedData);
                }
            } catch (err) {
                console.error("Error fetching agents:", err);
                console.log("Full error details:", err.response?.data || err.message); // More detailed logging
                setError("Failed to load agents data");
            } finally {
                setLoading(false);
            }
        };
        
        fetchAgents();
    }, [gptCreated]);
    
    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 640) {
                setShowSidebar(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter agents based on search term
    const filteredAgentsData = useMemo(() => {
        if (!searchTerm.trim()) {
            return agentsData;
        }
        const searchTermLower = searchTerm.toLowerCase();
        const filtered = {};
        Object.keys(agentsData).forEach(category => {
            filtered[category] = agentsData[category].filter(agent => 
                agent.name.toLowerCase().includes(searchTermLower) ||
                agent.modelType.toLowerCase().includes(searchTermLower)
            );
        });
        return filtered;
    }, [searchTerm, agentsData]);

    // Sort agents based on sort option
    useEffect(() => {
        if (sortOption === 'Default') return;
        
        const sortedAgents = {...agentsData};
        const sortFn = sortOption === 'Latest' 
            ? (a, b) => b.userCount - a.userCount 
            : (a, b) => a.userCount - b.userCount;
            
        Object.keys(sortedAgents).forEach(category => {
            sortedAgents[category] = [...sortedAgents[category]].sort(sortFn);
        });
        
        setAgentsData(sortedAgents);
    }, [sortOption]);

    // Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleSortChange = (option) => {
        setSortOption(option);
        setIsSortOpen(false);
        console.log("Sorting by:", option);
    };

    // Check if we have any search results
    const hasSearchResults = Object.values(filteredAgentsData).some(
        category => category.length > 0
    );

    // Loading state
    if (loading) {
        return (
            <div className="flex h-screen bg-black text-white items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex h-screen bg-black text-white items-center justify-center">
                <div className="text-center p-4">
                    <p className="text-red-500 mb-2">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 px-4 py-2 rounded text-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div 
                    className="fixed inset-0 bg-black/80 z-40 sm:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}
            
            {/* Mobile Sidebar (conditionally rendered) */}
            {showSidebar && (
                <div className="sm:hidden fixed inset-y-0 left-0 z-50"> 
                    <AdminSidebar />
                </div>
            )}
            
           
            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden"> 
                {!showCreateGpt ? (
                    <>
                        {/* Header Section - Revised Layout */}
                        <div className="bg-black px-4 sm:px-6 py-4 border-b border-gray-800 flex-shrink-0">
                            {/* Desktop Header (One Row) */}
                            <div className="hidden sm:flex items-center justify-between">
                                <h1 className="text-lg md:text-xl font-bold">Admin-Dashboard</h1>
                                <div className="flex items-center gap-4">
                                    {/* Desktop Search */}
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search for GPTs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-56 md:w-64 pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    {/* Desktop Create Button */}
                                    <button
                                        onClick={() => setShowCreateGpt(true)}
                                        className="bg-white/90 text-black px-4 py-2 rounded-lg font-semibold transform hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        Create Custom GPTs
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Header (Two Rows) */}
                            <div className="block sm:hidden">
                                {/* Mobile Row 1: Menu + Title */}
                                <div className="flex items-center mb-3">
                                    <button 
                                        onClick={() => setShowSidebar(!showSidebar)}
                                        className="p-1.5 rounded-lg hover:bg-gray-800 mr-3"
                                    >
                                        <FiMenu size={20} />
                                    </button>
                                    {/* Added flex-1 and text-center to center the title */}
                                    <h1 className="flex-1 text-center text-xl font-bold">Admin-Dashboard</h1>
                                    {/* Placeholder div for balance, adjust width if needed (approx button width + margin) */}
                                    <div className="w-[46px] flex-shrink-0"></div> 
                                </div>
                                {/* Mobile Row 2: Search + Create Button */}
                                <div className="flex items-center gap-3">
                                    {/* Mobile Search Input */}
                                    <div className="flex-1 relative">
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search for GPTs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    {/* Mobile Create Button */}
                                    <button
                                        onClick={() => setShowCreateGpt(true)}
                                        className="bg-white/90 text-black px-3 py-2 rounded-lg font-medium whitespace-nowrap"
                                    >
                                        Create GPTs
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area - Changed: removed overflow-y-auto, added overflow-hidden */}
                        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden"> 
                            {searchTerm && !hasSearchResults ? (
                                <div className="text-center py-8 text-gray-400 flex-shrink-0">
                                    No agents found matching "{searchTerm}"
                                </div>
                            ) : (
                                <>
                                    {/* Featured Agents Section - Added flex-shrink-0 */}
                                    {(!searchTerm || filteredAgentsData.featured.length > 0) && (
                                        <div className="mb-6 flex-shrink-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-base sm:text-lg md:text-xl font-semibold">Featured Agents</h2>
                                                <span className="text-xs md:text-sm text-blue-400 cursor-pointer hover:text-blue-300">View All</span>
                                            </div>
                                            {/* Use grid layout for both mobile (1 col) and desktop */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                                {filteredAgentsData.featured.map((agent, index) => (
                                                    <AgentCard
                                                        key={index}
                                                        agentId={agent.id}
                                                        agentImage={agent.image}
                                                        agentName={agent.name}
                                                        status={agent.status}
                                                        userCount={agent.userCount}
                                                        messageCount={agent.messageCount}
                                                        modelType={agent.modelType}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Categories Header and Sort - Added flex-shrink-0 */}
                                    <div className="flex flex-wrap items-center justify-between mb-4 gap-2 flex-shrink-0">
                                        <h2 className="text-base sm:text-lg md:text-xl font-semibold">Categories:</h2>
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                onClick={() => setIsSortOpen(!isSortOpen)}
                                                className="flex items-center text-xs md:text-sm text-gray-400 hover:text-white transition-colors py-1 px-2 md:px-3 bg-gray-800 rounded-lg"
                                            >
                                                Sort: {sortOption}
                                                {isSortOpen ? <FiChevronUp className="ml-1 md:ml-2" /> : <FiChevronDown className="ml-1 md:ml-2" />}
                                            </button>
                                            {isSortOpen && (
                                                <div className="absolute top-full right-0 mt-1 w-32 md:w-36 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700 overflow-hidden">
                                                    {/* Dropdown items */}
                                                    <ul>
                                                        {sortOptions.map((option) => (
                                                            <li key={option}>
                                                                <button
                                                                    onClick={() => handleSortChange(option)}
                                                                    className={`block w-full text-left px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm ${sortOption === option ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'} transition-colors`}
                                                                >
                                                                    {option}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Scrollable Container for Categories - Changed: added flex-1, removed max-h */}
                                    <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"> 
                                        {/* Render Categories using CategorySection */}
                                        {Object.entries(filteredAgentsData).map(([category, agents]) => {
                                            if (category === 'featured' || agents.length === 0) return null;
                                            
                                            const categoryTitle = category
                                                .replace(/([A-Z])/g, ' $1') 
                                                .replace(/^./, (str) => str.toUpperCase()); 
                                            
                                            return (
                                                <CategorySection 
                                                    key={category}
                                                    title={categoryTitle} 
                                                    agentCount={agents.length} 
                                                    agents={agents} 
                                                />
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full">
                        <CreateCustomGpt 
                            onGoBack={() => setShowCreateGpt(false)} 
                            onGptCreated={() => {
                                setGptCreated(prev => !prev);
                                setShowCreateGpt(false);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
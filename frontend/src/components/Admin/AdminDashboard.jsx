import React, { useState, useRef, useEffect, useMemo } from 'react';
import AdminSidebar from './AdminSidebar';
import CreateCustomGpt from './CreateCustomGpt';
import { FiSearch, FiChevronDown, FiChevronUp, FiGrid, FiList } from 'react-icons/fi';
import AgentCard from './AgentCard';
import CategorySection from './CategorySection';

// Sample image URLs (replace with your actual image URLs)
const agentImage1 = "/images/agent1.png";
const agentImage2 = "/images/agent2.png";
const agentImage3 = "/images/agent3.png";
const agentImage4 = "/images/agent4.png";

// Sample data for agents
const agentsData = {
    featured: [
        { image: agentImage1, name: "Agent-1", status: "online", userCount: 50, messageCount: 120, modelType: "GPT-3.5" },
        { image: agentImage2, name: "Agent-2", status: "offline", userCount: 30, messageCount: 55, modelType: "GPT-4" },
        { image: agentImage3, name: "Agent-3", status: "online", userCount: 75, messageCount: 200, modelType: "Gemini Pro" },
        { image: agentImage4, name: "Agent-4", status: "offline", userCount: 40, messageCount: 78, modelType: "Claude 2" }
    ],
    favourites: [
        { image: agentImage1, name: "Agent-1", status: "online", userCount: 50, messageCount: 120, modelType: "GPT-3.5" },
        { image: agentImage2, name: "Agent-2", status: "offline", userCount: 30, messageCount: 55, modelType: "GPT-4" },
        { image: agentImage3, name: "Agent-3", status: "online", userCount: 75, messageCount: 200, modelType: "Gemini Pro" },
        { image: agentImage4, name: "Agent-4", status: "offline", userCount: 40, messageCount: 78, modelType: "Claude 2" }
    ],
    resume: [
        { image: agentImage3, name: "Agent-3", status: "online", userCount: 75, messageCount: 200, modelType: "Gemini Pro" },
        { image: agentImage1, name: "Agent-1", status: "online", userCount: 50, messageCount: 120, modelType: "GPT-3.5" },
        { image: agentImage2, name: "Agent-2", status: "offline", userCount: 30, messageCount: 55, modelType: "GPT-4" },
        { image: agentImage4, name: "Agent-4", status: "offline", userCount: 40, messageCount: 78, modelType: "Claude 2" }
    ],
    contentWriting: [
        { image: agentImage4, name: "Agent-4", status: "offline", userCount: 40, messageCount: 78, modelType: "Claude 2" },
        { image: agentImage1, name: "Agent-1", status: "online", userCount: 50, messageCount: 120, modelType: "GPT-3.5" },
        { image: agentImage2, name: "Agent-2", status: "offline", userCount: 30, messageCount: 55, modelType: "GPT-4" },
        { image: agentImage3, name: "Agent-3", status: "online", userCount: 75, messageCount: 200, modelType: "Gemini Pro" }
    ],
    coding: [
        { image: agentImage1, name: "Agent-1", status: "online", userCount: 50, messageCount: 120, modelType: "GPT-3.5" },
        { image: agentImage2, name: "Agent-2", status: "offline", userCount: 30, messageCount: 55, modelType: "GPT-4" },
        { image: agentImage3, name: "Agent-3", status: "online", userCount: 75, messageCount: 200, modelType: "Gemini Pro" },
        { image: agentImage4, name: "Agent-4", status: "offline", userCount: 40, messageCount: 78, modelType: "Claude 2" }
    ],
    marketing: [
        { image: agentImage2, name: "Agent-2", status: "offline", userCount: 30, messageCount: 55, modelType: "GPT-4" },
        { image: agentImage1, name: "Agent-1", status: "online", userCount: 50, messageCount: 120, modelType: "GPT-3.5" },
        { image: agentImage3, name: "Agent-3", status: "online", userCount: 75, messageCount: 200, modelType: "Gemini Pro" },
        { image: agentImage4, name: "Agent-4", status: "offline", userCount: 40, messageCount: 78, modelType: "Claude 2" }
    ]
};

// Assuming userName might be passed as a prop or fetched from context/state
const AdminDashboard = ({ userName = "Admin User" }) => {
    const [showCreateGpt, setShowCreateGpt] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const [isSortOpen, setIsSortOpen] = useState(false); // State for dropdown visibility
    const [sortOption, setSortOption] = useState('Default'); // State for selected sort option
    const [viewMode, setViewMode] = useState('grid'); // grid or list view
    const sortOptions = ['Default', 'Latest', 'Older']; // Available sort options
    const dropdownRef = useRef(null); // Ref for detecting clicks outside dropdown

    // Filter agents based on search term
    const filteredAgentsData = useMemo(() => {
        if (!searchTerm.trim()) {
            return agentsData; // Return all data if search term is empty
        }
        
        const searchTermLower = searchTerm.toLowerCase();
        
        // Create a filtered copy of the agentsData object
        const filtered = {};
        
        // Filter each category
        Object.keys(agentsData).forEach(category => {
            filtered[category] = agentsData[category].filter(agent => 
                agent.name.toLowerCase().includes(searchTermLower) ||
                agent.modelType.toLowerCase().includes(searchTermLower)
            );
        });
        
        return filtered;
    }, [searchTerm]);

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
        // Add logic here to actually sort the agents based on the selected option
        console.log("Sorting by:", option);
    };

    // Check if we have any search results
    const hasSearchResults = Object.values(filteredAgentsData).some(
        category => category.length > 0
    );

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {!showCreateGpt ? (
                    <div className="flex flex-col h-full">
                        {/* Header Section */}
                        <div className="bg-black px-6 py-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
                            <h1 className="text-xl font-bold">Admin-Dashboard</h1>
                            <div className="flex items-center gap-4">
                                {/* Search Bar */}
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search for GPTs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64 pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                {/* Create Button */}
                                <button
                                    onClick={() => setShowCreateGpt(true)}
                                    className="bg-white/90 text-black relative px-6 py-2 rounded-lg font-semibold transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Create Custom GPTs
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-hidden p-6">
                            <div className="flex flex-col h-full">
                                {searchTerm && !hasSearchResults ? (
                                    <div className="text-center py-8 text-gray-400">
                                        No agents found matching "{searchTerm}"
                                    </div>
                                ) : (
                                    <>
                                        {/* Featured Agents Section - Only show if no search or if there are results */}
                                        {(!searchTerm || filteredAgentsData.featured.length > 0) && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold">Featured Agents</h2>
                                        <span className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">View All</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {filteredAgentsData.featured.map((agent, index) => (
                                                        <AgentCard
                                                            key={index}
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

                                {/* Categories Section */}
                                <div className="flex-1 overflow-auto pr-1 categories-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    <style jsx>{`
                                        .categories-container::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>

                                    {/* Sort By Section */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold">Categories:</h2>
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                onClick={() => setIsSortOpen(!isSortOpen)}
                                                className="flex items-center text-sm text-gray-400 hover:text-white transition-colors py-1 px-3 bg-gray-800 rounded-lg"
                                            >
                                                Sort: {sortOption}
                                                {isSortOpen ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
                                            </button>
                                            {isSortOpen && (
                                                <div className="absolute top-full right-0 mt-1 w-36 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700 overflow-hidden">
                                                    <ul>
                                                        {sortOptions.map((option) => (
                                                            <li key={option}>
                                                                <button
                                                                    onClick={() => handleSortChange(option)}
                                                                    className={`block w-full text-left px-4 py-2 text-sm ${sortOption === option ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'} transition-colors`}
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

                                            {/* Category Sections - Only render categories with matches */}
                                            {filteredAgentsData.favourites.length > 0 && (
                                                <CategorySection 
                                                    title="Favourites" 
                                                    agentCount={filteredAgentsData.favourites.length} 
                                                    agents={filteredAgentsData.favourites} 
                                                />
                                            )}
                                            
                                            {filteredAgentsData.resume.length > 0 && (
                                                <CategorySection 
                                                    title="Resume" 
                                                    agentCount={filteredAgentsData.resume.length} 
                                                    agents={filteredAgentsData.resume} 
                                                />
                                            )}
                                            
                                            {filteredAgentsData.contentWriting.length > 0 && (
                                                <CategorySection 
                                                    title="Content Writing" 
                                                    agentCount={filteredAgentsData.contentWriting.length} 
                                                    agents={filteredAgentsData.contentWriting} 
                                                />
                                            )}
                                            
                                            {filteredAgentsData.coding.length > 0 && (
                                                <CategorySection 
                                                    title="Coding" 
                                                    agentCount={filteredAgentsData.coding.length} 
                                                    agents={filteredAgentsData.coding} 
                                                />
                                            )}
                                            
                                            {filteredAgentsData.marketing.length > 0 && (
                                                <CategorySection 
                                                    title="Marketing" 
                                                    agentCount={filteredAgentsData.marketing.length} 
                                                    agents={filteredAgentsData.marketing} 
                                                />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full">
                        <CreateCustomGpt onGoBack={() => setShowCreateGpt(false)} />
                    </div>
                )}
            </div>
        </div>
    );
};

// Add this to your CSS or a style tag
const modalStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
`;

export default AdminDashboard;

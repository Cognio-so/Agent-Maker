import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import axios from 'axios';
import { FiSearch, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axiosInstance';

// Memoized GPT card component
const GptCard = memo(({ gpt, formatDate, onChatClick }) => (
  <div 
    key={gpt._id} 
    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all shadow-lg hover:shadow-xl flex flex-col"
  >
    <div className="h-24 sm:h-32 bg-gradient-to-br from-gray-700 to-gray-900 relative flex-shrink-0">
      {gpt.imageUrl ? (
        <img 
          src={gpt.imageUrl} 
          alt={gpt.name} 
          className="w-full h-full object-cover opacity-70"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50">
          <span className="text-3xl sm:text-4xl text-white/30">{gpt.name.charAt(0)}</span>
        </div>
      )}
    </div>
    
    <div className="p-3 sm:p-4 flex-grow flex flex-col">
      <div className="flex items-start justify-between mb-1.5 sm:mb-2">
        <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{gpt.name}</h3>
        <div className="flex items-center flex-shrink-0 gap-1 bg-gray-700 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
          <span>{gpt.model}</span>
        </div>
      </div>
      
      <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 mb-auto">
        {gpt.description}
      </p>
      
      <div className="mt-auto pt-2 border-t border-gray-700 text-[10px] sm:text-xs text-gray-400 flex justify-between items-center">
        <span>Assigned: {formatDate(gpt.assignedAt || new Date())}</span>
        {gpt.capabilities?.webBrowsing && (
          <span className="whitespace-nowrap bg-green-900/40 text-green-200 px-1.5 py-0.5 rounded-full">Web</span>
        )}
      </div>
      
      <button 
        className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm font-medium flex items-center justify-center gap-2"
        onClick={(e) => onChatClick(gpt._id, e)}
      >
        <FiMessageSquare size={16} />
        Chat with GPT
      </button>
    </div>
  </div>
));

const CollectionsPage = () => {
    const [assignedGpts, setAssignedGpts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [showSortOptions, setShowSortOptions] = useState(false);
    const sortDropdownRef = useRef(null);
    const navigate = useNavigate();
    
    // Use async function with proper error handling
    const fetchAssignedGpts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/custom-gpts/user/assigned`, {
                withCredentials: true
            });
            
            if (response.data.success && response.data.gpts) {
                setAssignedGpts(response.data.gpts);
                setError(null);
            } else {
                console.warn("API response successful but 'gpts' field missing:", response.data);
                setAssignedGpts([]);
                setError("Received unexpected data format for assigned GPTs.");
            }
        } catch (error) {
            console.error("Error fetching assigned GPTs:", error);
            const errorMsg = error.response?.data?.message || "Failed to load your assigned GPTs";
            setError(errorMsg);
            setAssignedGpts([]);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchAssignedGpts();
    }, [fetchAssignedGpts]);

    // Memoized click outside handler
    const handleClickOutside = useCallback((event) => {
        if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
            setShowSortOptions(false);
        }
    }, []);

    // Close sort dropdown when clicking outside
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);
    
    // Memoized filtered and sorted GPTs 
    const filteredGpts = useMemo(() => {
        if (!Array.isArray(assignedGpts)) {
            return [];
        }
        return assignedGpts
            .filter(gpt => 
                gpt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (gpt.description && gpt.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .sort((a, b) => {
                const dateA = a.assignedAt ? new Date(a.assignedAt) : new Date(0); 
                const dateB = b.assignedAt ? new Date(b.assignedAt) : new Date(0);

                switch (sortOption) {
                    case 'newest':
                        return dateB - dateA;
                    case 'oldest':
                        return dateA - dateB;
                    case 'alphabetical':
                        return a.name.localeCompare(b.name);
                    default:
                        return dateB - dateA;
                }
            });
    }, [assignedGpts, searchTerm, sortOption]);
    
    // Memoized formatDate function
    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }, []);

    // Memoized event handlers
    const handleChatClick = useCallback((gptId, e) => {
        e.stopPropagation(); 
        navigate(`/employee?gptId=${gptId}`);
    }, [navigate]);
    
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);
    
    const toggleSortOptions = useCallback(() => {
        setShowSortOptions(prev => !prev);
    }, []);
    
    const handleSortOptionSelect = useCallback((option) => {
        setSortOption(option);
        setShowSortOptions(false);
    }, []);
    
    const handleRetry = useCallback(() => {
        fetchAssignedGpts();
    }, [fetchAssignedGpts]);
    
    // Simplified loading state
    if (loading && assignedGpts.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black text-white p-4 sm:p-6 overflow-hidden">
            <div className="mb-4 md:mb-6 flex-shrink-0 text-center md:text-left">
                <h1 className="text-xl sm:text-2xl font-bold">Your Collections</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4 flex-shrink-0">
                <div className="relative flex-grow sm:flex-grow-0">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search GPTs..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full sm:w-52 md:w-64 pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
                
                <div className="relative" ref={sortDropdownRef}>
                    <button 
                        onClick={toggleSortOptions}
                        className="flex items-center justify-between w-full sm:w-36 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
                    >
                        <span className="truncate">Sort: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</span>
                        {showSortOptions ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
                    </button>
                    
                    {showSortOptions && (
                        <div className="absolute z-10 w-full sm:w-36 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden text-sm">
                            <button 
                                className={`block w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${sortOption === 'newest' ? 'bg-blue-600' : ''}`}
                                onClick={() => handleSortOptionSelect('newest')}
                            >
                                Newest
                            </button>
                            <button 
                                className={`block w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${sortOption === 'oldest' ? 'bg-blue-600' : ''}`}
                                onClick={() => handleSortOptionSelect('oldest')}
                            >
                                Oldest
                            </button>
                            <button 
                                className={`block w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${sortOption === 'alphabetical' ? 'bg-blue-600' : ''}`}
                                onClick={() => handleSortOptionSelect('alphabetical')}
                            >
                                Alphabetical
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-400">
                        <p className="text-lg mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredGpts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                        <p className="text-lg mb-4">
                            {searchTerm ? `No GPTs matching "${searchTerm}"` : "You don't have any assigned GPTs yet"}
                        </p>
                        <p className="text-sm text-gray-500">
                            Contact your administrator to get access to custom GPTs
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredGpts.map((gpt) => (
                            <GptCard 
                                key={gpt._id}
                                gpt={gpt} 
                                formatDate={formatDate} 
                                onChatClick={handleChatClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(CollectionsPage); 
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiSearch, FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';
import { SiOpenai, SiGooglegemini } from 'react-icons/si';
import { FaRobot } from 'react-icons/fa6';
import { BiLogoMeta } from 'react-icons/bi';
import { RiOpenaiFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axiosInstance';

// Model icons mapping - moved outside component to prevent recreation
const modelIcons = {
    'gpt-4': <RiOpenaiFill className="text-green-500" size={18} />,
    'gpt-3.5': <SiOpenai className="text-green-400" size={16} />,
    'claude': <FaRobot className="text-purple-400" size={16} />,
    'gemini': <SiGooglegemini className="text-blue-400" size={16} />,
    'llama': <BiLogoMeta className="text-blue-500" size={18} />
};

// Memoized GPT card component
const GptCard = memo(({ gpt, onDelete, onEdit, formatDate, onNavigate }) => (
    <div 
        key={gpt._id} 
        className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all shadow-lg hover:shadow-xl flex flex-col cursor-pointer"
        onClick={() => onNavigate(`/admin/chat/${gpt._id}`)}
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
            
            <div className="absolute top-2 right-2 flex gap-1.5">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(gpt._id);
                    }}
                    className="p-1.5 sm:p-2 bg-gray-900/70 rounded-full hover:bg-blue-700/80 transition-colors"
                    title="Edit GPT"
                >
                    <FiEdit size={14} />
                </button>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(gpt._id);
                    }}
                    className="p-1.5 sm:p-2 bg-gray-900/70 rounded-full hover:bg-red-700/80 transition-colors"
                    title="Delete GPT"
                >
                    <FiTrash2 size={14} />
                </button>
            </div>
        </div>
        
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{gpt.name}</h3>
                <div className="flex items-center flex-shrink-0 gap-1 bg-gray-700 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
                    {React.cloneElement(modelIcons[gpt.model] || <FaRobot />, { size: 12 })}
                    <span className="hidden sm:inline">{gpt.model}</span>
                </div>
            </div>
            
            <p className="text-gray-300 text-xs sm:text-sm h-10 sm:h-12 line-clamp-2 sm:line-clamp-3 mb-3">
                {gpt.description}
            </p>
            
            <div className="mt-auto pt-2 border-t border-gray-700 text-[10px] sm:text-xs text-gray-400 flex justify-between items-center">
                <span>Created: {formatDate(gpt.createdAt)}</span>
                {gpt.knowledgeFiles?.length > 0 && (
                    <span className="whitespace-nowrap">{gpt.knowledgeFiles.length} {gpt.knowledgeFiles.length === 1 ? 'file' : 'files'}</span>
                )}
            </div>
        </div>
    </div>
));

const CollectionsPage = () => {
    const [customGpts, setCustomGpts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [showSortOptions, setShowSortOptions] = useState(false);
    const sortDropdownRef = useRef(null);
    const navigate = useNavigate();

    // Memoized fetchCustomGpts function
    const fetchCustomGpts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/custom-gpts`, { withCredentials: true });
            
            if (response.data.success) {
                setCustomGpts(response.data.customGpts);
            } else {
                setError("Failed to fetch custom GPTs");
            }
        } catch (err) {
            console.error("Error fetching custom GPTs:", err);
            setError("Error connecting to server");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomGpts();
    }, [fetchCustomGpts]);

    // Memoized click outside handler
    const handleClickOutside = useCallback((event) => {
        if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
            setShowSortOptions(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    // Memoized event handlers
    const handleDelete = useCallback(async (id) => {
        if (window.confirm("Are you sure you want to delete this GPT? This action cannot be undone.")) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/api/custom-gpts/${id}`, { withCredentials: true });
                
                if (response.data.success) {
                    setCustomGpts(prev => prev.filter(gpt => gpt._id !== id));
                }
            } catch (err) {
                console.error("Error deleting custom GPT:", err);
                alert("Failed to delete GPT");
            } finally {
                setLoading(false);
            }
        }
    }, []);

    const handleEdit = useCallback((id) => {
        navigate(`/admin/edit-gpt/${id}`);
    }, [navigate]);

    const handleCreateNew = useCallback(() => {
        navigate('/admin/create-gpt');
    }, [navigate]);
    
    const handleNavigate = useCallback((path) => {
        navigate(path);
    }, [navigate]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }, []);
    
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

    // Memoized filtered and sorted GPTs
    const filteredGpts = useMemo(() => {
        return customGpts
            .filter(gpt => {
                if (!searchTerm) return true;
                const searchLower = searchTerm.toLowerCase();
                return (
                    gpt.name.toLowerCase().includes(searchLower) || 
                    gpt.description.toLowerCase().includes(searchLower) ||
                    gpt.model.toLowerCase().includes(searchLower)
                );
            })
            .sort((a, b) => {
                switch (sortOption) {
                    case 'newest':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'oldest':
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    case 'alphabetical':
                        return a.name.localeCompare(b.name);
                    default:
                        return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });
    }, [customGpts, searchTerm, sortOption]);

    // Simplified loading indicator
    if (loading && customGpts.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black text-white p-4 sm:p-6 overflow-hidden">
            <div className="mb-4 md:mb-6 flex-shrink-0 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold">Collections</h1>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
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
                    
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-3 py-2 rounded-lg text-white font-medium transition-all text-sm whitespace-nowrap"
                    >
                        <FiPlus size={16}/>
                        <span>Create New</span>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-400">
                        <p className="text-lg mb-4">{error}</p>
                        <button
                            onClick={fetchCustomGpts}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredGpts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                        <p className="text-lg mb-4">
                            {searchTerm ? `No GPTs matching "${searchTerm}"` : "You haven't created any GPTs yet"}
                        </p>
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white"
                        >
                            <FiPlus />
                            <span>Create your first GPT</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredGpts.map((gpt) => (
                            <GptCard 
                                key={gpt._id}
                                gpt={gpt}
                                onDelete={handleDelete}
                                onEdit={handleEdit} 
                                formatDate={formatDate}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(CollectionsPage); 
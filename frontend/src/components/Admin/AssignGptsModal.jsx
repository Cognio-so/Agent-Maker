import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FiSearch, FiCheck } from 'react-icons/fi';
import { axiosInstance } from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const AssignGptsModal = ({ isOpen, onClose, teamMember }) => {
    const [allGpts, setAllGpts] = useState([]);
    const [selectedGpts, setSelectedGpts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [assignedGptIds, setAssignedGptIds] = useState(new Set());
    
    // Fetch all GPTs when the modal opens
    useEffect(() => {
        if (!isOpen || !teamMember) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all GPTs
                const allGptsResponse = await axiosInstance.get('/api/custom-gpts', {
                    withCredentials: true
                });
                
                if (allGptsResponse.data?.customGpts) {
                    setAllGpts(allGptsResponse.data.customGpts);
                }
                
                // Fetch user's already assigned GPTs
                const userGptsResponse = await axiosInstance.get(`/api/custom-gpts/team/members/${teamMember.id}/gpts`, {
                    withCredentials: true
                });
                
                if (userGptsResponse.data?.gpts) {
                    // Create a Set of assigned GPT IDs for easy lookup
                    const assignedIds = new Set(userGptsResponse.data.gpts.map(gpt => gpt._id));
                    setAssignedGptIds(assignedIds);
                }
            } catch (error) {
                console.error("Error fetching GPTs:", error);
                toast.error("Failed to load GPT data");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [isOpen, teamMember]);
    
    // Toggle selection of a GPT
    const toggleGptSelection = (gpt) => {
        setSelectedGpts(prev => {
            // Check if this GPT is already selected
            const isSelected = prev.some(g => g._id === gpt._id);
            
            if (isSelected) {
                // Remove it if already selected
                return prev.filter(g => g._id !== gpt._id);
            } else {
                // Add it if not selected
                return [...prev, gpt];
            }
        });
    };
    
    // Assign selected GPTs to the team member
    const handleAssignGpts = async () => {
        try {
            // For each selected GPT, make an API call to assign it
            const assignPromises = selectedGpts.map(gpt => 
                axiosInstance.post(`/api/custom-gpts/team/members/${teamMember.id}/gpts`, {
                    gptId: gpt._id
                }, { withCredentials: true })
            );
            
            // Wait for all assignments to complete
            await Promise.all(assignPromises);
            
            toast.success(`Successfully assigned ${selectedGpts.length} GPT${selectedGpts.length !== 1 ? 's' : ''} to ${teamMember.name}`);
            onClose(); // Close the modal after successful assignment
        } catch (error) {
            console.error("Error assigning GPTs:", error);
            toast.error("Failed to assign one or more GPTs");
        }
    };
    
    // Filter GPTs based on search term
    const filteredGpts = allGpts.filter(gpt => 
        gpt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gpt.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
            
            <div className="relative bg-gray-800 w-full max-w-2xl max-h-[90vh] rounded-xl shadow-xl border border-gray-700 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <h3 className="text-lg font-semibold text-white">
                        Assign GPTs to {teamMember?.name}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-700"
                    >
                        <IoClose size={20} />
                    </button>
                </div>
                
                {/* Search */}
                <div className="p-4 border-b border-gray-700">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search GPTs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                
                {/* GPT List - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredGpts.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                            No GPTs found
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 p-4">
                            {filteredGpts.map(gpt => {
                                const isAssigned = assignedGptIds.has(gpt._id);
                                const isSelected = selectedGpts.some(g => g._id === gpt._id);
                                
                                return (
                                    <div 
                                        key={gpt._id}
                                        className={`
                                            p-3 rounded-lg border border-gray-700
                                            ${isAssigned ? 'bg-blue-900/20' : 'bg-gray-700/50'} 
                                            ${isSelected ? 'ring-2 ring-blue-500' : ''}
                                            ${!isAssigned ? 'cursor-pointer hover:bg-gray-700' : 'cursor-default'}
                                        `}
                                        onClick={() => !isAssigned && toggleGptSelection(gpt)}
                                    >
                                        <div className="flex items-center">
                                            {/* GPT Image/Icon */}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                                                {gpt.imageUrl ? (
                                                    <img 
                                                        src={gpt.imageUrl} 
                                                        alt={gpt.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-lg text-white">{gpt.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            
                                            {/* GPT Info */}
                                            <div className="flex-1 mr-3">
                                                <h3 className="text-white font-medium">{gpt.name}</h3>
                                                <p className="text-xs text-gray-400 line-clamp-1">{gpt.description}</p>
                                            </div>
                                            
                                            {/* Selection Status */}
                                            <div className="flex-shrink-0">
                                                {isAssigned ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                                                        <FiCheck className="mr-1" />
                                                        Assigned
                                                    </span>
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-md border ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-500'} flex items-center justify-center`}>
                                                        {isSelected && <FiCheck className="text-white" size={14} />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center bg-gray-900">
                    <div className="text-sm text-gray-400">
                        {selectedGpts.length} GPTs selected
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignGpts}
                            disabled={selectedGpts.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Assign GPTs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignGptsModal; 
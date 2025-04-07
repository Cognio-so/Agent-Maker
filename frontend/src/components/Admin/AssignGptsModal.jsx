import React, { useState, useEffect } from 'react';
import { IoClose, IoCheckmark, IoSearch } from 'react-icons/io5';
import axios from 'axios';
import { toast } from 'react-toastify';
import { axiosInstance } from '../../api/axiosInstance';

const AssignGptsModal = ({ isOpen, onClose, teamMember, onAssignmentChanged }) => {
    const [availableGpts, setAvailableGpts] = useState([]);
    const [assignedGpts, setAssignedGpts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all GPTs and user's assigned GPTs when modal opens
    useEffect(() => {
        if (isOpen && teamMember) {
            fetchGpts();
            fetchAssignedGpts();
        }
    }, [isOpen, teamMember]);

    const fetchGpts = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/api/custom-gpts`, { withCredentials: true });
            
            if (response.data.success) {
                setAvailableGpts(response.data.customGpts);
            }
        } catch (error) {
            console.error("Error fetching GPTs:", error);
            toast.error("Failed to load available GPTs");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAssignedGpts = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                `/api/custom-gpts/team/members/${teamMember.id}/gpts`, 
                { withCredentials: true }
            );
            
            if (response.data.success) {
                setAssignedGpts(response.data.assignedGpts);
            }
        } catch (error) {
            console.error("Error fetching assigned GPTs:", error);
            setAssignedGpts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGptAssignment = async (gptId) => {
        const isCurrentlyAssigned = assignedGpts.some(gpt => gpt._id === gptId);
        
        try {
            setIsLoading(true);
            
            if (isCurrentlyAssigned) {
                // Unassign the GPT - updated URL
                await axiosInstance.delete(
                    `/api/custom-gpts/team/members/${teamMember.id}/gpts/${gptId}`, 
                    { withCredentials: true }
                );
                setAssignedGpts(assignedGpts.filter(gpt => gpt._id !== gptId));
                toast.success("GPT unassigned successfully");
            } else {
                // Assign the GPT - updated URL
                await axiosInstance.post(
                    `/api/custom-gpts/team/members/${teamMember.id}/gpts`, 
                    { gptId }, 
                    { withCredentials: true }
                );
                const gptToAssign = availableGpts.find(gpt => gpt._id === gptId);
                setAssignedGpts([...assignedGpts, gptToAssign]);
                toast.success("GPT assigned successfully");
            }

            // After successful assignment/unassignment
            if (onAssignmentChanged) {
                onAssignmentChanged();
            }
        } catch (error) {
            console.error("Error updating GPT assignment:", error);
            toast.error(isCurrentlyAssigned ? "Failed to unassign GPT" : "Failed to assign GPT");
        } finally {
            setIsLoading(false);
        }
    };

    // Filter GPTs based on search term
    const filteredGpts = availableGpts.filter(
        gpt => gpt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if a GPT is assigned
    const isGptAssigned = (gptId) => {
        return assignedGpts.some(gpt => gpt._id === gptId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-800 w-full max-w-md rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gray-900">
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
                <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
                    <div className="relative">
                        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search GPTs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                
                {/* GPT List */}
                <div className="max-h-96 overflow-y-auto p-2 scrollbar-hide">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredGpts.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            {searchTerm ? "No GPTs match your search" : "No GPTs available"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredGpts.map(gpt => (
                                <div 
                                    key={gpt._id}
                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                        isGptAssigned(gpt._id) 
                                            ? 'bg-blue-900/30 border border-blue-700/50' 
                                            : 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700'
                                    } transition-colors cursor-pointer`}
                                    onClick={() => toggleGptAssignment(gpt._id)}
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mr-3">
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
                                        <div>
                                            <h4 className="font-medium text-white">{gpt.name}</h4>
                                            <p className="text-xs text-gray-400 line-clamp-1">{gpt.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        isGptAssigned(gpt._id) 
                                            ? 'bg-blue-600' 
                                            : 'bg-gray-600'
                                    }`}>
                                        {isGptAssigned(gpt._id) && <IoCheckmark className="text-white" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Actions */}
                <div className="px-4 py-3 border-t border-gray-700 flex justify-end bg-gray-900">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignGptsModal; 
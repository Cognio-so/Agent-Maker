import React, { useState, useEffect } from 'react';
import { 
    IoClose, 
    IoPersonCircleOutline,
    IoMailOutline,
    IoBriefcaseOutline,
    IoCalendarOutline,
    IoTimeOutline,
    IoShieldCheckmarkOutline,
    IoAppsOutline
} from 'react-icons/io5';
import { FiBox, FiMessageSquare, FiActivity} from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const TeamMemberDetailsModal = ({ isOpen, onClose, member }) => {
    const [activeTab, setActiveTab] = useState('profile');

    if (!isOpen || !member) return null;

    // Calculate stats
    const memberSince = member.joined;
    const lastActive = member.lastActive;
    const totalAssignedGPTs = member.assignedGPTs;

    // Tab content components
    const renderProfileTab = () => (
        <div className="space-y-6 py-4">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl">
                    {member.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white">{member.name}</h2>
                    <p className="text-gray-400">{member.position}</p>
                </div>
            </div>

            {/* Member Info Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                        <IoPersonCircleOutline className="mr-2" size={18} />
                        Personal Information
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="text-sm text-white">{member.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Department</p>
                            <p className="text-sm text-white">{member.department}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Position</p>
                            <p className="text-sm text-white">{member.position}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                        <IoShieldCheckmarkOutline className="mr-2" size={18} />
                        Account Status
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400">Role</p>
                            <p className="text-sm text-white">{member.role}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <div className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm text-white">{member.status}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Joined</p>
                            <p className="text-sm text-white">{member.joined}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <FiActivity className="mr-2" size={18} />
                    Activity &amp; GPTs
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded p-3">
                        <p className="text-xs text-gray-400">Last Active</p>
                        <p className="text-sm font-medium text-white">{member.lastActive}</p>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                        <p className="text-xs text-gray-400">Assigned GPTs</p>
                        <p className="text-sm font-medium text-white">{member.assignedGPTs}</p>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                        <p className="text-xs text-gray-400">Usage Time</p>
                        <p className="text-sm font-medium text-white">24 hours</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAssignedGptsTab = () => {
        const handleRemoveGpt = (gptId) => {
            // In a real implementation, this would call the API to unassign the GPT
            console.log(`Removing GPT with ID: ${gptId} from user ${member.id}`);
        };

        return (
            <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Assigned GPTs ({member.assignedGPTs})</h3>
                    <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-3 py-1.5 flex items-center"
                    >
                        <FiBox className="mr-1.5" size={14} />
                        Assign GPTs
                    </button>
                </div>

                {member.assignedGPTs > 0 ? (
                    <div className="space-y-3">
                        {/* This is a placeholder - in a real app, you would map through actual assigned GPTs */}
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                                        <span className="text-lg text-white">G</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">GPT Assistant {index + 1}</h4>
                                        <p className="text-xs text-gray-400">AI assistant with specialized knowledge</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="text-xs text-gray-400 mr-4">
                                        Assigned: 2 weeks ago
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveGpt(`gpt-${index+1}`)}
                                        className="text-red-400 hover:text-red-300 p-1.5 hover:bg-gray-600 rounded-full transition-colors"
                                        title="Remove GPT"
                                    >
                                        <IoClose size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
                        <FiBox className="mx-auto text-gray-500" size={32} />
                        <p className="mt-2 text-gray-400">No GPTs assigned yet</p>
                        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-4 py-2">
                            Assign First GPT
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderActivityTab = () => (
        <div className="py-4">
            <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
            
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute top-0 bottom-0 left-2.5 w-0.5 bg-gray-700" />
                    
                    {[1, 2, 3, 4].map((item, index) => (
                        <div key={index} className="flex items-start mb-4 relative">
                            <div className="absolute left-0 mt-1.5">
                                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center ring-4 ring-gray-800 z-10">
                                    <FiMessageSquare size={12} className="text-white" />
                                </div>
                            </div>
                            
                            <div className="ml-10">
                                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                                    <p className="text-sm text-white">Used <span className="font-medium">Customer Support Assistant</span> GPT</p>
                                    <p className="text-xs text-gray-400 mt-1">Created 14 messages in conversation</p>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {index === 0 ? 'Today, 10:42 AM' : 
                                     index === 1 ? 'Yesterday, 3:30 PM' : 
                                     index === 2 ? 'Mar 28, 2023' : 'Mar 25, 2023'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderNotesTab = () => (
        <div className="py-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Notes</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">+ Add Note</button>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 mb-4">
                <textarea 
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Add notes about this team member..."
                ></textarea>
                <div className="flex justify-end mt-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-4 py-2">
                        Save Note
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className="text-sm text-white">Completed onboarding process, assigned initial GPTs for marketing tasks.</p>
                            <p className="text-xs text-gray-400 mt-2">Added by Admin User • Mar 20, 2023</p>
                        </div>
                        <button className="text-gray-500 hover:text-gray-400">
                            <IoClose size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
            
            <div className="relative bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl border border-gray-700 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <h3 className="text-lg font-semibold text-white">
                        Team Member Details
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-700"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex px-6 pt-4 border-b border-gray-700">
                    <button
                        className={`pb-3 px-4 text-sm font-medium border-b-2 ${
                            activeTab === 'profile' 
                                ? 'border-blue-500 text-blue-400' 
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                        } transition-colors duration-150`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`pb-3 px-4 text-sm font-medium border-b-2 ${
                            activeTab === 'gpts' 
                                ? 'border-blue-500 text-blue-400' 
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                        } transition-colors duration-150`}
                        onClick={() => setActiveTab('gpts')}
                    >
                        Assigned GPTs
                    </button>
                    <button
                        className={`pb-3 px-4 text-sm font-medium border-b-2 ${
                            activeTab === 'activity' 
                                ? 'border-blue-500 text-blue-400' 
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                        } transition-colors duration-150`}
                        onClick={() => setActiveTab('activity')}
                    >
                        Activity
                    </button>
                    <button
                        className={`pb-3 px-4 text-sm font-medium border-b-2 ${
                            activeTab === 'notes' 
                                ? 'border-blue-500 text-blue-400' 
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                        } transition-colors duration-150`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notes
                    </button>
                </div>
                
                {/* Tab Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
                    {activeTab === 'profile' && renderProfileTab()}
                    {activeTab === 'gpts' && renderAssignedGptsTab()}
                    {activeTab === 'activity' && renderActivityTab()}
                    {activeTab === 'notes' && renderNotesTab()}
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-700 flex justify-end bg-gray-900">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors mr-3"
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Edit Member
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamMemberDetailsModal; 
import React, { useState, useEffect, useCallback } from 'react';
import { 
    FiSearch, 
    FiFilter, 
    FiMoreVertical, 
    FiUser, 
    FiUsers, 
    FiBell, 
    FiBox, 
    FiCalendar, 
    FiMail, 
    FiEdit, 
    FiTrash2,
    FiChevronRight
} from 'react-icons/fi';
import AssignGptsModal from './AssignGptsModal';
import TeamMemberDetailsModal from './TeamMemberDetailsModal';
import InviteTeamMemberModal from './InviteTeamMemberModal';
import EditPermissionsModal from './EditPermissionsModal';
import { axiosInstance } from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// API URL from environment variables

// List of departments for filter dropdown (static data since backend doesn't have this info)
const departments = [
    'All Departments',
    'Product',
    'Engineering',
    'Design',
    'Marketing',
    'Sales',
    'Customer Support'
];

const TeamManagement = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(null);
    const [showDepartmentsDropdown, setShowDepartmentsDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [showAssignGptsModal, setShowAssignGptsModal] = useState(false);
    const [selectedMemberForGpts, setSelectedMemberForGpts] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedMemberForDetails, setSelectedMemberForDetails] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
    const [assignmentChanged, setAssignmentChanged] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
    const [selectedMemberForPermissions, setSelectedMemberForPermissions] = useState(null);
    
    // Add responsive detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Improved error handling for API calls
    const handleApiError = (error, defaultMessage) => {
        console.error(defaultMessage, error);
        const errorMessage = error.response?.data?.message || defaultMessage;
        toast?.error(errorMessage);
        return errorMessage;
    };
    
    // Function to format date (should be defined before use or moved outside component)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    // DEFINE fetchGptCounts FIRST
    const fetchGptCounts = useCallback(async (currentMembers) => { // Accept members as argument
        const membersToCount = currentMembers || teamMembers; 
        
        if (!membersToCount || membersToCount.length === 0) {
            return;
        }
        
        try {
            const response = await axiosInstance.get('/api/custom-gpts/team/gpt-counts', { 
                withCredentials: true 
            });
            
            
            if (response.data?.success && response.data?.userGptCounts) {
                const counts = response.data.userGptCounts;
                
                setTeamMembers(prev => {
                    const baseMembers = currentMembers || prev; 
                    const updatedMembers = baseMembers.map(member => {
                        const count = counts[member.id] || 0;
                        return {
                            ...member,
                            assignedGPTs: count
                        };
                    });
                    return updatedMembers;
                });
            } else {
                console.warn("GPT counts response was not successful or missing userGptCounts:", response.data);
            }
        } catch (err) {
            console.error("Error fetching GPT assignments:", err);
            toast.error("Could not load GPT assignment data");
        }
    }, []); // Empty dependency array is correct here

    // NOW DEFINE fetchUsers
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/auth/users`, { 
                withCredentials: true 
            });
            
            if (response.data && response.data.users) {
                const formattedUsers = response.data.users.map(user => {
                    const isActive = user.lastActive 
                        ? (new Date() - new Date(user.lastActive)) < 24 * 60 * 60 * 1000 
                        : false;
                    
                    return {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role || 'Employee',
                        department: user.department || 'Not Assigned',
                        position: user.position || '',
                        joined: formatDate(user.createdAt),
                        lastActive: user.lastActive ? formatDate(user.lastActive) : 'Never',
                        status: isActive ? 'Active' : 'Inactive',
                        assignedGPTs: 0
                    };
                });
                // Don't set state here directly if fetchGptCounts will do it
                // setTeamMembers(formattedUsers); 
                await fetchGptCounts(formattedUsers); // Pass the newly fetched users
                setError(null);
            } else {
                console.warn("API response missing users data, using sample data");
                // setTeamMembers(getSampleTeamData()); 
            }
        } catch (err) {
            console.error("Error fetching team members:", err);
            setError("Failed to load team data. Please check your connection.");
            // setTeamMembers(getSampleTeamData());
        } finally {
            setLoading(false);
        }
    // fetchGptCounts MUST be defined before this point
    }, [fetchGptCounts]); 

    // Initial mount effect - only fetches users
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); // Depends only on fetchUsers
    
    // Fetch pending invites count
    useEffect(() => {
        const fetchPendingInvites = async () => {
            try {
                const response = await axiosInstance.get(`/api/auth/pending-invites/count`, { 
                    withCredentials: true 
                });
                
                if (response.data && response.data.count !== undefined) {
                    setPendingInvitesCount(response.data.count);
                }
            } catch (err) {
                console.error("Error fetching pending invites count:", err);
                // Keep current count or set to 0
            }
        };
        
        fetchPendingInvites();
    }, []);
    
    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchesDepartment = selectedDepartment === 'All Departments' || 
                                 member.department === selectedDepartment;
                                 
        const matchesStatus = selectedStatus === 'All Status' || 
                             member.status === selectedStatus;
                             
        return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    const toggleActionsMenu = (memberId) => {
        setShowActionsMenu(showActionsMenu === memberId ? null : memberId);
    };
    
    const handleInviteMember = () => {
        setShowInviteModal(true);
    };

    const handleAssignGpts = (member) => {
        setSelectedMemberForGpts(member);
        setShowAssignGptsModal(true);
        setShowActionsMenu(null); // Close the actions menu
    };

    const handleViewMemberDetails = (member) => {
        setSelectedMemberForDetails(member);
        setShowDetailsModal(true);
    };

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

    // Email team member function
    const handleEmailTeamMember = async (email) => {
        // Open default email client with recipient's address
        window.location.href = `mailto:${email}`;
        setShowActionsMenu(null);
    };
    
    // Edit permissions function
    const handleEditPermissions = (member) => {
        setSelectedMemberForPermissions(member);
        setShowEditPermissionsModal(true);
        setShowActionsMenu(null); // Close the actions menu
    };
    
    // Handle remove team member
    const handleRemoveTeamMember = async (memberId) => {
        if (window.confirm("Are you sure you want to remove this team member?")) {
            try {
                // This endpoint would need to be implemented in the backend
                await axiosInstance.delete(`/api/auth/users/${memberId}`, {
                    withCredentials: true
                });
                
                // Remove user from local state
                setTeamMembers(prev => prev.filter(member => member.id !== memberId));
                toast?.success("Team member removed successfully");
            } catch (err) {
                handleApiError(err, "Failed to remove team member");
            }
        }
        setShowActionsMenu(null);
    };

    // Add function to handle permission updates
    const handlePermissionsUpdated = (updatedMember) => {
        setTeamMembers(prev => 
            prev.map(member => 
                member.id === updatedMember.id ? updatedMember : member
            )
        );
    };

    // Mobile card view for team members
    const MobileTeamMemberCard = ({ member }) => (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-3">
            <div className="flex items-center justify-between mb-3 relative">
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center text-white mr-3">
                        {member.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-white cursor-pointer hover:text-blue-400"
                             onClick={() => handleViewMemberDetails(member)}>
                            {member.name}
                        </div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                    </div>
                </div>
                <button
                    onClick={() => toggleActionsMenu(member.id)}
                    className="text-gray-400 hover:text-gray-300 p-1"
                >
                    <FiMoreVertical />
                </button>

                {showActionsMenu === member.id && (
                    <div className="absolute right-0 top-8 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                onClick={() => handleEmailTeamMember(member.email)}
                            >
                                <FiMail className="inline mr-2" />
                                Email
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                onClick={() => handleEditPermissions(member)}
                            >
                                <FiEdit className="inline mr-2" />
                                Edit permissions
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                onClick={() => handleAssignGpts(member)}
                            >
                                <FiBox className="inline mr-2" />
                                Assign GPTs
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                                onClick={() => handleRemoveTeamMember(member.id)}
                            >
                                <FiTrash2 className="inline mr-2" />
                                Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                    <div className="text-xs text-gray-400">Role</div>
                    <div className="text-sm text-white">{member.role}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400">Department</div>
                    <div className="text-sm text-white">{member.department}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400">Position</div>
                    <div className="text-sm text-white">{member.position}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400">Assigned GPTs</div>
                    <div className="text-sm text-white">{member.assignedGPTs}</div>
                </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 self-center ${member.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    {member.status}
                </span>
                
                <div className="text-xs text-gray-400">
                    Last active: {member.lastActive}
                </div>
            </div>
        </div>
    );

    // Pass this function to the AssignGptsModal - it should trigger a recount
    const handleGptAssignmentChange = () => {
        // Fetch counts using the current state
        fetchGptCounts(teamMembers); 
        setAssignmentChanged(prev => !prev); // Still useful for triggering other potential effects if needed
    };

    // Fix #4: Add a click-away handler to close any open menus when clicking elsewhere
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showActionsMenu && !event.target.closest('button')) {
                setShowActionsMenu(null);
            }
            if (showDepartmentsDropdown && !event.target.closest('button')) {
                setShowDepartmentsDropdown(false);
            }
            if (showStatusDropdown && !event.target.closest('button')) {
                setShowStatusDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showActionsMenu, showDepartmentsDropdown, showStatusDropdown]);

    // Add this useEffect for auto-refresh every 30 seconds
    useEffect(() => {
        // Only set up interval if component is mounted and visible
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                refreshUserData();
            }
        }, 10000); // More frequent updates (10 seconds instead of 30)
        
        return () => clearInterval(interval);
    }, []);

    // Update refreshUserData to call fetchGptCounts correctly
    const refreshUserData = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/api/auth/users`, { 
                withCredentials: true 
            });
            
            if (response.data && response.data.users) {
                const formattedUsers = response.data.users.map(user => {
                    const isActive = user.lastActive 
                        ? (new Date() - new Date(user.lastActive)) < 24 * 60 * 60 * 1000 
                        : false;
                    
                    return {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        department: user.department || 'Not Assigned',
                        position: user.position || '',
                        joined: formatDate(user.createdAt),
                        lastActive: user.lastActive ? formatDate(user.lastActive) : 'Never',
                        status: isActive ? 'Active' : 'Inactive',
                        assignedGPTs: 0
                    };
                });
                setTeamMembers(formattedUsers);
                await fetchGptCounts(formattedUsers);
            }
        } catch (err) {
            console.error("Error refreshing users:", err);
        }
    }, [fetchGptCounts]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-black text-white">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* Add hidden scrollbar styles */}
            <style>{scrollbarHideStyles}</style>
            
            <div className="flex-none p-4 md:p-6">
                {/* Header */}
                <div className="mb-6 md:mb-8 flex flex-col text-center md:text-left md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Team Management</h1>
                        <p className="mt-1 text-sm text-gray-400">Manage your team members and their permissions</p>
                    </div>
                    <button 
                        onClick={handleInviteMember}
                        className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center font-medium hover:bg-blue-700 transition-colors mx-auto md:mx-0"
                    >
                        <FiUsers className="mr-2" /> 
                        <span className="hidden xs:inline">Invite Team Member</span>
                        <span className="xs:hidden">Invite</span>
                    </button>
                </div>
                
                {/* Stats Cards - Responsive grid - Updated for Mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow border border-gray-700">
                        <div className="flex items-center">
                            <div className="p-2 md:p-3 rounded-full bg-blue-900 mr-3 md:mr-4">
                                <FiUsers className="text-blue-300" size={16} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">{teamMembers.length}</h2>
                                <p className="text-xs md:text-sm text-gray-400">Total Team Members</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow border border-gray-700">
                        <div className="flex items-center">
                            <div className="p-2 md:p-3 rounded-full bg-green-900 mr-3 md:mr-4">
                                <FiUser className="text-green-300" size={16} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">
                                    {teamMembers.filter(m => m.status === 'Active').length}
                                </h2>
                                <p className="text-xs md:text-sm text-gray-400">Active Members</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow border border-gray-700">
                        <div className="flex items-center">
                            <div className="p-2 md:p-3 rounded-full bg-yellow-900 mr-3 md:mr-4">
                                <FiBell className="text-yellow-300" size={16} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">{pendingInvitesCount}</h2>
                                <p className="text-xs md:text-sm text-gray-400">Pending Invites</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow border border-gray-700">
                        <div className="flex items-center">
                            <div className="p-2 md:p-3 rounded-full bg-purple-900 mr-3 md:mr-4">
                                <FiBox className="text-purple-300" size={16} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">
                                    {teamMembers.reduce((total, member) => total + (member.assignedGPTs || 0), 0)}
                                </h2>
                                <p className="text-xs md:text-sm text-gray-400">Assigned GPTs</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Search and Filter */}
                <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search Bar Container */}
                    <div className="relative w-full md:w-auto">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search team members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full md:w-64 rounded-md border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    
                    {/* Filter Buttons Container */}
                    <div className="flex space-x-2 w-full md:w-auto justify-end md:justify-start"> 
                        <button className="px-2 py-1 rounded-md border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 flex items-center">
                            <FiFilter className="mr-2" /> Filter
                        </button>
                        
                        {/* Departments Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setShowDepartmentsDropdown(!showDepartmentsDropdown);
                                    setShowStatusDropdown(false);
                                }}
                                className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px] xs:max-w-[100px] md:max-w-none"
                            >
                                {selectedDepartment}
                            </button>
                            
                            {showDepartmentsDropdown && (
                               <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                                   <div className="py-1" role="menu" aria-orientation="vertical">
                                       {departments.map(dept => (
                                           <button 
                                               key={dept}
                                               className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                               onClick={() => {
                                                   setSelectedDepartment(dept);
                                                   setShowDepartmentsDropdown(false);
                                               }}
                                           >
                                               {dept}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                            )}
                        </div>
                        
                        {/* Status Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setShowStatusDropdown(!showStatusDropdown);
                                    setShowDepartmentsDropdown(false);
                                }}
                                className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 text-sm"
                            >
                                {selectedStatus}
                            </button>
                            
                            {showStatusDropdown && (
                                <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                        <button 
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                            onClick={() => {
                                                setSelectedStatus('All Status');
                                                setShowStatusDropdown(false);
                                            }}
                                        >
                                            All Status
                                        </button>
                                        <button 
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                            onClick={() => {
                                                setSelectedStatus('Active');
                                                setShowStatusDropdown(false);
                                            }}
                                        >
                                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                            Active
                                        </button>
                                        <button 
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                            onClick={() => {
                                                setSelectedStatus('Inactive');
                                                setShowStatusDropdown(false);
                                            }}
                                        >
                                            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                            Inactive
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Conditional rendering based on screen size */}
            {!isMobileView ? (
                // Desktop Table View
                <>
                    {/* Table Header (Fixed) */}
                    <div className="flex-none px-4 md:px-6">
                        <div className="bg-gray-900 rounded-t-lg overflow-hidden border border-gray-700 border-b-0">
                            <table className="min-w-full table-fixed">
                                <colgroup>
                                    <col className="w-[20%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[15%]" />
                                    <col className="w-[13%] hidden md:table-cell" />
                                    <col className="w-[13%] hidden md:table-cell" />
                                    <col className="w-[12%]" />
                                    <col className="w-[8%] hidden sm:table-cell" />
                                    <col className="w-[9%]" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                            Joined
                                        </th>
                                        <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                            Last Active
                                        </th>
                                        <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                            GPTs
                                        </th>
                                        <th scope="col" className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                    
                    {/* Table Body (Scrollable with hidden scrollbar) */}
                    <div className="flex-1 px-4 md:px-6 pb-6 overflow-auto hide-scrollbar">
                        <div className="bg-gray-800 rounded-b-lg shadow border border-gray-700 border-t-0">
                            {filteredMembers.length === 0 ? (
                                <div className="p-6 text-center text-gray-400">
                                    {searchTerm ? 'No members match your search criteria' : 'No team members found'}
                                </div>
                            ) : (
                                <table className="min-w-full table-fixed">
                                    <colgroup>
                                        <col className="w-[20%]" />
                                        <col className="w-[10%]" />
                                        <col className="w-[15%]" />
                                        <col className="w-[13%] hidden md:table-cell" />
                                        <col className="w-[13%] hidden md:table-cell" />
                                        <col className="w-[12%]" />
                                        <col className="w-[8%] hidden sm:table-cell" />
                                        <col className="w-[9%]" />
                                    </colgroup>
                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                        {filteredMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-700">
                                                {/* Member column */}
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-600 rounded-full flex items-center justify-center text-white">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-3 md:ml-4">
                                                            <div className="text-xs sm:text-sm font-medium text-white cursor-pointer hover:text-blue-400"
                                                                 onClick={() => handleViewMemberDetails(member)}>
                                                                {member.name}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {member.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                {/* Role column */}
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs sm:text-sm text-white">
                                                        {member.role}
                                                    </div>
                                                </td>
                                                
                                                {/* Department column */}
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs sm:text-sm text-white">
                                                        {member.department}
                                                    </div>
                                                    {member.position && (
                                                        <div className="text-xs text-gray-400 hidden sm:block">
                                                            {member.position}
                                                        </div>
                                                    )}
                                                </td>
                                                
                                                {/* Joined column */}
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                                                    <div className="flex items-center">
                                                        <FiCalendar className="mr-2" size={14} />
                                                        {member.joined}
                                                    </div>
                                                </td>
                                                
                                                {/* Last Active column */}
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                                                    {member.lastActive}
                                                </td>
                                                
                                                {/* Status column */}
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 self-center ${member.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                
                                                {/* GPTs column - centered now */}
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-white hidden sm:table-cell text-center">
                                                    {member.assignedGPTs}
                                                </td>
                                                
                                                {/* Actions column */}
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                    <button
                                                        onClick={() => toggleActionsMenu(member.id)}
                                                        className="text-gray-400 hover:text-gray-300"
                                                    >
                                                        <FiMoreVertical />
                                                    </button>
                                                    
                                                    {showActionsMenu === member.id && (
                                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                                <button
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                                                    onClick={() => handleEmailTeamMember(member.email)}
                                                                >
                                                                    <FiMail className="inline mr-2" />
                                                                    Email
                                                                </button>
                                                                <button
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                                                    onClick={() => handleEditPermissions(member)}
                                                                >
                                                                    <FiEdit className="inline mr-2" />
                                                                    Edit permissions
                                                                </button>
                                                                <button
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                                                    onClick={() => handleAssignGpts(member)}
                                                                >
                                                                    <FiBox className="inline mr-2" />
                                                                    Assign GPTs
                                                                </button>
                                                                <button
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                                                                    onClick={() => handleRemoveTeamMember(member.id)}
                                                                >
                                                                    <FiTrash2 className="inline mr-2" />
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                // Mobile Card View with hidden scrollbar
                <div className="flex-1 px-4 pb-6 overflow-auto hide-scrollbar">
                    {filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-4">
                            <p className="text-lg mb-4">
                                {searchTerm ? `No members matching "${searchTerm}"` : "No team members found"}
                            </p>
                            <button
                                onClick={handleInviteMember}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white"
                            >
                                <FiUsers />
                                <span>Add your first team member</span>
                            </button>
                        </div>
                    ) : (
                        filteredMembers.map(member => (
                            <MobileTeamMemberCard key={member.id} member={member} />
                        ))
                    )}
                </div>
            )}
            
            {/* Modal Components */}
            {showAssignGptsModal && (
                <AssignGptsModal 
                    isOpen={showAssignGptsModal}
                    onClose={() => {
                        setShowAssignGptsModal(false);
                        handleGptAssignmentChange();
                    }}
                    teamMember={selectedMemberForGpts}
                />
            )}
            {showDetailsModal && (
                <TeamMemberDetailsModal 
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    member={selectedMemberForDetails}
                />
            )}
            <InviteTeamMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
            />
            {showEditPermissionsModal && (
                <EditPermissionsModal
                    isOpen={showEditPermissionsModal}
                    onClose={() => setShowEditPermissionsModal(false)}
                    member={selectedMemberForPermissions}
                    onPermissionsUpdated={handlePermissionsUpdated}
                />
            )}
        </div>
    );
};

// Sample data function should ideally be outside the component
function getSampleTeamData() {
    // ... sample data ...
}

export default TeamManagement; 
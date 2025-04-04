import React, { useState } from 'react';
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

// Sample data for team members - expanded list for scrolling
const teamMembers = [
    {
        id: 1,
        name: 'Emily Johnson',
        email: 'emily@gptnexus.com',
        role: 'Admin',
        department: 'Product',
        position: 'Product Manager',
        joined: 'Mar 15, 2022',
        lastActive: 'Apr 2, 2023',
        status: 'Active',
        assignedGPTs: 8
    },
    {
        id: 2,
        name: 'Michael Chen',
        email: 'michael@gptnexus.com',
        role: 'Employee',
        department: 'Engineering',
        position: 'Senior Developer',
        joined: 'Jan 10, 2022',
        lastActive: 'Apr 3, 2023',
        status: 'Active',
        assignedGPTs: 12
    },
    {
        id: 3,
        name: 'Sophia Martinez',
        email: 'sophia@gptnexus.com',
        role: 'Employee',
        department: 'Design',
        position: 'UI/UX Designer',
        joined: 'May 22, 2022',
        lastActive: 'Apr 1, 2023',
        status: 'Active',
        assignedGPTs: 6
    },
    {
        id: 4,
        name: 'David Wilson',
        email: 'david@gptnexus.com',
        role: 'Employee',
        department: 'Marketing',
        position: 'Marketing Specialist',
        joined: 'Jul 8, 2022',
        lastActive: 'Mar 28, 2023',
        status: 'Inactive',
        assignedGPTs: 4
    },
    {
        id: 5,
        name: 'Sarah Rodriguez',
        email: 'sarah@gptnexus.com',
        role: 'Employee',
        department: 'Sales',
        position: 'Account Executive',
        joined: 'Feb 15, 2022',
        lastActive: 'Apr 5, 2023',
        status: 'Active',
        assignedGPTs: 7
    },
    {
        id: 6,
        name: 'James Kim',
        email: 'james@gptnexus.com',
        role: 'Admin',
        department: 'Engineering',
        position: 'CTO',
        joined: 'Jan 5, 2022',
        lastActive: 'Apr 3, 2023',
        status: 'Active',
        assignedGPTs: 15
    },
    {
        id: 7,
        name: 'Olivia Wang',
        email: 'olivia@gptnexus.com',
        role: 'Employee',
        department: 'Design',
        position: 'Senior Designer',
        joined: 'Mar 20, 2022',
        lastActive: 'Apr 4, 2023',
        status: 'Active',
        assignedGPTs: 9
    },
    {
        id: 8,
        name: 'Robert Brown',
        email: 'robert@gptnexus.com',
        role: 'Employee',
        department: 'Product',
        position: 'Product Owner',
        joined: 'Feb 12, 2022',
        lastActive: 'Mar 30, 2023',
        status: 'Inactive',
        assignedGPTs: 5
    },
    {
        id: 9,
        name: 'Emma Davis',
        email: 'emma@gptnexus.com',
        role: 'Employee',
        department: 'Marketing',
        position: 'Content Writer',
        joined: 'Apr 5, 2022',
        lastActive: 'Apr 2, 2023',
        status: 'Active',
        assignedGPTs: 3
    },
    {
        id: 10,
        name: 'Daniel Lee',
        email: 'daniel@gptnexus.com',
        role: 'Employee',
        department: 'Engineering',
        position: 'Frontend Developer',
        joined: 'Jan 18, 2022',
        lastActive: 'Apr 1, 2023',
        status: 'Active',
        assignedGPTs: 8
    },
    {
        id: 11,
        name: 'Isabella Garcia',
        email: 'isabella@gptnexus.com',
        role: 'Employee',
        department: 'Customer Support',
        position: 'Support Lead',
        joined: 'Mar 1, 2022',
        lastActive: 'Mar 29, 2023',
        status: 'Inactive',
        assignedGPTs: 6
    },
    {
        id: 12,
        name: 'Alexander Smith',
        email: 'alex@gptnexus.com',
        role: 'Employee',
        department: 'Sales',
        position: 'Sales Manager',
        joined: 'Feb 8, 2022',
        lastActive: 'Apr 3, 2023',
        status: 'Active',
        assignedGPTs: 11
    }
];

// List of departments for filter dropdown
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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(null);
    const [showDepartmentsDropdown, setShowDepartmentsDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    
    // Add responsive detection
    React.useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Filter team members based on search term, department, and status
    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.position.toLowerCase().includes(searchTerm.toLowerCase());
            
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
        console.log("Invite team member clicked");
        // Implement invite functionality
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

    // Mobile card view for team members
    const MobileTeamMemberCard = ({ member }) => (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center text-white mr-3">
                        {member.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-white">{member.name}</div>
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
                    <div className="absolute right-6 mt-6 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            <button 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                onClick={() => console.log("Email", member.email)}
                            >
                                <FiMail className="inline mr-2" />
                                Email
                            </button>
                            <button 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                onClick={() => console.log("Edit permissions", member.id)}
                            >
                                <FiEdit className="inline mr-2" />
                                Edit permissions
                            </button>
                            <button 
                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                                onClick={() => console.log("Remove", member.id)}
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
                                <h2 className="text-xl md:text-2xl font-bold text-white">5</h2>
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
                                <h2 className="text-xl md:text-2xl font-bold text-white">4</h2>
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
                                <h2 className="text-xl md:text-2xl font-bold text-white">1</h2>
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
                                <h2 className="text-xl md:text-2xl font-bold text-white">30</h2>
                                <p className="text-xs md:text-sm text-gray-400">Assigned GPTs</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Search and Filter - Reduced bottom margin */}
                <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search Bar Container */}
                    <div className="relative w-full md:w-auto"> {/* Full width on mobile, auto on desktop */}
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search team members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            /* Full width on mobile, fixed width (w-64) on desktop */
                            className="pl-10 pr-4 py-2 w-full md:w-64 rounded-md border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    
                    {/* Filter Buttons Container */}
                    {/* Justify end for mobile (when stacked), default start alignment for desktop (row) */}
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
                                /* Reduced max-width slightly on mobile for better fit */
                                className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px] xs:max-w-[100px] md:max-w-none"
                            >
                                {selectedDepartment}
                            </button>
                            
                            {showDepartmentsDropdown && (
                               // ... dropdown content ...
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
                                // ... dropdown content ...
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
                            <table className="min-w-full">
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
                                        <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
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
                    
                    {/* Table Body (Scrollable) */}
                    <div className="flex-1 px-4 md:px-6 pb-6 overflow-auto hide-scrollbar">
                        <div className="bg-gray-800 rounded-b-lg shadow overflow-hidden border border-gray-700 border-t-0">
                            <table className="min-w-full">
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-700">
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-600 rounded-full flex items-center justify-center text-white">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-3 md:ml-4">
                                                        <div className="text-xs sm:text-sm font-medium text-white">
                                                            {member.name}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm text-white">
                                                    {member.role}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm text-white">
                                                    {member.department}
                                                </div>
                                                <div className="text-xs text-gray-400 hidden sm:block">
                                                    {member.position}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                                                <div className="flex items-center">
                                                    <FiCalendar className="mr-2" size={14} />
                                                    {member.joined}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                                                {member.lastActive}
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 self-center ${member.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-white hidden sm:table-cell">
                                                {member.assignedGPTs}
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                <button 
                                                    onClick={() => toggleActionsMenu(member.id)}
                                                    className="text-gray-400 hover:text-gray-300"
                                                >
                                                    <FiMoreVertical />
                                                </button>
                                                
                                                {showActionsMenu === member.id && (
                                                    <div className="absolute right-6 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                                                        <div className="py-1" role="menu" aria-orientation="vertical">
                                                            <button 
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                                                onClick={() => console.log("Email", member.email)}
                                                            >
                                                                <FiMail className="inline mr-2" />
                                                                Email
                                                            </button>
                                                            <button 
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                                                onClick={() => console.log("Edit permissions", member.id)}
                                                            >
                                                                <FiEdit className="inline mr-2" />
                                                                Edit permissions
                                                            </button>
                                                            <button 
                                                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                                                                onClick={() => console.log("Remove", member.id)}
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
                        </div>
                    </div>
                </>
            ) : (
                // Mobile Card View
                <div className="flex-1 px-4 pb-6 overflow-auto hide-scrollbar">
                    {filteredMembers.map(member => (
                        <MobileTeamMemberCard key={member.id} member={member} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamManagement; 
import React from 'react';
import { 
  IoGridOutline, 
  IoFolderOpenOutline, 
  IoHeartOutline, 
  IoTimeOutline, 
  IoExitOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoMenuOutline
} from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activePage = 'dashboard', onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(activePage);
  const { logout } = useAuth();
  
  // Auto-collapse on small screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleNavigation = (itemId) => {
    setActiveItem(itemId);
    if (onNavigate) {
      onNavigate(itemId);
    }
    
    // Close mobile menu after navigation on small screens
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <IoGridOutline size={20} /> },
    { id: 'collections', label: 'Collections', icon: <IoFolderOpenOutline size={20} /> },
    { id: 'favourites', label: 'Favourites', icon: <IoHeartOutline size={20} /> },
    { id: 'history', label: 'History', icon: <IoTimeOutline size={20} /> },
  ];

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="rounded-full p-2 bg-gray-800 text-white shadow-lg"
        >
          <IoMenuOutline size={24} />
        </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed md:relative h-screen bg-[#121212] text-white flex flex-col justify-between transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? 'w-[70px]' : 'w-[240px]'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top content */}
        <div>
          {/* Logo and Toggle Button */}
          <div className={`px-4 py-6 mb-4 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
            {!isCollapsed && <h1 className="text-xl font-bold">AI Agent</h1>}
            <button 
              onClick={toggleSidebar}
              className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors hidden md:flex items-center justify-center"
            >
              {isCollapsed ? <IoChevronForwardOutline size={16} /> : <IoChevronBackOutline size={16} />}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col space-y-1 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-4 py-3 rounded-lg text-left transition-colors ${
                  activeItem === item.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="flex items-center justify-center">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom logout button */}
        <div className="px-2 pb-6">
          <button 
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} w-full px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg text-left transition-colors`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className="flex items-center justify-center"><IoExitOutline size={20} /></span>
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

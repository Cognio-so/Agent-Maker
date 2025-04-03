import React, { useState, useEffect } from 'react';
import Sidebar from '../components/User/Sidebar';
import UserDashboard from '../components/User/UserDashboard';

// Placeholder components for other pages
const Collections = () => <div className="p-4 sm:p-8 text-white mt-16 md:mt-0"><h1 className="text-2xl">Collections Page</h1></div>;
const Favourites = () => <div className="p-4 sm:p-8 text-white mt-16 md:mt-0"><h1 className="text-2xl">Favourites Page</h1></div>;
const History = () => <div className="p-4 sm:p-8 text-white mt-16 md:mt-0"><h1 className="text-2xl">History Page</h1></div>;

const Layout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleNavigation = (pageId) => {
    setCurrentPage(pageId);
  };
  
  // Render the appropriate page based on currentPage
  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <UserDashboard />;
      case 'collections':
        return <Collections />;
      case 'favourites':
        return <Favourites />;
      case 'history':
        return <History />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar activePage={currentPage} onNavigate={handleNavigation} />
      <div className={`flex-1 overflow-auto ${isMobile ? 'w-full' : ''}`}>
        {renderPage()}
      </div>
    </div>
  );
};

export default Layout;

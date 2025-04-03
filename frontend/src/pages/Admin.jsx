import React, { useState } from 'react';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminSidebar from '../components/Admin/AdminSidebar';
import TeamManagement from '../components/Admin/TeamManagement';

// Placeholder components for other sections
const CollectionsComponent = () => <div className="flex-1 p-6"><h1 className="text-2xl font-bold">Collections Page</h1></div>;
const SettingsComponent = () => <div className="flex-1 p-6"><h1 className="text-2xl font-bold">Settings Page</h1></div>;
const HistoryComponent = () => <div className="flex-1 p-6"><h1 className="text-2xl font-bold">History Page</h1></div>;

const AdminPage = () => {
    const [activePage, setActivePage] = useState('dashboard');

    const handleNavigation = (pageId) => {
        setActivePage(pageId);
    };

    // Render the appropriate component based on active page
    const renderActivePage = () => {
        switch (activePage) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'collections':
                return <CollectionsComponent />;
            case 'team':
                return <TeamManagement />;
            case 'settings':
                return <SettingsComponent />;
            case 'history':
                return <HistoryComponent />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
            <AdminSidebar activePage={activePage} onNavigate={handleNavigation} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {renderActivePage()}
            </div>
        </div>
    );
};

export default AdminPage;
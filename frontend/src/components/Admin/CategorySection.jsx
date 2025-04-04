import React from 'react';
import AgentCard from './AgentCard';

const CategorySection = ({ title, agentCount, agents }) => {
    // Detect mobile view
    const [isMobileView, setIsMobileView] = React.useState(false);
    
    React.useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 640);
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Mobile agent item
    const MobileAgentItem = ({ agent }) => {
        const statusColor = agent.status === 'online' ? 'bg-green-500' : 'bg-red-500';
        
        return (
            <div className="p-3 border-b border-gray-800 w-full flex items-center">
                <div className="flex-shrink-0 mr-3">
                    <img src={agent.image} alt={agent.name} className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">{agent.name}</h3>
                        <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                    </div>
                    <div className="flex items-center text-gray-400 text-xs mt-1">
                        <span className="mr-3">👤 {agent.userCount}</span>
                        <span className="mr-3">💬 {agent.messageCount}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded">{agent.modelType}</span>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-200">
                    {title}
                </h3>
                <span className="text-xs md:text-sm text-gray-400">{agentCount} agents</span>
            </div>
            
            {isMobileView ? (
                // Mobile list view
                <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                    {agents.map((agent, index) => (
                        <MobileAgentItem key={index} agent={agent} />
                    ))}
                </div>
            ) : (
                // Desktop grid view
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {agents.map((agent, index) => (
                        <AgentCard
                            key={index}
                            agentImage={agent.image}
                            agentName={agent.name}
                            status={agent.status}
                            userCount={agent.userCount}
                            messageCount={agent.messageCount}
                            modelType={agent.modelType}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategorySection; 
import React from 'react';
import AgentCard from './AgentCard';

const CategorySection = ({ title, agentCount, agents }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-200">
                    {title}
                </h3>
                <span className="text-sm text-gray-400">{agentCount} agents</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>
    );
};

export default CategorySection; 
import React from 'react';
import { FaCircle, FaUsers, FaCommentDots } from 'react-icons/fa';

const AgentCard = ({ agentImage, agentName, status, userCount, messageCount, modelType }) => {
    // Status color based on status value ("online" or "offline")
    const statusColor = status === 'online' ? 'text-green-500' : 'text-red-500';
    
    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="flex items-center mb-3">
                <img src={agentImage} alt={agentName} className="w-10 h-10 rounded-full mr-3 p-0.5" />
                <h3 className="text-base font-semibold transition-colors">{agentName}</h3>
                <FaCircle className={`ml-auto ${statusColor} text-[0.4rem]`} />
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
                <div className="flex items-center">
                    <FaUsers className="mr-1.5 text-[0.65rem]" />
                    <span>{userCount}</span>
                </div>
                <div className="flex items-center">
                    <FaCommentDots className="mr-1.5 text-[0.65rem]" />
                    <span>{messageCount}</span>
                </div>
                <div className="ml-auto px-2 py-0.5 bg-gray-700 rounded text-xs">{modelType}</div>
            </div>
        </div>
    );
};

export default AgentCard; 
import React from 'react';
import { FaCircle, FaUsers, FaCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AgentCard = ({ agentId, agentImage, agentName, status, userCount, messageCount, modelType }) => {
    // Status color based on status value ("online" or "offline")
    const statusColor = status === 'online' ? 'text-green-500' : 'text-red-500';
    const navigate = useNavigate();
    
    return (
        <div 
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 sm:p-4 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
            onClick={() => navigate(`/admin/chat/${agentId}`)}
        >
            <div className="flex items-center mb-2 sm:mb-3">
                <img src={agentImage} alt={agentName} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 p-0.5 object-cover" />
                <h3 className="text-sm sm:text-base font-semibold transition-colors text-white">{agentName}</h3>
                <FaCircle className={`ml-auto ${statusColor} text-[0.4rem]`} />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-gray-400 text-xs sm:text-sm">
                <div className="flex items-center">
                    <FaUsers className="mr-1 sm:mr-1.5 text-[0.6rem] sm:text-[0.65rem]" />
                    <span>{userCount}</span>
                </div>
                <div className="flex items-center">
                    <FaCommentDots className="mr-1 sm:mr-1.5 text-[0.6rem] sm:text-[0.65rem]" />
                    <span>{messageCount}</span>
                </div>
                <div className="ml-auto px-1.5 sm:px-2 py-0.5 bg-gray-700 rounded text-[0.65rem] sm:text-xs">{modelType}</div>
            </div>
        </div>
    );
};

export default AgentCard; 
import React, { useState } from 'react';
import { IoAddOutline,  IoCloseOutline, IoPersonCircleOutline,  IoInformationCircleOutline, IoSearchOutline, IoSparklesOutline, IoArrowBackOutline } from 'react-icons/io5';
import { FaBox, FaUpload,  FaGlobe, FaChevronDown } from 'react-icons/fa';
import { LuBrain } from 'react-icons/lu';
import { SiOpenai, SiGooglegemini } from 'react-icons/si';
import { BiLogoMeta } from 'react-icons/bi';
import { FaRobot } from 'react-icons/fa6';
import { RiOpenaiFill } from 'react-icons/ri';

const CreateCustomGpt = ({ onGoBack }) => {
    // State for GPT Configuration
    const [formData, setFormData] = useState({
        name: 'My Custom GPT',
        description: 'A helpful assistant that can answer questions about various topics.',
        instructions: 'You are a helpful, creative, clever, and very friendly AI assistant.\n\nWhen providing code examples:\n- Focus on readability and maintainability\n- Include helpful comments\n- Consider edge cases\n- Explain the reasoning behind your implementation\n- Avoid implementing solutions with known security vulnerabilities or performance issues.',
        conversationStarter: '',
    });
    
    // Simplified capabilities state
    const [capabilities, setCapabilities] = useState({
        webBrowsing: true,
    });
    
    const [imagePreview, setImagePreview] = useState(null);
    const [activeTab, setActiveTab] = useState('basic'); // Default to basic as it's the only one now
    const [promptMode, setPromptMode] = useState('edit'); // 'edit' or 'preview'
    const [selectedModel, setSelectedModel] = useState('gpt-4');
    const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false); // State for dropdown
    const [knowledgeFiles, setKnowledgeFiles] = useState([]); // State for knowledge files

    // Model icons mapping
    const modelIcons = {
        'gpt-4': <RiOpenaiFill className="text-green-500 mr-2" size={18} />,
        'gpt-3.5': <SiOpenai className="text-green-400 mr-2" size={16} />,
        'claude': <FaRobot className="text-purple-400 mr-2" size={16} />,
        'gemini': <SiGooglegemini className="text-blue-400 mr-2" size={16} />,
        'llama': <BiLogoMeta className="text-blue-500 mr-2" size={18} />
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Updated handler for simplified capabilities
    const handleCapabilityChange = (capability) => {
        setCapabilities(prevCapabilities => ({
            ...prevCapabilities,
            [capability]: !prevCapabilities[capability]
        }));
    };

    const handleGeneratePrompt = () => {
        // This would connect to an AI service to generate a prompt
        console.log("Generating prompt...");
        // Example: Update instructions with a generated prompt
        setFormData({ ...formData, instructions: 'Generated prompt: Be concise and helpful.' });
        setPromptMode('edit'); // Switch back to edit mode after generating
    };
    
    const handleSelectTemplate = (templateInstructions) => {
        setFormData({ ...formData, instructions: templateInstructions });
        setIsTemplateDropdownOpen(false);
        setPromptMode('edit');
    };
    
    // Handler for knowledge file upload
    const handleKnowledgeUpload = (e) => {
        const files = Array.from(e.target.files);
        setKnowledgeFiles([...knowledgeFiles, ...files]);
        // Add logic here to actually process/upload the files if needed
        console.log("Uploaded knowledge files:", files.map(f => f.name));
    };

    // Handler to remove a knowledge file
    const removeKnowledgeFile = (index) => {
        setKnowledgeFiles(knowledgeFiles.filter((_, i) => i !== index));
    };

    // Example prompt templates
    const promptTemplates = {
        "Coding Expert": "You are an expert programmer with deep knowledge of software development best practices. Help users with coding problems, architecture decisions, and debugging issues.\n\nWhen providing code examples:\n- Focus on readability and maintainability\n- Include helpful comments\n- Consider edge cases\n- Explain the reasoning behind your implementation\n- Avoid implementing solutions with known security vulnerabilities or performance issues.",
        "Creative Writer": "You are a creative writing assistant. Help users brainstorm ideas, develop characters, write dialogue, and overcome writer's block. Use vivid language and imaginative suggestions.",
        "Marketing Assistant": "You are a helpful marketing assistant. Generate ad copy, social media posts, email campaigns, and suggest marketing strategies based on user goals and target audience.",
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#1A1A1A] text-white">
            <div className="flex flex-1 overflow-hidden">
                {/* Left Side - Configuration Panel - Added 'no-scrollbar' class */}
                <div className="w-1/2 overflow-y-auto border-r border-gray-800 p-6 no-scrollbar">
                    <div className="mb-6 flex items-center">
                        {/* Back Button */}
                        <button 
                            onClick={onGoBack} 
                            className="mr-4 p-1 rounded-full hover:bg-gray-700 transition-colors"
                            title="Back to Dashboard"
                        >
                            <IoArrowBackOutline size={22} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Custom GPT Builder</h1>
                            <p className="text-gray-400">Configure your GPT on the left, test it on the right</p>
                        </div>
                    </div>
                    
                    {/* Image Upload at top center */}
                    <div className="flex justify-center mb-8">
                        <div 
                            onClick={() => document.getElementById('gptImage').click()}
                            className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-500"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="GPT Preview" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <IoAddOutline size={32} className="text-gray-500" />
                            )}
                            <input 
                                type="file" 
                                id="gptImage" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>
                    
                    {/* Basic Configuration Section (No Tabs Needed) */}
                    <div className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-[#262626] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="My Custom GPT"
                            />
                        </div>
                        
                        {/* Description Field - Single line input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <input 
                                type="text" 
                                name="description" 
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-[#262626] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="A helpful assistant that can answer questions about various topics."
                            />
                        </div>
                        
                        {/* Model Selection with Icons */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                            <div className="relative">
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full bg-[#262626] border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                >
                                    <option value="gpt-4" className="flex items-center">GPT-4</option>
                                    <option value="gpt-3.5" className="flex items-center">GPT-3.5</option>
                                    <option value="claude" className="flex items-center">Claude</option>
                                    <option value="gemini" className="flex items-center">Gemini</option>
                                    <option value="llama" className="flex items-center">Llama</option>
                                </select>
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    {modelIcons[selectedModel]}
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <FaChevronDown className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                        
                        {/* System Prompt Section */}
                        <div className="border border-gray-700 rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-700">
                                <div className="flex items-center mb-2">
                                    <LuBrain  className="text-purple-400 mr-2" />
                                    <h3 className="text-lg font-medium">Model Instructions</h3>
                                </div>
                                <p className="text-sm text-gray-400">Set instructions for how your GPT should behave and respond.</p>
                            </div>
                            
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-gray-300">System Prompt</label>
                                    <button 
                                        onClick={handleGeneratePrompt}
                                        className="flex items-center text-sm text-white px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700"
                                    >
                                        <IoSparklesOutline className="mr-1" />
                                        Generate
                                    </button>
                                </div>
                                
                                {/* Template Selector Dropdown */}
                                <div className="relative mb-3">
                                    <button 
                                        onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                                        className="w-full flex items-center bg-[#262626] border border-gray-700 rounded-md px-4 py-2 cursor-pointer text-left"
                                    >
                                        <IoSearchOutline className="text-gray-400 mr-2" />
                                        <span className="text-gray-300 flex-1">Select a template...</span> 
                                        <FaChevronDown className="ml-auto text-gray-400" />
                                    </button>
                                    {/* Dropdown List - Added no-scrollbar */}
                                    {isTemplateDropdownOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-[#262626] border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto no-scrollbar">
                                            <ul>
                                                {Object.entries(promptTemplates).map(([name, instructions]) => (
                                                    <li key={name}>
                                                        <button 
                                                            onClick={() => handleSelectTemplate(instructions)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                                        >
                                                            {name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Edit/Preview Toggle */}
                                <div className="flex rounded-t-md overflow-hidden mb-0 bg-gray-800">
                                    <button
                                        onClick={() => setPromptMode('edit')}
                                        className={`flex-1 py-2 text-sm font-medium ${promptMode === 'edit' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setPromptMode('preview')}
                                        className={`flex-1 py-2 text-sm font-medium ${promptMode === 'preview' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                                    >
                                        Preview
                                    </button>
                                </div>
                                
                                {/* Conditional Rendering: Edit Textarea or Preview Div - Increased height */}
                                {promptMode === 'edit' ? (
                                    <textarea 
                                        name="instructions" 
                                        value={formData.instructions}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#262626] border border-gray-700 border-t-0 rounded-b-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[200px] no-scrollbar"
                                        placeholder="Instructions for how the GPT should behave..."
                                    />
                                ) : (
                                    // Simulated Markdown Preview - Increased height
                                    <div className="w-full bg-[#262626] border border-gray-700 border-t-0 rounded-b-md px-4 py-2 text-white min-h-[200px] prose prose-invert prose-sm max-w-none whitespace-pre-wrap overflow-y-auto no-scrollbar">
                                        {/* Ideally use <ReactMarkdown>{formData.instructions}</ReactMarkdown> */}
                                        {formData.instructions}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Web Browsing Capability - Rewritten Toggle */}
                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <div className="flex items-center">
                                    <FaGlobe className="text-gray-400 mr-2" />
                                    {/* Link label to input with htmlFor/id */}
                                    <label htmlFor="webBrowsingToggle" className="text-sm font-medium text-gray-300 cursor-pointer">Web Browsing</label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Allow your GPT to search and browse the web</p>
                            </div>
                             {/* Use label as the clickable container */}
                            <label htmlFor="webBrowsingToggle" className="relative inline-flex items-center cursor-pointer">
                                <input
                                    id="webBrowsingToggle" // Added id
                                    type="checkbox"
                                    className="sr-only peer" // Keep it hidden but functional
                                    checked={capabilities.webBrowsing}
                                    onChange={() => handleCapabilityChange('webBrowsing')} // Use simplified handler
                                />
                                {/* Styled div representing the toggle switch */}
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        {/* Conversation Starter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Conversation Starter</label>
                            <input 
                                type="text" 
                                name="conversationStarter" 
                                value={formData.conversationStarter}
                                onChange={handleInputChange}
                                className="w-full bg-[#262626] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Add a conversation starter..."
                            />
                        </div>
                        
                        {/* Knowledge Section */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Knowledge</label>
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                                <FaUpload className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                                <h3 className="font-medium text-sm text-white mb-1">Upload Files</h3>
                                <p className="text-xs text-gray-400 mb-3">Upload PDFs, docs, or text files to give your GPT specific knowledge</p>
                                <button 
                                    type="button" 
                                    onClick={() => document.getElementById('knowledgeFiles').click()}
                                    className="px-4 py-1.5 text-sm bg-[#262626] text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Select Files
                                </button>
                                <input 
                                    type="file" 
                                    id="knowledgeFiles" 
                                    className="hidden" 
                                    multiple 
                                    onChange={handleKnowledgeUpload} 
                                />
                            </div>
                            
                            {/* Display uploaded files */}
                            {knowledgeFiles.length > 0 && (
                                <div className="mt-2">
                                    <ul className="space-y-1">
                                        {knowledgeFiles.map((file, index) => (
                                            <li key={index} className="flex justify-between items-center bg-[#262626] px-3 py-1.5 rounded text-sm border border-gray-700">
                                                <span className="text-gray-300 truncate mr-2">{file.name}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeKnowledgeFile(index)}
                                                    className="text-gray-500 hover:text-red-400"
                                                >
                                                    <IoCloseOutline size={18} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {knowledgeFiles.length === 0 && (
                                 <div className="text-sm text-gray-500 mt-2">No files uploaded yet</div>
                            )}
                        </div>
                    </div>
                    
                    {/* Save Button - Updated to use the glossy-button class from index.css */}
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <button className="w-full px-4 py-3 rounded-md text-white font-medium glossy-button">
                            Save Configuration
                        </button>
                    </div>
                </div>

                {/* Right Side - Preview */}
                <div className="w-1/2 bg-[#2A2A2A] flex flex-col">
                    <div className="p-6 flex flex-col flex-1">
                        <div className="mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Preview</h2>
                            <button className="flex items-center text-sm text-gray-300 px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700">
                                <IoInformationCircleOutline className="mr-1" />
                                View Details
                            </button>
                        </div>

                        {/* UserDashboard Preview */}
                        <div className="flex-1 flex flex-col bg-black rounded-lg overflow-hidden relative">
                            {/* Mock Header with Profile Icon */}
                            <div className="absolute top-4 right-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                        <IoPersonCircleOutline size={24} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Preview Content - Updated to center content */}
                            <div className="flex-1 flex flex-col p-6 items-center justify-center"> 
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <div className="flex justify-center mb-4">
                                        {imagePreview ? (
                                            <div className="w-16 h-16 rounded-full overflow-hidden">
                                                <img src={imagePreview} alt="GPT" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                                                <FaBox size={24} className="text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <h1 className="text-2xl font-bold">
                                        {formData.name || "Welcome to AI Agent"}
                                    </h1>
                                    <span className="text-base font-medium mt-2 block text-gray-300">
                                        {formData.description || "How can I assist you today?"}
                                    </span>
                                </div>

                                {/* Conversation Starter as Preset Card (if provided) - Centered */}
                                {formData.conversationStarter && (
                                    <div className="w-full max-w-md mx-auto mt-4"> 
                                        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(204,43,94,0.2)] rounded-xl p-3 text-left">
                                            <p className="text-gray-300 text-sm">{formData.conversationStarter}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input at Bottom */}
                            <div className="p-4 border-t border-gray-800">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none"
                                        placeholder="Ask anything"
                                        disabled
                                    />
                                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        <IoAddOutline size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCustomGpt;
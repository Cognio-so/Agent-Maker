import React, { useState, useRef, useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import { HiMiniPaperClip } from 'react-icons/hi2';

const AdminMessageInput = ({ onSubmit, onFileUpload }) => {
    const [inputMessage, setInputMessage] = useState('');
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // More robust auto-resize textarea
    const resizeTextarea = () => {
        if (textareaRef.current) {
            // Reset height to get accurate scrollHeight
            textareaRef.current.style.height = '0px';
            const scrollHeight = textareaRef.current.scrollHeight;
            // Apply minimum height for small content
            textareaRef.current.style.height = Math.max(40, scrollHeight) + 'px';
        }
    };

    // Auto-resize when input changes
    useEffect(() => {
        resizeTextarea();
    }, [inputMessage]);

    // Also resize on window resize
    useEffect(() => {
        window.addEventListener('resize', resizeTextarea);
        return () => window.removeEventListener('resize', resizeTextarea);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            onSubmit(inputMessage);
            setInputMessage('');
            
            // Reset height after clearing input
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.style.height = '40px'; // Reset to min-height
                }
            }, 0);
        }
    };

    // Function to handle click on the paperclip icon
    const handleUploadClick = () => {
        fileInputRef.current.click(); // Trigger click on the hidden file input
    };

    // Function to handle file selection
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Files selected:", files); 
            // Pass the files up to the parent component if onFileUpload prop is provided
            if (onFileUpload) {
                 onFileUpload(files);
            }
            // Example: You could store file info in state to display names, etc.
            // setSelectedFiles(Array.from(files)); 

            // Reset the input value to allow selecting the same file again if needed
             e.target.value = null; 
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit}>
                <div className="bg-[#1e1e1e] rounded-2xl sm:rounded-3xl shadow-md">
                    <div className="flex flex-col px-3 sm:px-4 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border border-gray-700/50">
                        {/* Textarea field that grows with content */}
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent border-0 outline-none text-white resize-none overflow-hidden min-h-[40px] max-h-[120px] sm:max-h-[200px] text-sm sm:text-base" 
                            placeholder="Ask anything ..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        
                        {/* Icons below the text area */}
                        <div className="flex justify-between items-center mt-2 sm:mt-3">
                            {/* Hidden File Input */}
                            <input 
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            {/* Upload Icon Button */}
                            <button 
                                type="button" 
                                onClick={handleUploadClick}
                                className="text-gray-400 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-700/50 transition-colors"
                                aria-label="Attach file"
                            >
                                <HiMiniPaperClip size={18} className="sm:text-[20px]" />
                            </button>
                            
                            {/* Send Icon Button */}
                            <button 
                                type="submit" 
                                className={`bg-gray-700 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-colors ${
                                    !inputMessage.trim() 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-gray-600'
                                }`}
                                disabled={!inputMessage.trim()}
                                aria-label="Send message"
                            >
                                <IoSendSharp size={16} className="sm:text-[18px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminMessageInput; 
import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { axiosInstance } from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const EditPermissionsModal = ({ isOpen, onClose, member, onPermissionsUpdated }) => {
  const [role, setRole] = useState(member?.role || 'Employee');
  const [department, setDepartment] = useState(member?.department || 'Not Assigned');
  const [position, setPosition] = useState(member?.position || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.put(`/api/auth/users/${member.id}/permissions`, {
        role,
        department,
        position
      }, { withCredentials: true });
      
      if (response.data.success) {
        toast.success('Permissions updated successfully');
        onPermissionsUpdated({
          ...member,
          role,
          department,
          position
        });
        onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update permissions';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      
      <div className="relative bg-gray-800 w-full max-w-md rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
          <h3 className="text-lg font-semibold text-white">Edit Member Permissions</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-700"
          >
            <IoClose size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Member
            </label>
            <div className="flex items-center p-3 bg-gray-700 rounded-lg">
              <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center text-white mr-3">
                {member.name.charAt(0)}
              </div>
              <div>
                <div className="text-white font-medium">{member.name}</div>
                <div className="text-gray-400 text-sm">{member.email}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Role
            </label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department
            </label>
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="Not Assigned">Not Assigned</option>
              <option value="Product">Product</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Customer Support">Customer Support</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Position
            </label>
            <input 
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Senior Developer"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          
          {/* Footer */}
          <div className="pt-4 border-t border-gray-700 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Permissions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPermissionsModal;
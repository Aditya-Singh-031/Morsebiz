'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import DashboardUsersService from '@/services/dashboardUsersService';

const UserDialog = ({ 
  isOpen, 
  onClose, 
  user = null, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'admin',
    status: 'active',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = !!user;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          username: user.username || '',
          role: user.role || 'admin',
          status: user.status || 'active',
          password: ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          username: '',
          role: 'admin',
          status: 'active',
          password: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditMode, user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.trim() && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      let response;
      const submitData = { ...formData };
      
      if (isEditMode) {
        // Remove username and password from edit data if password is empty
        delete submitData.username;
        if (!submitData.password.trim()) {
          delete submitData.password;
        }
        response = await DashboardUsersService.updateUser(user._id, submitData);
      } else {
        // Remove username from create data as it will be auto-generated
        delete submitData.username;
        response = await DashboardUsersService.createUser(submitData);
      }

      if (response.success) {
        toast.success(isEditMode ? 'User updated successfully' : 'User created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Handle specific error messages
      if (error.message) {
        // Check for email already exists error
        if (error.message.toLowerCase().includes('email') && 
            (error.message.toLowerCase().includes('already taken') || 
             error.message.toLowerCase().includes('already exists'))) {
          setErrors(prev => ({
            ...prev,
            email: 'This email address is already registered with another user'
          }));
          toast.error('Email address is already taken by another user');
        } else if (error.message.toLowerCase().includes('user with this email already exists')) {
          setErrors(prev => ({
            ...prev,
            email: 'This email address is already registered'
          }));
          toast.error('User with this email already exists');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to save user');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update user information. Username cannot be changed.' 
              : 'Create a new user account. Username will be automatically generated from the name.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>



            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {!isEditMode && '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={isEditMode ? "Leave empty to keep current password" : "Enter password"}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              {isEditMode && (
                <p className="text-sm text-gray-500">Leave empty to keep current password</p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
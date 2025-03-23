import axios from 'axios';
import { API_URL } from '@/config/config';

// Get current user profile
export const getUserProfile = async (userId: string) => {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userId: string, userData: any) => {
  const response = await axios.put(`${API_URL}/users/${userId}`, userData);
  return response.data;
};

// Update user password
export const updateUserPassword = async (userId: string, passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await axios.post(`${API_URL}/users/${userId}/password`, passwordData);
  return response.data;
};

// Upload profile picture
export const uploadProfilePicture = async (userId: string, imageFile: File) => {
  // Create FormData object
  const formData = new FormData();
  formData.append('image', imageFile); // Changed to 'image' to match backend expectations
  
  // Add user info to ensure the profile is updated for the correct user
  formData.append('userId', userId);
  
  // Use the profile update endpoint which already handles file uploads
  const response = await axios.put(`${API_URL}/users/profile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}; 
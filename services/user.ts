import axios from 'axios';
import { API_URL } from '@/config/config';

// Get current user profile
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to fetch user profile'
    };
  }
};

// Update user profile
export const updateUserProfile = async (userData: any) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.put(`${API_URL}/users/profile`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to update profile'
    };
  }
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
export const uploadProfilePicture = async (userId: string, file: File) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_URL}/users/${userId}/upload-avatar`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to upload profile picture'
    };
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return {
      success: false,
      message: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to fetch user'
    };
  }
}; 
import axios from 'axios';
import { API_URL } from '@/config/config';

// Get user profile
export const getUserProfile = async () => {
    const user = localStorage.getItem('user') 
    const userData = user ? JSON.parse(user) : null;
    const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
            'Authorization': `Bearer ${userData?.token}`
        }
    });
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData: FormData) => {
  const response = await axios.put(`${API_URL}/users/profile`, profileData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get user by ID (admin only)
export const getUserById = async (userId: string) => {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data;
}; 
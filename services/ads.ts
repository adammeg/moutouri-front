 // Create a service for the ads API
import { API_URL } from '@/config/config';
import axios from 'axios';
// Get ads by position
export const getAdsByPosition = async (position: string) => {
  try {
    const response = await axios.get(`${API_URL}/ads/position/${position}`);
    const data = response.data;
    
    return data;
  } catch (error) {
    console.error('Error fetching ads:', error);
    return {
      success: false,
      message: 'Could not fetch ads',
      ads: []
    };
  }
};

// Admin functions - Create, update, delete ads
export const createAd = async (adData: FormData, token: string) => {
  try {
    const response = await axios.post(`${API_URL}/ads`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: adData
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating ad:', error);
    return {
      success: false,
      message: 'Could not create ad'
    };
  }
};

export const updateAd = async (id: string, adData: FormData, token: string) => {
  try {
    const response = await axios.put(`${API_URL}/ads/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: adData
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating ad:', error);
    return {
      success: false,
      message: 'Could not update ad'
    };
  }
};

export const deleteAd = async (id: string, token: string) => {
  try {
    const response = await axios.delete(`${API_URL}/ads/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting ad:', error);
    return {
      success: false,
      message: 'Could not delete ad'
    };
  }
};

export const getAllAds = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/ads`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching all ads:', error);
    return {
      success: false,
      message: 'Could not fetch ads',
      ads: []
    };
  }
};
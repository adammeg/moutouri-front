// Create a service for the ads API
import { API_URL } from '@/config/config';
import axios from 'axios';

// Get ads by position
export const getAdsByPosition = async (position: string) => {
  try {
    const response = await axios.get(`${API_URL}/ads/position/${position}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ads:', error);
    return {
      success: false,
      ads: []
    };
  }
};

// Track ad view (impression)
export const trackAdView = async (adId: string) => {
  try {
    await axios.post(`${API_URL}/ads/track/impression/${adId}`);
  } catch (error) {
    console.error('Error tracking ad impression:', error);
  }
};

// Track ad click
export const trackAdClick = async (adId: string) => {
  try {
    await axios.post(`${API_URL}/ads/track/click/${adId}`);
  } catch (error) {
    console.error('Error tracking ad click:', error);
  }
};

// Get ad statistics
export const getAdStats = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/ads/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching ad stats:', error);
    return {
      success: false,
      stats: {
        totalAds: 0,
        activeAds: 0,
        totalImpressions: 0,
        totalClicks: 0
      }
    };
  }
};

// Admin functions - Create, update, delete ads
export const createAd = async (adData: FormData, token: string) => {
  try {
    // Debug the token being used
    console.log('Creating ad with token length:', token?.length || 0)
    
    // Log headers and form data content summary for debugging
    const formDataSummary: Record<string, any> = {}
    for (const [key, value] of adData.entries()) {
      formDataSummary[key] = value instanceof File 
        ? `File: ${value.name} (${value.type}, ${(value.size/1024).toFixed(2)}KB)` 
        : value
    }
    console.log('FormData summary:', formDataSummary)
    
    const response = await axios.post(`${API_URL}/ads`, adData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    
    console.log('Ad creation response:', response.status, response.statusText)
    return response.data
  } catch (error) {
    console.error('Error creating ad:', error)
    
    // More detailed error information
    let errorMessage = 'Could not create ad'
    if (axios.isAxiosError(error)) {
      console.error('API error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      })
      errorMessage = error.response?.data?.message || 'API error: ' + (error.response?.status || 'unknown')
    }
    
    return {
      success: false,
      message: errorMessage
    }
  }
}

export const updateAd = async (id: string, adData: FormData, token: string) => {
  try {
    const response = await axios.put(`${API_URL}/ads/${id}`, adData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
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
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      ads: response.data.ads
    };
  } catch (error) {
    console.error('Error fetching all ads:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to fetch ads',
      ads: []
    };
  }
};
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Gửi yêu cầu reset password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Reset password
export const resetPassword = async (newPassword) => {
  try {
    // Lấy token từ URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      throw new Error('Token không hợp lệ');
    }
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 
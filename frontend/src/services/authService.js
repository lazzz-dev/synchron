import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const checkAuthStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/status`);
    return response.data;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return { isAuthenticated: false };
  }
};

export const getGoogleLoginUrl = () => {
  return `${API_URL}/auth/google`;
};

export const logout = async () => {
  try {
    await axios.get(`${API_URL}/auth/logout`);
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};

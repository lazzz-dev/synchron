import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getSyncConfigs = async () => {
  try {
    const response = await axios.get(`${API_URL}/sync`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sync configs:', error);
    throw error;
  }
};

export const getSyncConfig = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/sync/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch sync config ${id}:`, error);
    throw error;
  }
};

export const createSyncConfig = async (syncConfig) => {
  try {
    const response = await axios.post(`${API_URL}/sync`, syncConfig);
    return response.data;
  } catch (error) {
    console.error('Failed to create sync config:', error);
    throw error;
  }
};

export const updateSyncConfig = async (id, syncConfig) => {
  try {
    const response = await axios.put(`${API_URL}/sync/${id}`, syncConfig);
    return response.data;
  } catch (error) {
    console.error(`Failed to update sync config ${id}:`, error);
    throw error;
  }
};

export const deleteSyncConfig = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/sync/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete sync config ${id}:`, error);
    throw error;
  }
};

export const triggerSync = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/sync/${id}/sync`);
    return response.data;
  } catch (error) {
    console.error(`Failed to trigger sync for config ${id}:`, error);
    throw error;
  }
};

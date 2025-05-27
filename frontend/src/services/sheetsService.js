import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getSheets = async () => {
  try {
    const response = await axios.get(`${API_URL}/sheets`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sheets:', error);
    throw error;
  }
};

export const getSheetTabs = async (sheetId) => {
  try {
    const response = await axios.get(`${API_URL}/sheets/${sheetId}/tabs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sheet tabs:', error);
    throw error;
  }
};

export const getSheetTabData = async (sheetId, tabName) => {
  try {
    const response = await axios.get(`${API_URL}/sheets/${sheetId}/tabs/${tabName}/data`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sheet data:', error);
    throw error;
  }
};

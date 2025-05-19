import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/users/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};
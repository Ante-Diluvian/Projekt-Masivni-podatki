import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (username, password) => {
  try {
    const response = await api.post('/users/login', { username, password });
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkLoginStatus = async () => {
  try {
    const response = await API.get('/users/me');
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    return null;
  }
};
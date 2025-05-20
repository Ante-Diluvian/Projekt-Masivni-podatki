import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (username, password) => {
  try {
    const response = await api.post('/users/login', { username, password });
    await AsyncStorage.setItem('token', JSON.stringify(response.data));
    await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (username, password, email) => {
  try {
    const response = await api.post('/users/', { username, password, email });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
}

export const logout = async () => {
  try {
    await api.get('/users/logout');
    await AsyncStorage.setItem('token', '');
    await AsyncStorage.setItem('isLoggedIn', '');
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    throw error;
  }
};
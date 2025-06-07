import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initMqttClient, logoutMqttClient  } from '../MqttContext';

let userId = null;

export const login = async (username, password) => {
  try {
    if (userId) {
      await logoutMqttClient(userId);
    }

    const response = await api.post('/users/login', { username, password });
    await AsyncStorage.setItem('token', JSON.stringify(response.data));
    await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));

    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async ({ username, password, email, age, weight, height, gender }) => {
  try {
    const response = await api.post('/users/', { username, password, email, age, weight, height, gender });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
}

export const logout = async () => {
  try {
    const data = await AsyncStorage.getItem('token');
    const currentUserId = data ? JSON.parse(data)._id : userId;
    logoutMqttClient(currentUserId); 

    await api.get('/users/logout');
    await AsyncStorage.setItem('token', '');
    await AsyncStorage.setItem('isLoggedIn', '');

    userId = null;
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    throw error;
  }
};
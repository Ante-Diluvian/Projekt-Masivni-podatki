import api from './api';

export const getExercises = async () => {
  try {
    const response = await api.get('/exercises');
    return response.data;
  } catch (error) {
    console.error('Napaka pri pridobivanju vaj:', error.response?.data || error.message);
    throw error;
  }
};
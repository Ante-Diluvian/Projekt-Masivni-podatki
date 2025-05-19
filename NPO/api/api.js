import axios from 'axios';

const api = axios.create({
  baseURL: 'https://192.168.68.107:3001', //zamenjaj z URL-jem serverja
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');  //pridobi token iz localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
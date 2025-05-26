import axios from 'axios';

export const socket = 'ws://194.163.176.154:9001';
export const url = 'http://192.168.1.8:3001' //zamenjaj z URL-jem serverja

const api = axios.create({
  baseURL: url,
  withCredentials: true,
});

export default api;
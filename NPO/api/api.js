import axios from 'axios';

export const socket = 'ws://194.163.176.154:9001';

const api = axios.create({
  baseURL: 'http://192.168.68.107:3001', //zamenjaj z URL-jem serverja
  withCredentials: true,
});

export default api;
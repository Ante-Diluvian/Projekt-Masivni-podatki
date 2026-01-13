import axios from 'axios';

export const socket = 'ws://84.247.139.124:9001';
export const flask = 'http://84.247.139.124:5000';

export const url = 'http://84.247.139.124:3001' //zamenjaj z URL-jem serverja

const api = axios.create({
  baseURL: url,
  withCredentials: true,
});

export default api;
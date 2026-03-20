import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://respawnstore.shop:8080',
  withCredentials: true,
});

export default api;

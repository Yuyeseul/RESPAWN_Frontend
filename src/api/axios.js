import axios from 'axios';

export const BASE_URL =
  process.env.REACT_APP_API_URL || 'http://respawnstore.shop:8080';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;

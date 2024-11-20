import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api', // Base URL for your API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;

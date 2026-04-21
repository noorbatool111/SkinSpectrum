import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// IMPORTANT: Replace with your computer's local IP address when running on a physical device or Expo Go!
// e.g. http://192.168.x.x:5000
// DO NOT USE localhost if you are testing on a real phone!
const API_URL = 'http://192.168.18.13:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach the auth token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error fetching token for interceptor', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data;
};

export const googleAuth = async (idToken) => {
  const response = await api.post('/auth/social/google', { idToken });
  return response.data;
};

export const facebookAuth = async (accessToken) => {
  const response = await api.post('/auth/social/facebook', { accessToken });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export default api;

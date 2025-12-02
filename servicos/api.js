import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// CORREÇÃO: IP da sua máquina (Ethernet) e Porta do Spring (8160)
const BASE_URL = 'http://10.136.36.252:8166/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        // Evita enviar token "undefined" que causa erro 403
        if (user && user.token && user.token !== 'undefined') {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
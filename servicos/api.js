import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 👇 Substitua pelo SEU IP da máquina (não use localhost no Android)
// Exemplo: 'http://192.168.1.15:8409/api'
const BASE_URL = 'http://academico3.rj.senac.br/aprova:8409/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Adiciona o Token automaticamente em toda requisição
api.interceptors.request.use(
  async (config) => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        // Se o usuário tem token, coloca no cabeçalho Authorization
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar token no storage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
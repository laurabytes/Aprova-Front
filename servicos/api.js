// servicos/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Verifique se este IP é acessível do seu dispositivo
const BASE_URL = 'http://10.136.36.194:8150/api'; 

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
      // Busca o objeto 'user' salvo pelo AuthContext
      const userJson = await AsyncStorage.getItem('user');
      
      if (userJson) {
        const user = JSON.parse(userJson);
        
        if (user && user.token) {
          // Adiciona o token Bearer
          config.headers.Authorization = `Bearer ${user.token}`;
          // console.log(`[API] Token anexado para: ${config.url}`); // Descomente para debugar
        } else {
          console.warn(`[API] Usuário encontrado, mas sem token para: ${config.url}`);
        }
      } else {
         // console.log(`[API] Nenhum usuário logado. Requisição sem token para: ${config.url}`);
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ⚠️ ATENÇÃO: Seus logs mostram que o Tomcat iniciou na porta 8160.
// Confirme seu IP no terminal (ipconfig/ifconfig).
const BASE_URL = 'http://172.29.80.1:8160/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Adiciona o Token automaticamente, mas com segurança
api.interceptors.request.use(
  async (config) => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      
      if (userJson) {
        const user = JSON.parse(userJson);
        
        // CORREÇÃO CRÍTICA:
        // Verifica se o token existe E se não é a string literal "undefined"
        if (user && user.token && user.token !== 'undefined') {
          config.headers.Authorization = `Bearer ${user.token}`;
        } else {
          // Se o token for "undefined" ou ruim, não enviamos o cabeçalho Authorization.
          // Isso evita que o backend tente ler um token quebrado.
          // console.warn(`[API] Token inválido ou ausente. Enviando sem auth.`);
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
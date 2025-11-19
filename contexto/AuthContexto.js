import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import UsuarioService from '../servicos/UsuarioService'; // 👈 Importa o novo serviço

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Falha ao carregar usuário', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);
  
  const login = async (email, password) => { 
    try {
      // 🚀 Chamada simplificada ao Service
      const data = await UsuarioService.login(email, password);
      
      const userToStore = { 
        email: email, 
        token: data.token, 
        nome: 'Usuário', 
        id: null
      }; 

      await AsyncStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore); 
      
    } catch (error) {
      // Tratamento de erro centralizado
      const message = error.response?.data?.message || 'Credenciais inválidas ou erro no servidor.';
      console.error('Erro ao autenticar:', error.message);
      throw new Error(message);
    }
  };

  const register = async (nome, email, password) => { 
    try {
      // 🚀 Chamada simplificada ao Service
      await UsuarioService.register(nome, email, password);
      
      // Se deu certo, faz o login automático
      await login(email, password);

    } catch (error) {
      const message = error.response?.data?.message || 'Não foi possível cadastrar. Verifique os dados.';
      console.error('Erro ao cadastrar:', error.message);
      throw new Error(message);
    }
  };

  const logout = async () => { 
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 👇 SUBSTITUA PELO SEU IP LOCAL (NÃO USE 'localhost' SE ESTIVER NO CELULAR/EMULADOR)
// Exemplo: 'http://192.168.15.10:8409/api/usuarios'
const API_BASE_URL = 'http://SEU_IP_AQUI:8409/api/usuarios'; 

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
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas ou erro no servidor.');
      }
      
      const data = await response.json(); 
      
      // O Backend atual retorna apenas { token: "..." }
      // Como não temos ID ou Nome na resposta do login, usamos o email digitado.
      const userToStore = { 
        email: email, 
        token: data.token, 
        // Nome e ID ficarão vazios por enquanto pois o DTO do backend não retorna eles.
        nome: 'Usuário', 
        id: null
      }; 

      await AsyncStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore); 
      
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      throw new Error(error.message);
    }
  };

  const register = async (nome, email, password) => { 
    try {
      const response = await fetch(`${API_BASE_URL}/criar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome, 
          email, 
          password,
          // 👇 O Backend exige este campo! Verifique se o nome é esse mesmo no Java.
          role: 'ROLE_USER' 
        }),
      });

      if (!response.ok) {
        // Tenta capturar erro do backend, se houver
        const errorText = await response.text(); 
        throw new Error(errorText || 'Falha ao criar usuário.');
      }
      
      // Se deu certo (201 Created), faz o login automático
      await login(email, password);

    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      throw new Error('Não foi possível cadastrar. Verifique os dados.');
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
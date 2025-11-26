// contexto/AuthContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import UsuarioService from '../servicos/UsuarioService'; 

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
      const data = await UsuarioService.login(email, password);
      
      // --- DEBUG: Verifique o que a API retorna no console ---
      console.log("--- RESPOSTA DO LOGIN ---");
      console.log(JSON.stringify(data, null, 2));
      // -------------------------------------------------------

      // Tenta extrair o token de diferentes formatos comuns
      // Se 'data' for uma string direta, usa ela como token
      let token = null;
      if (typeof data === 'string') {
          token = data;
      } else {
          token = data.token || data.accessToken || data.jwt;
      }

      if (!token) {
          console.error("ERRO CRÍTICO: Token não encontrado na resposta!");
          throw new Error("Token não recebido do servidor.");
      }

      const userToStore = { 
        email: email, 
        token: token, 
        nome: data.nome || 'Usuário', 
        id: data.id || null
      }; 

      await AsyncStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      
    } catch (error) {
      const message = error.response?.data?.message || 'Credenciais inválidas ou erro no servidor.';
      console.error('Erro ao autenticar:', error);
      throw new Error(message);
    }
  };

  const register = async (nome, email, password) => { 
    try {
      await UsuarioService.register(nome, email, password);
      // Se deu certo, faz o login automático
      await login(email, password);
    } catch (error) {
      const message = error.response?.data?.message || 'Não foi possível cadastrar. Verifique os dados.';
      console.error('Erro ao cadastrar:', error);
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
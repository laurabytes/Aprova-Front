// contexto/AuthContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage'; // Você já tem esta dependência
import React, { createContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // ESSENCIAL: Comece 'isLoading' como 'true' para evitar o redirecionamento imediato
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const loadUserFromStorage = async () => {
      // ... (lógica de AsyncStorage)
      
      // O bloco finally garante que o carregamento termine, 
      // permitindo que a lógica no _layout.jsx prossiga.
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
  
  // ... (funções login, register, logout)
  const login = async (email, password) => { /* ... simulação ... */ };
  const register = async (nome, email, password) => { /* ... simulação ... */ };
  const logout = async () => { /* ... simulação ... */ };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ... (export useAuth)
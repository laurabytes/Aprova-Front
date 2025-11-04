// app/_layout.jsx
// (SUBSTITUA TODO O CONTEÚDO)

import { Redirect, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, useColorScheme, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexto/AuthContexto'; // <-- CORREÇÃO: Caminho de 1 nível acima
import { cores } from '../tema/cores'; // <-- CORREÇÃO: Caminho de 1 nível acima

// Este componente decide para onde o usuário vai
function LayoutInicial() {
  const { user, isLoading } = useAuth();
  
  const segments = useSegments(); 
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    if (isLoading) {
      return; 
    }

    const estaNoGrupoAuth = segments[0] === '(auth)';

    if (user && estaNoGrupoAuth) {
      // Se logado e na tela de login, vá para dashboard.
      router.replace('/(tabs)/dashboard');
    } else if (!user && !estaNoGrupoAuth) {
      // Se deslogado e não na tela de login, vá para login.
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, segments]); 

  // Se está carregando, mostramos um ActivityIndicator
  if (isLoading) {
      return (
          <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={theme.primary} />
          </View>
      );
  }

  // CORREÇÃO FINAL para o "Page Not Found": 
  // Se não estamos logados E a rota é a raiz (que não existe), forçamos para o login.
  if (!user && segments.length === 1 && segments[0] === '') {
      return <Redirect href="/(auth)/login" />;
  }

  // O <Slot> renderiza a tela correta
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Slot />
    </SafeAreaView>
  );
}

// Este é o componente principal
export default function RootLayout() {
  return (
    // O AuthProvider "abraça" o app inteiro
    <AuthProvider>
      <LayoutInicial />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
// app/_layout.jsx
// (SUBSTITUA TODO O CONTEÚDO)

import { Redirect, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, useColorScheme, View } from 'react-native';

// --- ATENÇÃO: Caminhos de importação corrigidos para sair de app/ e acessar as pastas irmãs ---
import { AuthProvider, useAuth } from '../contexto/AuthContexto';
import { cores } from '../tema/cores';
// ---------------------------------------------------------------------------------------------

function LayoutInicial() {
  const { user, isLoading } = useAuth();
  
  const segments = useSegments(); 
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    // ESSENCIAL: Espera o AuthProvider terminar de checar o token
    if (isLoading) {
      return; 
    }

    const estaNoGrupoAuth = segments[0] === '(auth)';

    if (user && estaNoGrupoAuth) {
      // Se logado e em uma tela de autenticação, redireciona para o dashboard.
      router.replace('/(tabs)/dashboard');
    } else if (!user && !estaNoGrupoAuth) {
      // Se deslogado e em uma tela de aplicativo (tabs), redireciona para o login.
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, segments]); 

  // Se está carregando (estado inicial), mostra o spinner.
  if (isLoading) {
      return (
          <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={theme.primary} />
          </View>
      );
  }

  // CORREÇÃO FINAL para o "THIS SCREEN DOESN'T EXIST": 
  // Se não estamos logados E a rota é a raiz ('/'), forçamos para o login.
  if (!user && segments.length === 1 && segments[0] === '') {
      return <Redirect href="/(auth)/login" />;
  }

  // O <Slot> renderiza a tela correta (login ou dashboard)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Slot />
    </SafeAreaView>
  );
}

// Este é o componente principal
export default function RootLayout() {
  return (
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
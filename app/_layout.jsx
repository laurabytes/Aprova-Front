// app/_layout.jsx
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 

import { Redirect, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '../contexto/AuthContexto';
import { cores } from '../tema/cores'; 
import { SubjectProvider } from '../contexto/SubjectContexto'; 
import { StudyDataProvider } from '../contexto/StudyDataContexto'; 

// IMPORTAR SUA NOVA TELA
import { TelaSplash } from '../componentes/TelaSplash'; 

function LayoutInicial() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  // Estado para controlar o tempo mínimo da Splash
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  useEffect(() => {
    // Força a tela de splash a ficar visível por 2.5 segundos (2500ms)
    const timer = setTimeout(() => {
      setIsSplashFinished(true);
    }, 2500);

    return () => clearTimeout(timer); // Limpa o timer se desmontar
  }, []);

  useEffect(() => {
    // Só redireciona SE o carregamento do Auth acabou E a Splash terminou o tempo dela
    if (isLoading || !isSplashFinished) return;

    const estaNoGrupoAuth = segments[0] === '(auth)';
    
    if (user && estaNoGrupoAuth) {
      router.replace('/(tabs)/dashboard');
    } else if (!user && !estaNoGrupoAuth) {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, isSplashFinished, segments, router]); 

  // ENQUANTO ESTIVER CARREGANDO OU NO TEMPO DA SPLASH, MOSTRA A TELA SPLASH
  if (isLoading || !isSplashFinished) {
    return <TelaSplash />;
  }
    
  if (!user && segments.length === 1 && segments[0] === '') {
      return <Redirect href="/(auth)/login" />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Slot />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SubjectProvider>
        <StudyDataProvider>
          <LayoutInicial />
        </StudyDataProvider>
      </SubjectProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
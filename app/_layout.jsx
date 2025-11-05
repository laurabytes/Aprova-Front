// app/_layout.jsx
import { Redirect, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, useColorScheme, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexto/AuthContexto'; 
import { cores } from '../tema/cores'; 

function LayoutInicial() {
  const { user, isLoading } = useAuth();
  
  const segments = useSegments(); 
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    // 1. Mesmo que esteja carregando (isLoading), a lógica continua
    // if (isLoading) {
    //   return; 
    // }

    const estaNoGrupoAuth = segments[0] === '(auth)';

    if (user && estaNoGrupoAuth) {
      router.replace('/(tabs)/dashboard');
    } else if (!user && !estaNoGrupoAuth) {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, segments]); 

  // 2. REMOVEMOS O BLOCO "if (isLoading)" DAQUI
  // if (isLoading) {
  //     return (
  //         <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
  //             <ActivityIndicator size="large" color={theme.primary} />
  //         </View>
  //     );
  // }

  if (!user && segments.length === 1 && segments[0] === '') {
      return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Slot />
    </SafeAreaView>
  );
}

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
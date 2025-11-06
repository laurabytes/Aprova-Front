// app/_layout.jsx
import { Redirect, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, useColorScheme, View } from 'react-native';
// Importa o AuthProvider e o hook useAuth
import { AuthProvider, useAuth } from '../contexto/AuthContexto';
import { cores } from '../tema/cores';

function LayoutInicial() {
  const { user, isLoading } = useAuth();
  
  const segments = useSegments();
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    // --- INÍCIO DA CORREÇÃO ---
    // Adicione esta verificação.
    // Ela impede a navegação até que o hook useAuth tenha 
    // verificado o status do usuário (isLoading se torne false).
    if (isLoading) {
      return;
    }
    // --- FIM DA CORREÇÃO ---

    const estaNoGrupoAuth = segments[0] === '(auth)';

    if (user && estaNoGrupoAuth) {
      // Usuário está logado e na tela de auth, redireciona para o app
      router.replace('/(tabs)/dashboard');
    } else if (!user && !estaNoGrupoAuth) {
      // Usuário não está logado e NÃO está na tela de auth, redireciona para o login
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, segments, router]); // Adicione 'router' aqui

  // Você pode descomentar este bloco se quiser um spinner 
  // de tela cheia enquanto o 'isLoading' do AuthContext for true.
  /*
  if (isLoading) {
      return (
          <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={theme.primary} />
          </View>
      );
  }
  */

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
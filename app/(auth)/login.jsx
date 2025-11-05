
import { Link } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { Botao } from '../../componentes/Botao';
import { CampoDeTexto } from '../../componentes/CampoDeTexto';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../../componentes/Card';
import { useAuth } from '../../contexto/AuthContexto';
import { cores } from '../../tema/cores';

export default function Login() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const handleLogin = async () => {
    if (email === '' || senha === '') {
      Alert.alert('Erro', 'Por favor, preencha o email e a senha.');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, senha);
    } catch (error) {
      Alert.alert('Erro no Login', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Acesse sua conta para continuar</CardDescription>
          </CardHeader>

          <CardContent style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Email</Text>
              <CampoDeTexto
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Senha</Text>
              <CampoDeTexto
                placeholder="Sua senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={true}
              />
            </View>
          </CardContent>

          <CardFooter>
            <Botao onPress={handleLogin} disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? (
                <ActivityIndicator color={theme.primaryForeground} />
              ) : (
                'Entrar'
              )}
            </Botao>
          </CardFooter>
        </Card>

        <Link href="/(auth)/cadastro" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={[styles.linkText, { color: theme.mutedForeground }]}>
              Não tem uma conta?{' '}
              <Text style={{ color: theme.primary, fontWeight: '600' }}>
                Cadastre-se
              </Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: { width: '100%', maxWidth: 400 },
  content: { gap: 16 },
  inputGroup: { width: '100%', gap: 6 },
  label: { fontSize: 14, fontWeight: '500' },
  linkButton: { marginTop: 24 },
  linkText: { fontSize: 14 },
});
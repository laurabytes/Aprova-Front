
import { Link } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
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

export default function Cadastro() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCadastro = async () => {
    if (senha !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (nome === '' || email === '') {
        Alert.alert('Erro', 'Todos os campos são obrigatórios');
        return;
    }

    setIsLoading(true);
    try {
      await register(nome, email, senha);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>Insira seus dados para se cadastrar</CardDescription>
          </CardHeader>

          <CardContent style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Nome</Text>
              <CampoDeTexto
                placeholder="Seu nome completo"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>

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
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={true}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.foreground }]}>Confirmar Senha</Text>
              <CampoDeTexto
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
              />
            </View>
          </CardContent>

          <CardFooter>
            <Botao onPress={handleCadastro} disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? (
                 <ActivityIndicator color={theme.primaryForeground} />
              ) : (
                'Criar conta'
              )}
            </Botao>
          </CardFooter>
        </Card>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={[styles.linkText, { color: theme.mutedForeground }]}>
              Já tem uma conta?{' '}
              <Text style={{ color: theme.primary, fontWeight: '600' }}>
                Faça Login
              </Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: { width: '100%', maxWidth: 400 },
  content: { gap: 16 },
  inputGroup: { width: '100%', gap: 6 },
  label: { fontSize: 14, fontWeight: '500' },
  linkButton: { marginTop: 24, paddingBottom: 20 },
  linkText: { fontSize: 14 },
});
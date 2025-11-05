
import { LogOut, PencilLine } from 'lucide-react-native'; 
import {
    Alert,
    Image, 
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, 
    useColorScheme,
    View
} from 'react-native';
import { Botao } from '../../componentes/Botao';
import { useAuth } from '../../contexto/AuthContexto';
import { cores } from '../../tema/cores';

export default function TelaPerfil() {
  const { user, logout } = useAuth();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair.');
    }
  };

  const profileImageUri =
    'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/avatars/01.png'; 
  const handleEditProfile = () => {
    Alert.alert('Funcionalidade Futura', 'A tela de edição de perfil será implementada aqui!');

  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          {}
          <Image source={{ uri: profileImageUri }} style={styles.profileImage} />

          {}
          <Text style={[styles.profileName, { color: theme.foreground }]}>
            {user?.nome || 'Usuário Teste'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.mutedForeground }]}>
            {user?.email}
          </Text>

          {}
          <View style={styles.actionButtonsContainer}>
            <Botao onPress={handleEditProfile} style={styles.editButton}>
              <PencilLine size={16} color={theme.primaryForeground} style={{ marginRight: 8 }} />
              Editar Perfil
            </Botao>
            <Botao variant="destructive" onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={16} color={theme.primaryForeground} style={{ marginRight: 8 }} />
              Sair da Conta
            </Botao>
          </View>
        </View>

        {}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30, 
    alignItems: 'center', 
    gap: 32,
  },
  profileHeader: {
    alignItems: 'center', 
    gap: 12, 
    width: '100%',
  },
  profileImage: {
    width: 100, 
    height: 100,
    borderRadius: 50, 
    borderWidth: 2,
    borderColor: '#7C3AED', 
    marginBottom: 10,
  },
  profileName: {
    fontSize: 26, 
    fontWeight: '700',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20, 
  },
  actionButtonsContainer: {
    flexDirection: 'row', 
    gap: 10,
    width: '100%',
    justifyContent: 'center', 
  },
  editButton: {
    flex: 1, 
    maxWidth: 160, 
  },
  logoutButton: {
    flex: 1,
    maxWidth: 160, 
  },
  contentSection: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
});
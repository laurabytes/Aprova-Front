// app/(tabs)/minha-conta.jsx
import { useRouter } from 'expo-router';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  Target, 
  ArrowLeft, 
  KeyRound, 
  Mail, 
  ChevronRight,
  Settings,
  Shield
} from 'lucide-react-native'; 
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampoDeTexto } from '../../componentes/CampoDeTexto'; // Reutilizando componente
import { useAuth } from '../../contexto/AuthContexto';
import { useStudyData } from '../../contexto/StudyDataContexto'; 
import { cores } from '../../tema/cores';

export default function TelaMinhaConta() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const systemScheme = useColorScheme();
  const theme = cores[systemScheme === 'dark' ? 'dark' : 'light'];
  
  const { foco, updateFoco, isLoading: isStudyLoading } = useStudyData(); 

  // Estado local para simular a troca de tema (apenas visual por enquanto)
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja abandonar o barco?', [
      { text: 'Ficar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    Alert.alert("Tema", "A troca de tema global será implementada em breve!");
  };

  const handleFeature = (feature) => {
    Alert.alert('Em breve', `A funcionalidade "${feature}" estará disponível na próxima maré.`);
  };

  if (isStudyLoading) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </SafeAreaView>
      );
  }

  // Componente de Item de Menu (Row)
  const MenuItem = ({ icon: Icon, label, onPress, destructive = false, valueComp }) => (
    <TouchableOpacity 
      style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: destructive ? theme.destructive + '15' : theme.primary + '15' }]}>
        <Icon size={20} color={destructive ? theme.destructive : theme.primary} />
      </View>
      <Text style={[styles.menuText, { color: destructive ? theme.destructive : theme.foreground }]}>
        {label}
      </Text>
      {valueComp ? valueComp : (
        <ChevronRight size={20} color={theme.mutedForeground} style={{ opacity: 0.5 }} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. CABEÇALHO DE NAVEGAÇÃO */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={theme.foreground} size={24} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: theme.foreground }]}>Meu Perfil</Text>
          <View style={{ width: 24 }} /> 
        </View>

        {/* 2. CARTÃO DO MERGULHADOR (PERFIL) */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
            <User size={40} color={theme.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.foreground }]}>
              {user?.nome || 'Mergulhador'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.mutedForeground }]}>
              {user?.email || 'email@exemplo.com'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.primary + '20' }]}>
                <Shield size={10} color={theme.primary} style={{marginRight: 4}} />
                <Text style={[styles.roleText, { color: theme.primary }]}>ESTUDANTE PRO</Text>
            </View>
          </View>
        </View>

        {/* 3. MISSÃO (FOCO) */}
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>SUA MISSÃO</Text>
            <View style={[styles.focoCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
                <View style={styles.focoHeader}>
                    <Target color={theme.primary} size={20} />
                    <Text style={[styles.focoLabel, { color: theme.primary }]}>Foco Principal</Text>
                </View>
                <CampoDeTexto
                    style={{ borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0, fontSize: 18, fontWeight: '600', height: 40 }}
                    placeholder="Qual seu objetivo?"
                    placeholderTextColor={theme.mutedForeground}
                    value={foco}
                    onChangeText={updateFoco}
                />
                <Text style={{ fontSize: 12, color: theme.mutedForeground, marginTop: 4 }}>
                    Isso aparecerá no seu painel principal.
                </Text>
            </View>
        </View>

        {/* 4. CONFIGURAÇÕES DA CONTA */}
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>CONTA & SEGURANÇA</Text>
            <View style={{ gap: 10 }}>
                <MenuItem 
                    icon={Mail} 
                    label="Alterar E-mail" 
                    onPress={() => handleFeature('Alterar E-mail')} 
                />
                <MenuItem 
                    icon={KeyRound} 
                    label="Alterar Senha" 
                    onPress={() => handleFeature('Alterar Senha')} 
                />
            </View>
        </View>

        {/* 5. PREFERÊNCIAS */}
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>PREFERÊNCIAS</Text>
            <View style={{ gap: 10 }}>
                <MenuItem 
                    icon={isDark ? Moon : Sun} 
                    label="Tema Escuro" 
                    onPress={toggleTheme}
                    valueComp={
                        <Switch 
                            value={isDark} 
                            onValueChange={toggleTheme} 
                            trackColor={{ false: theme.muted, true: theme.primary }}
                            thumbColor={'#FFF'}
                        />
                    }
                />
                <MenuItem 
                    icon={Settings} 
                    label="Notificações" 
                    onPress={() => handleFeature('Notificações')} 
                />
            </View>
        </View>

        {/* 6. SAIR */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: theme.destructive + '50', backgroundColor: theme.destructive + '10' }]}
        >
          <LogOut size={20} color={theme.destructive} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: theme.destructive }]}>Encerrar Sessão</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.mutedForeground }]}>
            Aprova App v1.0.0
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 60,
  },

  // HEADER
  headerNav: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 24 
  },
  backButton: { padding: 4, marginLeft: -4 },
  navTitle: { fontSize: 18, fontWeight: '700' },

  // PROFILE CARD
  profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
  },
  avatarContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      backgroundColor: 'transparent'
  },
  profileInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 14, marginBottom: 8 },
  roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
  },
  roleText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  // SECTIONS
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  
  // FOCO CARD
  focoCard: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderLeftWidth: 4, // Destaque lateral
  },
  focoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  focoLabel: { fontSize: 14, fontWeight: '600' },

  // MENU ITEM
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
  },
  iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
  },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500' },

  // LOGOUT
  logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 10,
      marginBottom: 24,
  },
  logoutText: { fontSize: 16, fontWeight: '700' },
  versionText: { textAlign: 'center', fontSize: 12, opacity: 0.5 },
});
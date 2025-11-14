// app/(tabs)/minha-conta.jsx
import { useRouter } from 'expo-router';
import { User, Moon, Sun, ChevronsRight, LogOut, Target, ArrowLeft, KeyRound, Mail } from 'lucide-react-native'; 
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/Card';
import { Botao } from '../../componentes/Botao';
import { useAuth } from '../../contexto/AuthContexto';
// NOVO: Importar useStudyData
import { useStudyData } from '../../contexto/StudyDataContexto'; 
import { cores } from '../../tema/cores';

const THEME_OPTIONS = [
  { label: 'Claro', value: 'light', icon: Sun },
  { label: 'Escuro', value: 'dark', icon: Moon },
];

function ThemeSelector({ currentScheme, setAppTheme, theme }) {
  const [selectedTheme, setSelectedTheme] = useState(currentScheme);

  const handleSelect = (value) => {
    setSelectedTheme(value);
    Alert.alert(
      "Sucesso",
      `Tema definido para: ${value === 'light' ? 'Claro' : 'Escuro'}`
    );
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader style={{ paddingTop: 16, paddingBottom: 0 }}>
        <CardTitle style={{ fontSize: 18 }}>Tema</CardTitle>
      </CardHeader>
      <CardContent style={{ paddingVertical: 16, gap: 12 }}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = selectedTheme === option.value;
          const Icon = option.icon;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={[
                styles.themeOption,
                { borderColor: theme.border, backgroundColor: theme.card },
                isSelected && {
                  borderColor: theme.primary,
                  backgroundColor: theme.muted,
                },
              ]}
            >
              <Icon
                color={isSelected ? theme.primary : theme.mutedForeground}
                size={20}
              />
              <Text
                style={[
                  {
                    color: theme.foreground,
                    fontWeight: isSelected ? '600' : '400',
                  },
                  isSelected && { color: theme.primary },
                ]}
              >
                {option.label}
              </Text>
              {isSelected && (
                <ChevronsRight
                  color={theme.primary}
                  size={20}
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function TelaMinhaConta() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const systemScheme = useColorScheme();
  const currentScheme = systemScheme;
  const theme = cores[currentScheme === 'dark' ? 'dark' : 'light'];
  
  // USAR CONTEXTO: Obter foco e função de atualização do contexto
  const { foco, updateFoco, isLoading: isStudyLoading } = useStudyData(); 

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const setAppTheme = (newTheme) => {
    console.log("Tema selecionado: ", newTheme);
  };

  const handleAlterarEmail = () => Alert.alert('Alterar E-mail', 'Função de alterar e-mail ainda não implementada.');
  const handleAlterarSenha = () => Alert.alert('Alterar Senha', 'Função de alterar senha ainda não implementada.');

  // Adicionar um indicador de loading para os dados do contexto
  if (isStudyLoading) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.mutedForeground, marginTop: 10 }}>Carregando foco de estudo...</Text>
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Cabeçalho */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={theme.foreground} size={24} />
            <Text style={[styles.navTitle, { color: theme.foreground }]}>Minha Conta</Text>
          </TouchableOpacity>
        </View>

        {/* Perfil */}
        <View style={styles.profileInfoNoCard}>
          <View style={[styles.profileCircle, { borderColor: theme.primary }]}>
            <User size={48} color={theme.primary} />
          </View>
          <Text style={[styles.userName, { color: theme.foreground }]}>
            {user?.nome || 'Usuário Não Logado'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.mutedForeground }]}>
            {user?.email || 'N/A'}
          </Text>
        </View>

        {/* Foco e ações de conta */}
        <View style={[styles.focusContainer, { borderColor: theme.border }]}>
          <View style={styles.infoRow}>
            <Target color={theme.primary} size={20} />
            <Text style={[styles.focusTitle, { color: theme.foreground }]}>
              Foco de Estudo
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.foreground,
                backgroundColor: theme.card,
              },
            ]}
            placeholder="Foco UERJ"
            placeholderTextColor={theme.mutedForeground}
            value={foco}
            onChangeText={updateFoco} // USAR CONTEXTO
          />

          <View style={styles.divider} />

          {/* Opções da conta */}
          <TouchableOpacity style={styles.optionButton} onPress={handleAlterarEmail}>
            <Mail color={theme.primary} size={20} />
            <Text style={[styles.optionText, { color: theme.foreground }]}>
              Alterar E-mail
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleAlterarSenha}>
            <KeyRound color={theme.primary} size={20} />
            <Text style={[styles.optionText, { color: theme.foreground }]}>
              Alterar Senha
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tema */}
        <ThemeSelector
          currentScheme={systemScheme}
          setAppTheme={setAppTheme}
          theme={theme}
        />

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: theme.border, backgroundColor: theme.destructive }]}
        >
          <LogOut size={20} color={theme.primaryForeground} />
          <Text style={[styles.logoutText, { color: theme.primaryForeground }]}>Sair da Conta</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
    paddingBottom: 60,
  },

  // Header
  headerNav: { marginBottom: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navTitle: { fontSize: 18, fontWeight: '600' },

  // Perfil
  profileInfoNoCard: { alignItems: 'center', gap: 8, marginBottom: 16 },
  profileCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  userEmail: { fontSize: 16 },

  // Foco e Ações
  focusContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  focusTitle: { fontSize: 18, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 16,
    opacity: 0.3,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  optionText: { fontSize: 16, fontWeight: '500' },

  // Tema
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 14,
    gap: 10,
    marginTop: 24,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
});
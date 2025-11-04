// app/(tabs)/dashboard.jsx
import { BookOpen, Target, Timer, TrendingUp } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../componentes/Card';
import { useAuth } from '../../contexto/AuthContexto';
import { cores } from '../../tema/cores';

// Componente de Card de Estatística (Dashboard)
function StatCard({ title, value, description, icon: Icon }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;
  return (
    <Card style={styles.statCard}>
      <CardHeader>
        <View style={styles.statHeader}>
          <CardTitle style={{ color: theme.foreground, fontSize: 16 }}> 
            {title}
          </CardTitle>
          <Icon color={theme.mutedForeground} size={16} />
        </View>
      </CardHeader>
      <CardContent>
        <Text style={[styles.statValue, { color: theme.foreground }]}>{value}</Text>
        <Text style={[styles.statDescription, { color: theme.mutedForeground }]}>
          {description}
        </Text>
      </CardContent>
    </Card>
  );
}

// O componente NavCard e seu uso foram removidos.
// function NavCard(...) { ... }

export default function TelaDashboard() {
  const { user } = useAuth();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;

  // Simulação de contagem (substitua pela sua lógica de API/estado)
  const stats = {
    materias: 0,
    flashcards: 0,
    objetivos: 0,
    pomodoro: 0,
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            Bem-vindo, {user?.nome?.split(' ')[0]}!
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            Gerencie seus estudos e alcance seus objetivos
          </Text>
        </View>

        {/* Grid de Estatísticas (MANTIDO) */}
        <View style={styles.grid}>
          <StatCard
            title="Matérias"
            value={stats.materias}
            description="matérias cadastradas"
            icon={BookOpen}
          />
          <StatCard
            title="Flashcards"
            value={stats.flashcards}
            description="flashcards criados"
            icon={TrendingUp}
          />
          <StatCard
            title="Objetivos"
            value={stats.objetivos}
            description="objetivos ativos"
            icon={Target}
          />
          <StatCard
            title="Pomodoro"
            value={stats.pomodoro}
            description="sessões completadas"
            icon={Timer}
          />
        </View>

        {/* O Grid de Navegação (Gerenciar Matérias/Objetivos/Pomodoro)
          foi removido para evitar redundância com as abas inferiores. 
        */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 32,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  // Configuração da grade 2x2 para os StatCards
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48.5%', 
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statDescription: {
    fontSize: 12,
  },
  // navGrid e navCard não são mais usados
});
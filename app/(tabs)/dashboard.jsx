// app/(tabs)/dashboard.jsx

import { useRouter } from 'expo-router';
import {
  BookOpen,
  Target,
  Timer,
  TrendingUp,
  UserCircle, 
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit'; 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../componentes/Card';
import { useAuth } from '../../contexto/AuthContexto';
import { cores } from '../../tema/cores';

const MOCK_DASHBOARD_DATA = {
  1: {
    materias: 2,
    flashcards: 3,
    objetivos: 1, 
    pomodoro: 5,
    performance: [
      { dia: 'Seg', valor: 20 },
      { dia: 'Ter', valor: 45 },
      { dia: 'Qua', valor: 70 },
      { dia: 'Qui', valor: 65 },
      { dia: 'Sex', valor: 90 },
      { dia: 'Sáb', valor: 75 },
    ],
  },
};

function StatCard({ title, value, description, icon: Icon }) {
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];
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

function PerformanceChart({ performanceData }) {
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const screenWidth = Dimensions.get('window').width;
  const scrollViewPaddingHorizontal = 20;
  const chartWidth = screenWidth - scrollViewPaddingHorizontal * 2 - 10; 

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => theme.mutedForeground,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.primary,
    },
  };

  const chartData = {
    labels: performanceData.map((d) => d.dia),
    datasets: [
      {
        data: performanceData.map((d) => d.valor),
      },
    ],
  };

  return (
    <Card style={{ padding: 0 }}>
      <CardHeader style={{ paddingBottom: 0, paddingHorizontal: 20 }}>
        <CardTitle style={{ color: theme.foreground, fontSize: 20 }}>
          Desempenho Semanal (%)
        </CardTitle>
        <CardDescription>
          Representa o seu índice de completude de tarefas e metas.
        </CardDescription>
      </CardHeader>
      <View style={{ paddingTop: 16, alignItems: 'center' }}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            marginHorizontal: -10,
          }}
          fromZero
        />
      </View>
    </Card>
  );
}

export default function TelaDashboard() {
  const { user } = useAuth();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [stats, setStats] = useState({
    materias: 0,
    flashcards: 0,
    objetivos: 0,
    pomodoro: 0,
    performance: [],
  });

  useEffect(() => {
    const userId = user?.id || 1;
    const data = MOCK_DASHBOARD_DATA[userId] || MOCK_DASHBOARD_DATA[1];

    if (data) {
      setStats(data);
    }
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {}
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.title, { color: theme.foreground }]}>
              Bem-vindo, {user?.nome?.split(' ')[0] || 'Usuário'}!
            </Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Gerencie seus estudos e alcance seus objetivos
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/perfil')}
            style={styles.profileButton}
          >
            <UserCircle size={40} color={theme.primary} />
          </TouchableOpacity>
        </View>
        {}

        {stats.performance.length > 0 && (
          <PerformanceChart performanceData={stats.performance} />
        )}

        {}
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
          {/* ALTERAÇÃO 2: Renomeado o card de estatística */}
          <StatCard
            title="Metas"
            value={stats.objetivos}
            description="metas ativas"
            icon={Target}
          />
          <StatCard
            title="Pomodoro"
            value={stats.pomodoro}
            description="sessões completadas"
            icon={Timer}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  profileButton: {
  
  },
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
});
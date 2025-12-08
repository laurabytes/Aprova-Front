// app/(tabs)/dashboard.jsx
import { useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  PenLine,
  Play,
  Target,
  Timer,
  TrendingUp,
  UserCircle 
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexto/AuthContexto';
import { useStudyData } from '../../contexto/StudyDataContexto';
import { useSubjects } from '../../contexto/SubjectContexto';
import { cores } from '../../tema/cores';

// Componente: Header do Mascote
function MascotHeader({ user, theme }) {
  return (
    <View style={styles.mascotSection}>
      {/* Lado do Mascote */}
      <View style={styles.mascotContainer}>
        <Image 
          source={require('../../assets/images/mascote.png')} 
          style={styles.mascotImage} 
          resizeMode="contain"
        />
      </View>

      {/* Lado do Balão de Fala */}
      <View style={[styles.speechBubble, { backgroundColor: theme.card, shadowColor: theme.primary }]}>
        <View style={styles.speechArrow} />
        <Text style={[styles.speechTitle, { color: theme.primary }]}>
          Fala, {user?.nome?.split(' ')[0] || 'Fera'}!
        </Text>
        <Text style={[styles.speechText, { color: theme.mutedForeground }]}>
          Pronto para abocanhar a aprovação hoje? 🦈
        </Text>
      </View>
    </View>
  );
}

// Card de Estatística Estilizado
function OceanStatCard({ title, value, icon: Icon, theme }) {
  return (
    <View style={[styles.oceanCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8}}>
        <View style={[styles.oceanIconBox, { backgroundColor: theme.primary + '15' }]}>
            <Icon size={18} color={theme.primary} />
        </View>
        <Text style={[styles.oceanCardTitle, { color: theme.mutedForeground }]}>{title}</Text>
      </View>
      <Text style={[styles.oceanCardValue, { color: theme.foreground }]}>{value}</Text>
    </View>
  );
}

export default function TelaDashboard() {
  const { user } = useAuth();
  const { subjects, isLoading: isSubjectsLoading, getFlashcardsBySubject } = useSubjects();
  const { goals, sessions, getDailyStudyMinutesData, isLoading: isStudyLoading, foco, updateFoco } = useStudyData();
  
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const [stats, setStats] = useState({
    materias: 0,
    flashcards: 0,
    objetivos: 0,
    pomodoro: 0,
    studyData: [],
  });
  
  const isLoading = isSubjectsLoading || isStudyLoading;

  useEffect(() => {
    if (!isLoading) {
        const totalMaterias = subjects.length;
        const totalFlashcards = subjects.reduce((sum, subject) => {
            const flashcards = getFlashcardsBySubject(subject.id); 
            return sum + (flashcards?.length || 0);
        }, 0);
        const activeGoals = goals.filter(g => g.status !== 1 && g.status !== 'CONCLUIDO');
        const completedWorkSessions = sessions.filter(s => s.tipo === 'TRABALHO');
        const weeklyStudyData = getDailyStudyMinutesData();

        setStats({
            materias: totalMaterias,
            flashcards: totalFlashcards,
            objetivos: activeGoals.length,
            pomodoro: completedWorkSessions.length,
            studyData: weeklyStudyData,
        });
    }
  }, [isLoading, subjects, goals, sessions, getFlashcardsBySubject, getDailyStudyMinutesData]);

  if (isLoading) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </SafeAreaView>
      );
  }

  // CORREÇÃO DO ERRO "L-Infinity":
  // Verifica se existe algum dado maior que zero. Se todos forem 0, hasData é false.
  const hasData = stats.studyData.some(d => d.valor > 0);

  const chartConfig = {
    backgroundColor: theme.background,
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => theme.mutedForeground,
    style: { borderRadius: 16 },
    propsForDots: { r: '5', strokeWidth: '2', stroke: theme.card },
    propsForBackgroundLines: { strokeDasharray: '5, 5', stroke: theme.border },
  };

  const chartData = {
    labels: stats.studyData.map((d) => d.dia),
    datasets: [{ data: stats.studyData.map((d) => d.valor) }],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 0. BARRA SUPERIOR */}
        <View style={styles.topBar}>
            <View>
                <Text style={[styles.dateText, { color: theme.mutedForeground }]}>
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
            </View>
            <TouchableOpacity 
                onPress={() => router.push('/(tabs)/minha-conta')} 
                style={[styles.profileButton, { borderColor: theme.border }]}
            >
                <UserCircle size={32} color={theme.primary} />
            </TouchableOpacity>
        </View>

        {/* 1. SEÇÃO DO MASCOTE */}
        <MascotHeader user={user} theme={theme} />

        {/* 2. CAMPO DE FOCO (MISSÃO) */}
        <View style={styles.missionContainer}>
            <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>SUA MISSÃO ATUAL</Text>
            <View style={[styles.focusInputContainer, { backgroundColor: theme.card, borderColor: theme.primary }]}>
                <Target size={20} color={theme.primary} />
                <TextInput 
                    style={[styles.focusInput, { color: theme.foreground }]}
                    placeholder="exemplo: UERJ"
                    placeholderTextColor={theme.mutedForeground}
                    value={foco}
                    onChangeText={updateFoco}
                />
                <PenLine size={16} color={theme.mutedForeground} />
            </View>
        </View>

        {/* 3. ESTATÍSTICAS */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Meu Progresso</Text>
        <View style={styles.statsGrid}>
            <OceanStatCard 
                title="Sessões Foco" 
                value={stats.pomodoro} 
                icon={Timer} 
                theme={theme}
            />
            <OceanStatCard 
                title="Cards Criados" 
                value={stats.flashcards} 
                icon={TrendingUp} 
                theme={theme}
            />
            <OceanStatCard 
                title="Metas Ativas" 
                value={stats.objetivos} 
                icon={Award} 
                theme={theme}
            />
            <OceanStatCard 
                title="Matérias" 
                value={stats.materias} 
                icon={BookOpen} 
                theme={theme}
            />
        </View>

        {/* 4. BOTÃO DE AÇÃO */}
        <TouchableOpacity 
            style={[styles.diveButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/pomodoro')}
            activeOpacity={0.9}
        >
            <Text style={styles.diveButtonText}>Mergulhar nos Estudos</Text>
            <View style={styles.diveIconCircle}>
                <Play size={20} color={theme.primary} fill={theme.primary} />
            </View>
        </TouchableOpacity>

        {/* 5. GRÁFICO (ONDAS DE ESTUDO) */}
        <View style={{ marginTop: 24, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                <TrendingUp size={20} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: theme.foreground, marginBottom: 0 }]}>
                    Ondas de Estudo (min)
                </Text>
            </View>
            
            {/* CORREÇÃO AQUI: 
               Renderização Condicional. Se hasData for false, mostra "Sem atividade" 
               em vez de tentar renderizar um gráfico flat que causa erro.
            */}
            {hasData ? (
                <LineChart
                    data={chartData}
                    width={screenWidth - 40} 
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                    fromZero
                    withInnerLines={false}
                    withOuterLines={false}
                    yAxisInterval={1}
                />
            ) : (
                <View style={[styles.emptyChartContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={{ color: theme.mutedForeground, textAlign: 'center' }}>
                        Nenhuma atividade registrada essa semana. {'\n'}
                        Complete uma sessão de estudo para ver o gráfico! 
                    </Text>
                </View>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },

  // TOP BAR
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  profileButton: {
    padding: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  
  // MASCOTE
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  mascotContainer: {
    marginRight: 16,
  },
  mascotImage: {
    width: 115, 
    height: 115, 
    borderRadius: 50, 
    borderWidth: 2,
    borderColor: 'transparent', 
    resizeMode: 'contain',
  },
  
  // BALÃO DE FALA
  speechBubble: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4, 
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  speechTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  speechText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // FOCO / MISSÃO
  missionContainer: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  focusInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12, 
    gap: 12,
  },
  focusInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  // GRID DE ESTATÍSTICAS
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  oceanCard: {
    width: '48%', 
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  oceanIconBox: {
    padding: 6,
    borderRadius: 8,
  },
  oceanCardTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  oceanCardValue: {
    fontSize: 24,
    fontWeight: '700',
  },

  // BOTÃO MERGULHAR
  diveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 99, 
    shadowColor: '#2693BE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  diveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  diveIconCircle: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
  },

  // ESTILO DO GRÁFICO VAZIO (NOVO)
  emptyChartContainer: {
      height: 180,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      marginTop: 8,
  },
});
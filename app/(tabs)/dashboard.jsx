// app/(tabs)/dashboard.jsx
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Target,
  Timer,
  TrendingUp,
  Play,
  Award,
  Zap,
  PenLine,
  UserCircle // Importado de volta
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  StatusBar,
  Image // Importante para colocar o mascote depois
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';

import { useAuth } from '../../contexto/AuthContexto';
import { useSubjects } from '../../contexto/SubjectContexto';
import { useStudyData } from '../../contexto/StudyDataContexto';
import { cores } from '../../tema/cores';

// Componente: Header do Mascote
function MascotHeader({ user, theme }) {
  return (
    <View style={styles.mascotSection}>
      {/* Lado do Mascote */}
      <View style={styles.mascotContainer}>
        {/* AQUI É ONDE VOCÊ VAI COLOCAR A IMAGEM DO TUBARÃO 
           Substitua o <View> abaixo por:
           <Image source={require('../../assets/images/seu-tubarao.png')} style={styles.mascotImage} />
        */}
        <View style={[styles.mascotPlaceholder, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
            <Zap size={32} color={theme.primary} />
            <Text style={{fontSize: 10, color: theme.primary, fontWeight:'bold', marginTop: 4}}>MASCOTE</Text>
        </View>
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
        
        {/* 0. BARRA SUPERIOR (NOVO: Perfil e Data) */}
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

        {/* 3. ESTATÍSTICAS (O OCEANO DE DADOS) */}
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

        {/* 4. BOTÃO DE AÇÃO (MERGULHAR) */}
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

  // TOP BAR (NOVO)
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
  // Use esse estilo quando colocar a <Image>
  mascotImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  // Placeholder temporário
  mascotPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // BALÃO DE FALA
  speechBubble: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4, // "Bico" do balão
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
    paddingVertical: 12, // Um pouco mais alto
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
    width: '48%', // Divide em 2 colunas
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
    borderRadius: 99, // Botão Pílula
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
});
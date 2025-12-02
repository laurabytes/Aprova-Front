// app/(tabs)/pomodoro.jsx
import { 
  Coffee, 
  Pause, 
  Play, 
  RotateCcw, 
  Timer, 
  Zap, 
  CheckCircle2 
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Componentes
import { Botao } from '../../componentes/Botao';
import { Progress } from '../../componentes/Progress';
import { Select, SelectItem } from '../../componentes/Select';

// Contextos
import { useAuth } from '../../contexto/AuthContexto';
import { useSubjects } from '../../contexto/SubjectContexto';
import { useStudyData } from '../../contexto/StudyDataContexto'; 
import { cores } from '../../tema/cores';

// Header do Mascote (Dinâmico: Foco vs Pausa)
function MascotHeader({ sessionType, theme }) {
  const isWork = sessionType === 'TRABALHO';
  
  return (
    <View style={styles.mascotSection}>
      <View style={styles.mascotContainer}>
        {/* Placeholder para imagem do Tubarão */}
        <View style={[styles.mascotPlaceholder, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
            {isWork ? <Zap size={32} color={theme.primary} /> : <Coffee size={32} color={theme.primary} />}
            <Text style={{fontSize: 10, color: theme.primary, fontWeight:'bold', marginTop: 4}}>
                {isWork ? 'FOCADO' : 'RELAX'}
            </Text>
        </View>
      </View>

      <View style={[styles.speechBubble, { backgroundColor: theme.card, shadowColor: theme.primary }]}>
        <View style={styles.speechArrow} />
        <Text style={[styles.speechTitle, { color: theme.primary }]}>
          {isWork ? 'Modo Foco Ativado!' : 'Hora de Relaxar!'}
        </Text>
        <Text style={[styles.speechText, { color: theme.mutedForeground }]}>
          {isWork 
            ? 'Sem distrações agora, hein? Vamos nadar até a aprovação! 🦈' 
            : 'Respire fundo e recarregue as energias para o próximo mergulho.'}
        </Text>
      </View>
    </View>
  );
}

// Card de Estatística (Estilo Oceano) - Com ajuste de quebra de linha
function OceanStatCard({ title, value, icon: Icon, theme }) {
  return (
    <View style={[styles.oceanCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8}}>
        <View style={[styles.oceanIconBox, { backgroundColor: theme.primary + '15' }]}>
            <Icon size={18} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={[styles.oceanCardTitle, { color: theme.mutedForeground }]}>{title}</Text>
        </View>
      </View>
      <Text style={[styles.oceanCardValue, { color: theme.foreground }]}>{value}</Text>
    </View>
  );
}

export default function TelaPomodoro() {
  const { user } = useAuth();
  const { subjects: availableSubjects, isLoading: isSubjectsLoading } = useSubjects();
  const { sessions, addSession, isLoading: isStudyLoading } = useStudyData(); 
  
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const workDuration = 25 * 60;
  const breakDuration = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(workDuration); 
  const [sessionType, setSessionType] = useState('TRABALHO');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const intervalRef = useRef(null);
  
  const isLoading = isSubjectsLoading || isStudyLoading;

  useEffect(() => {
    if (availableSubjects) {
        setSubjects(availableSubjects);
    }
  }, [availableSubjects]); 

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, sessionType, sessions]);

  const saveSession = async (secondsElapsed) => {
    if (sessionType === 'TRABALHO' && secondsElapsed >= 60) {
      try {
        const durationMinutes = Math.floor(secondsElapsed / 60);
        
        const newSession = {
          duracao: durationMinutes,
          dataInicio: sessionStartTime ? sessionStartTime.toISOString() : new Date().toISOString(),
          dataFim: new Date().toISOString(),
          tipo: 'TRABALHO',
          usuarioId: user?.id,
          materiaId: selectedSubject || null,
        };
        
        await addSession(newSession);
        return true; 
      } catch (error) {
        console.error('Erro ao salvar sessão parcial:', error);
      }
    }
    return false;
  };

  const handleStart = () => {
    if (!isRunning) {
      if (!sessionStartTime) {
          setSessionStartTime(new Date());
      }
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const currentDuration = sessionType === 'TRABALHO' ? workDuration : breakDuration;
    const elapsed = currentDuration - timeLeft;

    const saved = await saveSession(elapsed);
    
    if (saved) {
        Alert.alert("Progresso Salvo", "Os minutos que você estudou foram registrados mesmo sem concluir o timer.");
    }

    setIsRunning(false);
    setTimeLeft(sessionType === 'TRABALHO' ? workDuration : breakDuration);
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (sessionType === 'TRABALHO') {
        await saveSession(workDuration);
    }

    Alert.alert(
      'Ciclo Completo!',
      sessionType === 'TRABALHO'
        ? 'Parabéns! Hora de fazer uma pausa.'
        : 'Intervalo acabou. Hora de voltar ao trabalho!',
    );

    if (sessionType === 'TRABALHO') {
      setSessionType('PAUSA');
      setTimeLeft(breakDuration);
    } else {
      setSessionType('TRABALHO');
      setTimeLeft(workDuration);
    }
    setSessionStartTime(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return sessions.filter((s) => new Date(s.dataInicio).toDateString() === today && s.tipo === 'TRABALHO');
  };

  const getTotalMinutesToday = () => {
    return getTodaySessions().reduce((total, s) => total + s.duracao, 0);
  };
  
  const getAllSessions = () => {
    return sessions.filter(s => s.tipo === 'TRABALHO');
  }

  const progress =
    (((sessionType === 'TRABALHO' ? workDuration : breakDuration) - timeLeft) /
      (sessionType === 'TRABALHO' ? workDuration : breakDuration)) *
    100;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. MASCOTE (Agora é o topo) */}
        <MascotHeader sessionType={sessionType} theme={theme} />

        {/* 2. CRONÔMETRO */}
        <View style={[styles.timerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.sessionBadge, { backgroundColor: sessionType === 'TRABALHO' ? theme.primary + '20' : theme.muted }]}>
                {sessionType === 'TRABALHO' ? (
                  <Timer size={14} color={theme.primary} style={{ marginRight: 6 }} />
                ) : (
                  <Coffee size={14} color={theme.mutedForeground} style={{ marginRight: 6 }} />
                )}
                <Text style={{ fontSize: 12, fontWeight: '700', color: sessionType === 'TRABALHO' ? theme.primary : theme.mutedForeground }}>
                    {sessionType === 'TRABALHO' ? 'SESSÃO DE ESTUDO' : 'HORA DA PAUSA'}
                </Text>
            </View>

            <Text style={[styles.timerText, { color: theme.foreground }]}>
                {formatTime(timeLeft)}
            </Text>

            <Progress value={progress} style={{ width: '100%', height: 12, borderRadius: 6, marginBottom: 24 }} />

            {sessionType === 'TRABALHO' && (
                <View style={styles.pickerContainer}>
                  <Text style={[styles.label, { color: theme.mutedForeground }]}>Matéria do Foco (Opcional)</Text>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                    enabled={!isRunning}
                  >
                    <SelectItem label="Selecionar Matéria..." value="" />
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} label={subject.nome} value={subject.id} /> 
                    ))}
                  </Select>
                </View>
            )}

            <View style={styles.controlsRow}>
                {!isRunning ? (
                  <Botao onPress={handleStart} style={{ flex: 1, borderRadius: 12 }}>
                    <Play color={theme.primaryForeground} size={20} style={{ marginRight: 8 }} fill={theme.primaryForeground}/>
                    Iniciar
                  </Botao>
                ) : (
                  <Botao variant="destructive" onPress={handlePause} style={{ flex: 1, borderRadius: 12 }}>
                    <Pause color={theme.primaryForeground} size={20} style={{ marginRight: 8 }} fill={theme.primaryForeground}/>
                    Pausar
                  </Botao>
                )}
                
                <TouchableOpacity 
                    onPress={handleReset} 
                    style={[styles.resetButton, { borderColor: theme.border }]}
                >
                    <RotateCcw color={theme.mutedForeground} size={20} />
                </TouchableOpacity>
            </View>
        </View>

        {/* 3. ESTATÍSTICAS DO DIA */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Resumo de Hoje</Text>
        <View style={styles.statsGrid}>
            <OceanStatCard 
                title="Sessões Completas"
                value={getTodaySessions().length}
                icon={CheckCircle2}
                theme={theme}
            />
            <OceanStatCard 
                title="Minutos Realizados" 
                value={getTotalMinutesToday()}
                icon={Timer}
                theme={theme}
            />
        </View>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
                Total acumulado: {getAllSessions().length} registros
            </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 100 }, 

  // MASCOTE
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10, // Margem superior adicionada para compensar a remoção do topo
  },
  mascotContainer: {
    marginRight: 16,
  },
  mascotPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

  // TIMER CARD
  timerCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 24,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
  },
  sessionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginBottom: 16,
  },
  timerText: {
      fontSize: 64,
      fontWeight: '700',
      fontVariant: ['tabular-nums'], 
      marginBottom: 16,
      letterSpacing: 2,
  },
  pickerContainer: {
      width: '100%',
      marginBottom: 24,
  },
  label: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
      marginLeft: 4,
  },
  controlsRow: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
  },
  resetButton: {
      width: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
  },

  // STATS
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  oceanCard: {
    flex: 1,
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
    flexWrap: 'wrap',
  },
  oceanCardValue: {
    fontSize: 24,
    fontWeight: '700',
  },
});
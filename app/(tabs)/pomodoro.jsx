// app/(tabs)/pomodoro.jsx
import { Coffee, Pause, Play, RotateCcw, Timer } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';
// import api from '../../lib/api'; // API REMOVIDA
import { Botao } from '../../componentes/Botao';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../componentes/Card';
import { Progress } from '../../componentes/Progress';
import { Select, SelectItem } from '../../componentes/Select';
import { useAuth } from '../../contexto/AuthContexto';
import { useSubjects } from '../../contexto/SubjectContexto'; // NOVO: Importar useSubjects
import { cores } from '../../tema/cores';

// Mock de dados - ATUALIZADO
// const MOCK_SUBJECTS = [ ... ];
const MOCK_SESSIONS = [
    { id: 1, duracao: 25, dataInicio: new Date().toISOString(), tipo: 'TRABALHO', usuarioId: 1 }
];

export default function TelaPomodoro() {
  const { user } = useAuth();
  // USAR CONTEXTO: Obter subjects do contexto
  const { subjects: availableSubjects } = useSubjects();
  
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;

  // ATUALIZAR: usar subjects do contexto
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min
  const [sessionType, setSessionType] = useState('TRABALHO');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const intervalRef = useRef(null);

  const workDuration = 25 * 60;
  const breakDuration = 5 * 60;

  useEffect(() => {
    // ATUALIZAR: Usar availableSubjects do contexto
    if (availableSubjects) {
        setSubjects(availableSubjects);
    }
    // Simula carregamento
    setSessions(MOCK_SESSIONS.filter(s => s.usuarioId === user?.id));
  }, [user, availableSubjects]); // Adicionado availableSubjects como dependência

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
  }, [isRunning, sessionType]);

  const handleStart = () => {
    if (!isRunning) {
      setSessionStartTime(new Date());
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(sessionType === 'TRABALHO' ? workDuration : breakDuration);
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (sessionStartTime && sessionType === 'TRABALHO') {
      try {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60);

        const newSession = {
          id: Math.random(),
          duracao: duration || 25,
          dataInicio: sessionStartTime.toISOString(),
          dataFim: endTime.toISOString(),
          tipo: sessionType,
          usuarioId: user?.id,
          materiaId: selectedSubject || null,
        };
        // Adiciona a sessão ao estado local
        setSessions(prev => [newSession, ...prev]);

      } catch (error) {
        console.error('[v0] Error saving session:', error);
        Alert.alert('Erro', 'Não foi possível salvar a sessão.');
      }
    }

    Alert.alert(
      'Pomodoro Completo!',
      sessionType === 'TRABALHO'
        ? 'Hora de fazer uma pausa!'
        : 'Hora de voltar ao trabalho!',
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
    return sessions.filter((s) => new Date(s.dataInicio).toDateString() === today);
  };

  const getTotalMinutesToday = () => {
    return getTodaySessions().reduce((total, s) => total + s.duracao, 0);
  };

  const progress =
    (((sessionType === 'TRABALHO' ? workDuration : breakDuration) - timeLeft) /
      (sessionType === 'TRABALHO' ? workDuration : breakDuration)) *
    100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>Pomodoro Timer</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            Use a técnica Pomodoro para estudar com foco
          </Text>
        </View>

        <View style={styles.contentGrid}>
          <Card style={styles.timerCard}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                {sessionType === 'TRABALHO' ? (
                  <Timer color={theme.foreground} size={20} />
                ) : (
                  <Coffee color={theme.foreground} size={20} />
                )}
                <Text style={{ color: theme.foreground, marginLeft: 8 }}>
                  {sessionType === 'TRABALHO' ? 'Sessão de Estudo' : 'Pausa'}
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.timerContent}>
              <Text style={[styles.timerText, { color: theme.foreground }]}>
                {formatTime(timeLeft)}
              </Text>
              <Progress value={progress} style={{ width: '100%' }} />

              {sessionType === 'TRABALHO' && (
                <View style={styles.pickerContainer}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Matéria (opcional)</Text>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                    enabled={!isRunning}
                  >
                    <SelectItem label="Nenhuma matéria" value="" />
                    {subjects.map((subject) => (
                      // A chave (key) e o valor (value) usam o ID único da matéria
                      <SelectItem key={subject.id} label={subject.nome} value={subject.id} /> 
                    ))}
                  </Select>
                </View>
              )}

              {/* AQUI ESTÁ A MUDANÇA NO paddingHorizontal DO buttonRow
                */}
              <View style={[styles.buttonRow, { paddingHorizontal: 16 }]}>
                {!isRunning ? (
                  <Botao onPress={handleStart} style={{ flex: 1 }}>
                    <Play color={theme.primaryForeground} size={18} style={{ marginRight: 8 }} />
                    Iniciar
                  </Botao>
                ) : (
                  <Botao variant="destructive" onPress={handlePause} style={{ flex: 1 }}>
                    <Pause color={theme.primaryForeground} size={18} style={{ marginRight: 8 }} />
                    Pausar
                  </Botao>
                )}
                <Botao variant="outline" onPress={handleReset} style={{ flex: 1 }}>
                  <RotateCcw color={theme.foreground} size={18} />
                </Botao>
              </View>
            </CardContent>
          </Card>

          <View style={styles.statsContainer}>
            <Card style={{ width: '100%' }}>
              <CardHeader>
                <CardTitle style={{ color: theme.foreground }}>Hoje</CardTitle>
                <CardDescription>Sessões completadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Text style={[styles.statText, { color: theme.foreground }]}>
                  {getTodaySessions().length}
                </Text>
                <Text style={[styles.statSubText, { color: theme.mutedForeground }]}>
                  {getTotalMinutesToday()} minutos
                </Text>
              </CardContent>
            </Card>
            <Card style={{ width: '100%' }}>
              <CardHeader>
                <CardTitle style={{ color: theme.foreground }}>Total</CardTitle>
                <CardDescription>Todas as sessões</CardDescription>
              </CardHeader>
              <CardContent>
                <Text style={[styles.statText, { color: theme.foreground }]}>
                  {sessions.length}
                </Text>
                <Text style={[styles.statSubText, { color: theme.mutedForeground }]}>
                  {sessions.reduce((total, s) => total + s.duracao, 0)} minutos
                </Text>
              </CardContent>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 60 },
  header: { gap: 4 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  contentGrid: { gap: 24 },
  timerCard: {},
  cardTitle: { flexDirection: 'row', alignItems: 'center' },
  timerContent: { alignItems: 'center', gap: 24 },
  timerText: { fontSize: 60, fontWeight: '700', letterSpacing: 1.5 },
  pickerContainer: { width: '100%', gap: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#262626' },
  buttonRow: { flexDirection: 'row', gap: 16 }, // Este estilo base já está no lugar
  statsContainer: { gap: 16 },
  statText: { fontSize: 28, fontWeight: '700' },
  statSubText: { fontSize: 12, marginTop: 2 },
});
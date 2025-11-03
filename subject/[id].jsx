import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from "react-native-chart-kit";
import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { ProgressBar } from '../../components/ProgressBar';
import { GoalsContext } from '../../context/GoalsContext';
import { SessionsContext } from '../../context/SessionsContext';
import { SubjectsContext } from '../../context/SubjectsContext';
import { colors, fonts, spacing } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';

// Função para decidir a cor do texto (preto ou branco)
function getTextColorForBackground(hexColor) {
  try {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 140 ? colors.primaryText : colors.white;
  } catch (e) { return colors.primaryText; }
}

const screenWidth = Dimensions.get("window").width;

export default function SubjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  
  const { subjects } = useContext(SubjectsContext);
  const { goals } = useContext(GoalsContext);
  const { sessions } = useContext(SessionsContext);

  const subject = subjects.find((s) => s.id === id);

  // Filtra metas e sessões que pertencem a esta matéria
  const subjectGoals = useMemo(() => goals.filter(g => g.subjectId === id), [goals, id]);
  const subjectSessions = useMemo(() => sessions.filter(s => s.subjectId === id), [sessions, id]);

  // Prepara os dados para o gráfico
  const chartData = useMemo(() => {
    const dataMap = new Map();
    subjectSessions.forEach(session => {
      // AGORA ISTO FUNCIONA! `session.date` é um ISO string.
      const dateKey = new Date(session.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
      const currentDuration = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, currentDuration + session.duration);
    });

    // Pega as últimas 7 datas
    const labels = Array.from(dataMap.keys()).slice(0, 7).reverse();
    const data = labels.map(label => (dataMap.get(label) / 60).toFixed(1)); // Converte para horas

    if (labels.length === 0) return null;

    return {
      labels: labels,
      datasets: [{ data: data }],
    };
  }, [subjectSessions]);

  if (!subject) {
    return (
      <View style={commonStyles.container}>
        <Header showBackButton onBackPress={() => router.back()} title="Erro" />
        <Text style={styles.title}>Matéria não encontrada</Text>
      </View>
    );
  }

  const subjectColor = subject.color;
  const textColor = getTextColorForBackground(subjectColor);
  const totalHours = subjectSessions.reduce((sum, s) => sum + s.duration, 0) / 60; // Total de horas

  return (
    <View style={commonStyles.container}>
      <Stack.Screen options={{ header: () => ( <Header showBackButton onBackPress={() => router.back()} title="" style={{ backgroundColor: subjectColor }} /> ), }} />
      
      <ScrollView>
        <View style={[styles.header, { backgroundColor: subjectColor }]}>
          <Text style={[styles.title, { color: textColor }]}>{subject.name}</Text>
          <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]}>
            {totalHours.toFixed(1)}H estudadas no total
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <Card>
            <Text style={styles.cardTitle}>Desempenho (Horas de Estudo)</Text>
            {chartData ? (
              <BarChart
                data={chartData}
                width={screenWidth - (spacing.md * 4)} 
                height={220}
                yAxisSuffix="h"
                chartConfig={{
                  backgroundGradientFromOpacity: 0,
                  backgroundGradientToOpacity: 0,
                  color: (opacity = 1) => subjectColor, 
                  labelColor: (opacity = 1) => colors.secondaryText,
                  propsForBackgroundLines: { stroke: colors.gray, strokeDasharray: '', strokeWidth: 0.5 },
                  barPercentage: 0.7,
                }}
                fromZero
                showValuesOnTopOfBars
                style={{ borderRadius: 16 }}
              />
            ) : (
              <Text style={styles.emptyText}>Nenhuma sessão registrada para gerar o gráfico.</Text>
            )}
          </Card>
          
          <Text style={styles.sectionTitle}>Metas de {subject.name}</Text>
          {subjectGoals.length > 0 ? (
            subjectGoals.map(goal => (
              <Card key={goal.id} style={styles.goalCard}>
                <View style={[styles.priorityBorder, { backgroundColor: goal.statusColor }]} />
                <View style={styles.goalContent}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription} numberOfLines={1}>{goal.description}</Text>
                  <ProgressBar progress={goal.progress} color={goal.statusColor} />
                </View>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma meta cadastrada para esta matéria.</Text>
          )}

          <Text style={styles.sectionTitle}>Sessões de {subject.name}</Text>
          {subjectSessions.length > 0 ? (
            subjectSessions.map(session => (
              <Card key={session.id} style={styles.sessionCard}>
                <Text style={styles.sessionTopic}>{session.topic}</Text>
                <Text style={styles.sessionTime}>{new Date(session.date).toLocaleDateString('pt-BR')} às {session.time} ({session.duration} min)</Text>
              </Card>
            ))
          ) : (
             <Text style={styles.emptyText}>Nenhuma sessão agendada para esta matéria.</Text>
          )}
          <View style={{height: 30}} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: spacing.xs, },
  subtitle: { fontSize: fonts.bodySize, },
  contentContainer: { flex: 1, padding: spacing.md, marginTop: -spacing.lg, },
  sectionTitle: { fontSize: fonts.titleSize, fontWeight: '600', color: colors.primaryText, marginTop: spacing.lg, marginBottom: spacing.sm },
  cardTitle: { fontSize: fonts.subtitleSize, fontWeight: '600', color: colors.primaryText, marginBottom: spacing.md, },
  emptyText: { textAlign: 'center', color: colors.secondaryText, marginVertical: spacing.md },
  goalCard: { flexDirection: 'row', padding: 0, overflow: 'hidden', marginBottom: spacing.sm },
  priorityBorder: { width: 8 },
  goalContent: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  goalTitle: { fontSize: fonts.subtitleSize, fontWeight: '600', color: colors.primaryText, marginBottom: spacing.xs },
  goalDescription: { fontSize: fonts.bodySize, color: colors.secondaryText, marginBottom: spacing.sm, },
  progressContainer: { flexDirection: 'row', alignItems: 'center', },
  progressText: { fontSize: fonts.bodySize, color: colors.primaryText, marginLeft: spacing.sm, fontWeight: '600' },
  sessionCard: { marginBottom: spacing.sm },
  sessionTopic: { fontSize: fonts.subtitleSize, fontWeight: '600', color: colors.primaryText, marginBottom: spacing.xs },
  sessionTime: { fontSize: fonts.bodySize, color: colors.secondaryText, },
});
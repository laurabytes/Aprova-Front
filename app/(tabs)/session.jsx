import DateTimePicker from '@react-native-community/datetimepicker'; // 1. Importar o seletor de data
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SessionsContext } from '../../context/SessionsContext';
import { SubjectsContext } from '../../context/SubjectsContext';
import { colors, fonts, spacing } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';

const POMODORO_TIME = 25 * 60;

export default function SessionScreen() {
  const { subjects } = useContext(SubjectsContext); 
  const { sessions, setSessions } = useContext(SessionsContext); 

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('50');
  const [date, setDate] = useState(new Date()); // 2. Mudar para um objeto Date
  const [time, setTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false); // 3. Estado para controlar o seletor

  const [timeRemaining, setTimeRemaining] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    if (timeRemaining <= 0) {
      setIsActive(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sessão Finalizada!", "Bom trabalho! Faça uma pausa.");
      setTimeRemaining(POMODORO_TIME);
      return;
    }
    const timerId = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    return () => clearTimeout(timerId);
  }, [isActive, timeRemaining]);

  const handleStartPause = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsActive(!isActive); };
  const handleReset = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsActive(false); setTimeRemaining(POMODORO_TIME); };
  const formatTime = (seconds) => { const minutes = Math.floor(seconds / 60); const secs = seconds % 60; return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; };

  const handleScheduleSession = () => {
    if (!selectedSubject || !topic || !duration || !date || !time) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos para agendar.');
      return;
    }
    
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'Matéria';
    const newSession = {
      id: Date.now().toString(),
      subjectId: selectedSubject,
      subjectName: subjectName,
      topic: topic,
      date: date.toISOString(), // 4. Salvar como ISO string (um formato universal)
      time: time,
      duration: parseInt(duration, 10), 
    };
    setSessions(currentSessions => [newSession, ...currentSessions]);
    Alert.alert('Sucesso!', 'Sua sessão de estudo foi agendada.');
    
    setSelectedSubject(null);
    setTopic('');
    setDuration('50');
    setDate(new Date());
    setTime('');
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    setDate(currentDate);
  };

  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || "Escolha uma matéria...";

  return (
    <View style={commonStyles.container}>
      <Header showBackButton showProgress currentStep={1} totalSteps={5} />
      <ScrollView style={commonStyles.screenPadding} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pomodoro Rápido</Text>
        <Text style={styles.subtitle}>Use para uma sessão de foco rápido sem agendamento.</Text>
        
        <View style={styles.timerContainer}><View style={styles.timerCircle}><Text style={styles.timerText}>{formatTime(timeRemaining)}</Text></View><View style={styles.buttonRow}><TouchableOpacity style={styles.controlButton} onPress={handleReset}><Text style={styles.controlButtonText}>Reiniciar</Text></TouchableOpacity><TouchableOpacity style={styles.startButton} onPress={handleStartPause}><Text style={styles.startButtonText}>{isActive ? 'Pausar' : 'Iniciar'}</Text></TouchableOpacity></View></View>
        
        <Text style={styles.title}>Agendar Sessão</Text>
        <Text style={styles.subtitle}>Planeje seus estudos futuros.</Text>
        
        <Card>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Selecione a matéria</Text>
            <View style={styles.pickerFakeInput}>
              <Text style={[styles.pickerDisplayText, !selectedSubject && { color: colors.secondaryText }]}>{selectedSubjectName}</Text>
              <Picker selectedValue={selectedSubject} onValueChange={(itemValue) => setSelectedSubject(itemValue)} style={styles.pickerInvisible}>
                <Picker.Item label="Escolha uma matéria..." value={null} />
                {subjects.map((subject) => ( <Picker.Item key={subject.id} label={subject.name} value={subject.id} /> ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}><Text style={styles.label}>Tópico</Text><TextInput style={styles.input} placeholder="Ex: Funções Quadráticas" placeholderTextColor={colors.secondaryText} value={topic} onChangeText={setTopic}/></View>
          
          <View style={styles.row}>
            {/* 5. SUBSTITUIÇÃO DO CAMPO DE DATA */}
            <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.label}>Data</Text>
              {Platform.OS === 'ios' && (
                <DateTimePicker value={date} mode="date" display="compact" onChange={onChangeDate} style={styles.datePickerIOS} />
              )}
              {Platform.OS !== 'ios' && (
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.pickerDisplayText}>{date.toLocaleDateString('pt-BR')}</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Fim da substituição */}

            <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}><Text style={styles.label}>Hora</Text><TextInput style={styles.input} placeholder="HH:MM" placeholderTextColor={colors.secondaryText} value={time} onChangeText={setTime}/></View>
          </View>
          
          <View style={styles.inputGroup}><Text style={styles.label}>Duração (minutos)</Text><TextInput style={styles.input} placeholder="Ex: 50" placeholderTextColor={colors.secondaryText} value={duration} onChangeText={setDuration} keyboardType="numeric"/></View>

          <TouchableOpacity style={styles.scheduleButton} onPress={handleScheduleSession}>
            <Text style={styles.scheduleButtonText}>Agendar</Text>
          </TouchableOpacity>
        </Card>

        {/* 6. Seletor de data para Android/Web */}
        {showDatePicker && Platform.OS !== 'ios' && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}

        <Text style={styles.title}>Próximas Sessões</Text>
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
             <Card style={[styles.sessionCard, { borderLeftColor: subjects.find(s => s.id === item.subjectId)?.color || colors.gray }]}>
               <View>
                 <Text style={styles.sessionSubject}>{item.subjectName}</Text>
                 <Text style={styles.sessionTopic}>{item.topic}</Text>
               </View>
               {/* 7. Formatar a data salva */}
               <Text style={styles.sessionTime}>{new Date(item.date).toLocaleDateString('pt-BR')} às {item.time} ({item.duration} min)</Text>
             </Card>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma sessão agendada.</Text>}
        />
        
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scheduleButton: { backgroundColor: colors.accent, padding: spacing.sm, borderRadius: 8, alignItems: 'center', marginTop: spacing.sm, },
  scheduleButtonText: { color: colors.white, fontWeight: '600', fontSize: fonts.bodySize, },
  sessionCard: { borderLeftWidth: 5, marginBottom: spacing.sm, },
  sessionSubject: { fontSize: fonts.subtitleSize, fontWeight: '600', color: colors.primaryText, },
  sessionTopic: { fontSize: fonts.bodySize, color: colors.secondaryText, marginBottom: spacing.xs, },
  sessionTime: { fontSize: fonts.smallSize, color: colors.primaryText, fontWeight: '500', },
  emptyText: { textAlign: 'center', color: colors.secondaryText, marginTop: spacing.md, },
  pickerFakeInput: { borderWidth: 1, borderColor: colors.gray, borderRadius: 8, height: 42, backgroundColor: colors.white, justifyContent: 'center', paddingHorizontal: spacing.sm, position: 'relative', },
  pickerDisplayText: { fontSize: fonts.bodySize, color: colors.primaryText, },
  pickerInvisible: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0, },
  title: { fontSize: fonts.titleSize, fontWeight: '600', color: colors.primaryText, marginBottom: spacing.xs, marginTop: spacing.md },
  subtitle: { fontSize: fonts.bodySize, color: colors.secondaryText, marginBottom: spacing.md, },
  inputGroup: { marginBottom: spacing.md, },
  label: { fontSize: fonts.bodySize, color: colors.primaryText, marginBottom: spacing.xs, fontWeight: '500', },
  input: { borderWidth: 1, borderColor: colors.gray, borderRadius: 8, padding: spacing.sm, fontSize: fonts.bodySize, color: colors.primaryText, height: 42, justifyContent: 'center' }, // Adicionado justifyContent
  row: { flexDirection: 'row', },
  timerContainer: { alignItems: 'center', marginVertical: spacing.lg, },
  timerCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 8, borderColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, },
  timerText: { fontSize: 48, fontWeight: 'bold', color: colors.primaryText, fontFamily: 'monospace' },
  buttonRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  startButton: { backgroundColor: colors.accent, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: 24, },
  startButtonText: { color: colors.white, fontSize: fonts.subtitleSize, fontWeight: '600', },
  controlButton: { backgroundColor: colors.lightGray, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 24, borderWidth: 1, borderColor: colors.gray },
  controlButtonText: { color: colors.secondaryText, fontSize: fonts.subtitleSize, fontWeight: '500' },
  datePickerIOS: { height: 42, width: '100%', justifyContent: 'center' },
});
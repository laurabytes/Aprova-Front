import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Importar o Picker
import { Calendar, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { ProgressBar } from '../../components/ProgressBar';
import { GoalsContext } from '../../context/GoalsContext';
import { SubjectsContext } from '../../context/SubjectsContext'; // Importar Contexto de Matérias
import { colors, fonts, spacing } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';

const PRIORITIES = [
  { key: 'Alta', text: 'Alta', color: colors.red },
  { key: 'Média', text: 'Média', color: colors.orange },
  { key: 'Baixa', text: 'Baixa', color: colors.accent },
];

// --- Componente para o Card de Meta na Lista ---
function GoalItem({ item, onEdit, onDelete, onToggleComplete }) {
  const formattedDeadline = new Date(item.deadline).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const isComplete = item.progress === 1;

  return (
    <Card style={styles.goalCard}>
      <View style={[styles.priorityBorder, { backgroundColor: item.statusColor }]} />
      <View style={styles.goalContent}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalTitle, isComplete && styles.goalCompleteText]}>{item.title}</Text>
          <View style={styles.goalActions}>
            <TouchableOpacity onPress={onEdit}><Pencil size={18} color={colors.secondaryText} /></TouchableOpacity>
            <TouchableOpacity onPress={onDelete}><Trash2 size={18} color={colors.red} /></TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.goalDescription, isComplete && styles.goalCompleteText]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.progressContainer}>
          <ProgressBar progress={item.progress} color={isComplete ? colors.green : item.statusColor} />
          <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: isComplete ? colors.green : item.statusColor }]}>
            <Text style={styles.statusText}>{isComplete ? 'Concluído!' : `${item.status} - ${formattedDeadline}`}</Text>
          </View>
          {!isComplete && (
            <TouchableOpacity style={styles.completeButton} onPress={onToggleComplete}>
              <CheckCircle2 size={16} color={colors.green} />
              <Text style={styles.completeButtonText}>Concluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
}

// --- Tela Principal ---
export default function GoalsScreen() {
  const { goals, setGoals } = useContext(GoalsContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null); 

  const handleDeleteGoal = (goalIdToDelete) => {
    Alert.alert('Confirmar Exclusão', 'Deseja mesmo excluir esta meta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive',
        onPress: () => {
          setGoals(currentGoals => 
            currentGoals.filter(goal => goal.id !== goalIdToDelete)
          );
        },
      },
    ]);
  };

  const handleToggleComplete = (goalId, currentProgress) => {
    const newProgress = currentProgress < 1 ? 1 : 0; 
    setGoals(currentGoals =>
      currentGoals.map(g =>
        g.id === goalId ? { ...g, progress: newProgress } : g
      )
    );
  };

  const handleOpenAddNew = () => { setEditingGoal(null); setModalVisible(true); };
  const handleOpenEdit = (goal) => { setEditingGoal(goal); setModalVisible(true); };

  const handleSaveGoal = (goalToSave) => {
    if (goalToSave.id) {
      setGoals(currentGoals => currentGoals.map(g => (g.id === goalToSave.id ? goalToSave : g)));
    } else {
      const newGoal = { ...goalToSave, id: Date.now().toString(), progress: 0 };
      setGoals(currentGoals => [newGoal, ...currentGoals]);
    }
    setModalVisible(false);
  };

  return (
    <View style={commonStyles.container}>
      <Header showBackButton showProgress currentStep={2} totalSteps={5} />
      <FlatList
        style={commonStyles.screenPadding}
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GoalItem 
            item={item}
            onEdit={() => handleOpenEdit(item)}
            onDelete={() => handleDeleteGoal(item.id)}
            onToggleComplete={() => handleToggleComplete(item.id, item.progress)}
          />
        )}
        ListHeaderComponent={(
          <>
            <Text style={styles.title}>Minhas Metas</Text>
            <Text style={styles.subtitle}>Acompanhe seu progresso e conquiste seus objetivos.</Text>
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}><Text style={styles.summaryNumber}>7</Text><Text style={styles.summaryLabel}>Concluídos</Text></Card>
              <Card style={styles.summaryCard}><Text style={styles.summaryNumber}>4</Text><Text style={styles.summaryLabel}>Em andamento</Text></Card>
              <Card style={styles.summaryCard}><Text style={styles.summaryNumber}>1</Text><Text style={styles.summaryLabel}>Atrasados</Text></Card>
            </View>
          </>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
      <GoalEditorModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />
      <TouchableOpacity style={styles.fab} onPress={handleOpenAddNew}>
        <Plus size={30} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

// --- Componente do Modal de Edição (Estilo "Notas" Mobile) ---
function GoalEditorModal({ visible, onClose, onSave, initialData }) {
  const { subjects } = useContext(SubjectsContext); // Puxa as matérias

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(PRIORITIES[1]);
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null); // Estado para o Picker

  useEffect(() => {
    if (visible) { 
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setPriority(PRIORITIES.find(p => p.key === initialData.status) || PRIORITIES[1]);
        setDeadline(initialData.deadline ? new Date(initialData.deadline) : new Date());
        setSelectedSubjectId(initialData.subjectId || null); // Carrega o ID da matéria
      } else {
        setTitle('');
        setDescription('');
        setPriority(PRIORITIES[1]);
        setDeadline(new Date());
        setSelectedSubjectId(null);
      }
    }
  }, [initialData, visible]);

  const handleSave = () => {
    if (title.trim() === '') {
      Alert.alert('Erro', 'O título da meta não pode ser vazio.');
      return;
    }
    if (!selectedSubjectId) {
      Alert.alert('Erro', 'Por favor, selecione uma matéria para esta meta.');
      return;
    }
    onSave({
      ...initialData,
      title: title,
      description: description,
      status: priority.key,
      statusColor: priority.color,
      deadline: deadline.toISOString(), 
      subjectId: selectedSubjectId, // Salva o ID da matéria
    });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || deadline;
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    setDeadline(currentDate);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={commonStyles.container}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{initialData ? 'Editar Meta' : 'Nova Meta'}</Text>
          <TouchableOpacity onPress={handleSave} style={[styles.modalButton, styles.saveButton]}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <TextInput style={styles.inputTitle} placeholder="Título" placeholderTextColor={colors.secondaryText} value={title} onChangeText={setTitle} />
          <TextInput style={styles.inputDescription} placeholder="Descrição..." placeholderTextColor={colors.secondaryText} value={description} onChangeText={setDescription} multiline={true} />
          
          <Text style={styles.label}>Matéria</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSubjectId}
              onValueChange={(itemValue) => setSelectedSubjectId(itemValue)}
              style={Platform.OS === 'web' ? { outline: 'none' } : {}}
            >
              <Picker.Item label="Escolha uma matéria..." value={null} style={{ color: colors.secondaryText }} />
              {subjects.map((subject) => (
                <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.prioritySelector}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[ styles.priorityButton, { backgroundColor: p.color, opacity: priority.key === p.key ? 1 : 0.5 }]}
                onPress={() => setPriority(p)}
              >
                <Text style={styles.priorityButtonText}>{p.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Prazo</Text>
          {Platform.OS === 'ios' && (
             <DateTimePicker value={deadline} mode="date" display="inline" onChange={onChangeDate} style={{height: 350}} />
          )}
          {Platform.OS !== 'ios' && (
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Calendar size={20} color={colors.secondaryText} />
              <Text style={styles.datePickerText}>{deadline.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
            </TouchableOpacity>
          )}
          {showDatePicker && Platform.OS !== 'ios' && (
            <DateTimePicker value={deadline} mode="date" display="default" onChange={onChangeDate} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
  // ... (estilos de title, subtitle, summary, etc. iguais ao anterior) ...
  goalCard: { flexDirection: 'row', padding: 0, overflow: 'hidden' },
  priorityBorder: { width: 8 },
  goalContent: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.xs },
  goalTitle: { fontSize: fonts.subtitleSize, fontWeight: '600', color: colors.primaryText, marginBottom: spacing.xs, flex: 1 },
  goalCompleteText: { color: colors.secondaryText, textDecorationLine: 'line-through' },
  goalActions: { flexDirection: 'row', gap: spacing.md, paddingLeft: spacing.sm },
  goalDescription: { fontSize: fonts.bodySize, color: colors.secondaryText, marginBottom: spacing.sm, },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  progressText: { fontSize: fonts.bodySize, color: colors.primaryText, marginLeft: spacing.sm, fontWeight: '600' },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12 },
  statusText: { fontSize: fonts.smallSize, color: colors.white, fontWeight: '600' },
  completeButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.xs, },
  completeButtonText: { color: colors.green, fontWeight: 'bold', fontSize: fonts.bodySize, },
  fab: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, paddingTop: Platform.OS === 'ios' ? 50 : spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray, },
  modalTitle: { fontSize: fonts.subtitleSize, fontWeight: '600' },
  modalButton: { padding: spacing.sm },
  modalButtonText: { fontSize: fonts.bodySize, color: colors.accent, fontWeight: '600' },
  saveButton: { backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: spacing.md },
  saveButtonText: { color: colors.white, fontWeight: 'bold' },
  modalBody: { flex: 1, padding: spacing.md },
  label: { fontSize: fonts.bodySize, color: colors.secondaryText, marginBottom: spacing.xs, fontWeight: '500', marginTop: spacing.md, },
  inputTitle: { fontSize: 24, fontWeight: 'bold', color: colors.primaryText, paddingVertical: spacing.sm, },
  inputDescription: { fontSize: fonts.bodySize, color: colors.primaryText, minHeight: 200, textAlignVertical: 'top', },
  prioritySelector: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.xs, marginBottom: spacing.md, gap: spacing.sm },
  priorityButton: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, alignItems: 'center' },
  priorityButtonText: { color: colors.white, fontWeight: 'bold' },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.gray, borderRadius: 8, padding: spacing.sm, backgroundColor: colors.white, },
  datePickerText: { fontSize: fonts.bodySize, color: colors.primaryText, },
  pickerContainer: { borderWidth: 1, borderColor: colors.gray, borderRadius: 8, justifyContent: 'center', height: 42, overflow: 'hidden', backgroundColor: colors.white, marginTop: spacing.xs, marginBottom: spacing.md },
  
  // Estilos da tela principal que faltavam
  title: { fontSize: fonts.titleSize, fontWeight: '600', color: colors.primaryText, marginBottom: spacing.xs },
  subtitle: { fontSize: fonts.bodySize, color: colors.secondaryText, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.md },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  summaryNumber: { fontSize: 28, fontWeight: 'bold', color: colors.accent, marginBottom: spacing.xs },
  summaryLabel: { fontSize: fonts.smallSize, color: colors.secondaryText, textAlign: 'center' },
});
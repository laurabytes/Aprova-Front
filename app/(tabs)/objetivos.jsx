// app/(tabs)/objetivos.jsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { CheckCircle2, Circle, Edit, Plus, Target, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';

import SegmentedControl from '@react-native-segmented-control/segmented-control';

import { Badge } from '../../componentes/Badge';
import { Botao } from '../../componentes/Botao';
import { CampoDeTexto } from '../../componentes/CampoDeTexto';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../componentes/Card';
import { Dialog } from '../../componentes/Dialog';
import { Progress } from '../../componentes/Progress';
import { Textarea } from '../../componentes/Textarea';
import { useAuth } from '../../contexto/AuthContexto';
import { cores } from '../../tema/cores';

// Função para formatar a data de YYYY-MM-DD para DD/MM/AAAA
const formatToDisplayDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export default function TelaMetas() {
  const { user } = useAuth();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showDatePickerFor, setShowDatePickerFor] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    status: 'EM_ANDAMENTO',
    progresso: 0,
  });

  useEffect(() => {
    setIsPageLoading(true);
    setGoals([]);
    setIsPageLoading(false);
  }, [user]);

  // Atualização de progresso via Slider
  const handleProgressChange = (goalId, newProgressValue) => {
    const progressoValido = Math.max(0, Math.min(100, Math.round(newProgressValue)));
    let newStatus = 'EM_ANDAMENTO';

    if (progressoValido === 100) {
      newStatus = 'CONCLUIDO';
    }

    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, progresso: progressoValido, status: newStatus }
          : g,
      ),
    );
  };

  // ======== Date Picker ========
  const getDateValue = (dateString) => {
    if (dateString) {
      const date = new Date(dateString + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return new Date();
  };

  const openDatePicker = (field) => {
    setShowDatePickerFor(field);
    setTempDate(getDateValue(formData[field]));
  };

  const onDateChange = (event, selectedDate) => {
    const formatDateToISOString = (date) => date.toISOString().split('T')[0];

    if (Platform.OS === 'android') {
      setShowDatePickerFor(null);
      if (event.type === 'set' && selectedDate) {
        const formattedDate = formatDateToISOString(selectedDate);
        setFormData({ ...formData, [showDatePickerFor]: formattedDate });
      }
    } else {
      setTempDate(selectedDate || tempDate);
    }
  };

  const confirmDate = () => {
    const formatDateToISOString = (date) => date.toISOString().split('T')[0];
    const formattedDate = formatDateToISOString(tempDate);
    setFormData({ ...formData, [showDatePickerFor]: formattedDate });
    setShowDatePickerFor(null);
  };

  const cancelDate = () => {
    setShowDatePickerFor(null);
  };
  // ==============================

  const handleSubmit = async () => {
    // Validação de datas
    if (formData.dataFim && formData.dataInicio) {
      const dataInicio = new Date(formData.dataInicio + 'T00:00:00');
      const dataFim = new Date(formData.dataFim + 'T00:00:00');
      if (dataFim < dataInicio) {
        Alert.alert('Data Inválida', 'A data de fim não pode ser anterior à data de início.');
        return;
      }
    }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 300));

    try {
      // ⚙️ corrigido para LET (antes era const e dava erro!)
      let progressoInicial = editingGoal ? editingGoal.progresso : 0;
      let statusFinal = formData.status;

      if (editingGoal) {
        if (formData.status === 'CONCLUIDO' && progressoInicial !== 100) {
          progressoInicial = 100;
        }
      }

      const dadosSalvos = {
        ...formData,
        progresso: progressoInicial,
        status: statusFinal,
      };

      if (editingGoal) {
        setGoals(prev =>
          prev.map(g =>
            g.id === editingGoal.id
              ? { ...g, ...dadosSalvos }
              : g,
          ),
        );
      } else {
        const newGoal = {
          ...dadosSalvos,
          id: Math.random(),
          usuarioId: user?.id,
          progresso: 0,
        };
        setGoals(prev => [...prev, newGoal]);
      }

      setIsDialogOpen(false);
      setEditingGoal(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a meta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir Meta', 'Tem certeza que deseja excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          setGoals(prev => prev.filter(g => g.id !== id));
        },
      },
    ]);
  };

  const toggleStatus = (goal) => {
    const newStatus = goal.status === 'CONCLUIDO' ? 'EM_ANDAMENTO' : 'CONCLUIDO';
    const newProgress = newStatus === 'CONCLUIDO' ? 100 : 0;

    setGoals(prev =>
      prev.map(g => (g.id === goal.id ? { ...g, status: newStatus, progresso: newProgress } : g)),
    );
  };

  const openEditDialog = (goal) => {
    setEditingGoal(goal);
    setFormData({
      titulo: goal.titulo,
      descricao: goal.descricao,
      dataInicio: goal.dataInicio ? goal.dataInicio.split('T')[0] : '',
      dataFim: goal.dataFim ? goal.dataFim.split('T')[0] : '',
      status: goal.status,
      progresso: (goal.progresso || 0),
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingGoal(null);
    setFormData({
      titulo: '',
      descricao: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      status: 'EM_ANDAMENTO',
      progresso: 0,
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONCLUIDO':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'EM_ANDAMENTO':
        return <Badge variant="default">Em Andamento</Badge>;
      case 'CANCELADO':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeGoals = goals.filter((g) => g.status !== 'CONCLUIDO');
  const completedGoals = goals.filter((g) => g.status === 'CONCLUIDO');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.foreground }]}>Metas</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Defina e acompanhe suas metas
            </Text>
          </View>
        </View>

        {/* MODAL */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
            {showDatePickerFor ? (
              <View>
                <Text style={[styles.dialogTitle, { color: theme.foreground, marginBottom: 16 }]}>
                  {showDatePickerFor === 'dataInicio' ? 'Selecione a Data de Início' : 'Selecione a Data de Fim'}
                </Text>

                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'default' : 'inline'}
                  onChange={onDateChange}
                  style={{ marginBottom: 16 }}
                />

                {Platform.OS !== 'android' && (
                  <View style={styles.dialogActions}>
                    <Botao variant="destructive-outline" onPress={cancelDate} style={{ flex: 1 }}>
                      Cancelar
                    </Botao>
                    <Botao onPress={confirmDate} style={{ flex: 1 }}>
                      Confirmar
                    </Botao>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text style={[styles.dialogTitle, { color: theme.foreground }]}>
                  {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                </Text>
                <View style={styles.form}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Título</Text>
                  <CampoDeTexto
                    value={formData.titulo}
                    onChangeText={(t) => setFormData({ ...formData, titulo: t })}
                    placeholder="Ex: Concluir curso de Matemática"
                  />

                  <Text style={[styles.label, { color: theme.foreground }]}>Descrição</Text>
                  <Textarea
                    value={formData.descricao}
                    onChangeText={(t) => setFormData({ ...formData, descricao: t })}
                    placeholder="Descreva sua meta (opcional)"
                  />

                  <Text style={[styles.label, { color: theme.foreground }]}>Data Início</Text>
                  <TouchableOpacity
                    style={[styles.fakeInput, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={() => openDatePicker('dataInicio')}
                  >
                    <Text style={[{ fontSize: 14, color: formData.dataInicio ? theme.foreground : theme.mutedForeground }]}>
                      {formatToDisplayDate(formData.dataInicio) || 'DD/MM/AAAA'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.label, { color: theme.foreground }]}>Data Fim (Opcional)</Text>
                  <TouchableOpacity
                    style={[styles.fakeInput, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={() => openDatePicker('dataFim')}
                  >
                    <Text style={[{ fontSize: 14, color: formData.dataFim ? theme.foreground : theme.mutedForeground }]}>
                      {formatToDisplayDate(formData.dataFim) || 'DD/MM/AAAA'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.label, { color: theme.foreground }]}>Status</Text>
                  <SegmentedControl
                    values={['Em Andamento', 'Concluído']}
                    selectedIndex={formData.status === 'CONCLUIDO' ? 1 : 0}
                    onValueChange={(value) => {
                      const newStatus = value === 'Concluído' ? 'CONCLUIDO' : 'EM_ANDAMENTO';
                      setFormData({ ...formData, status: newStatus });
                    }}
                    style={styles.segmentedControl}
                    backgroundColor={theme.muted}
                    tintColor={theme.primary}
                  />

                  <View style={[styles.dialogActions, { justifyContent: 'space-between' }]}>
                    <Botao variant="destructive-outline" onPress={() => setIsDialogOpen(false)} style={{ flex: 1 }}>
                      Cancelar
                    </Botao>
                    <Botao onPress={handleSubmit} disabled={isLoading} style={{ flex: 1 }}>
                      {isLoading ? <ActivityIndicator color={theme.primaryForeground} /> : (editingGoal ? 'Salvar' : 'Criar')}
                    </Botao>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </Dialog>

        {isPageLoading && <ActivityIndicator size="large" color={theme.primary} />}

        {!isPageLoading && goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Target color={theme.mutedForeground} size={48} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Nenhuma meta cadastrada</Text>
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Toque o botão abaixo para adicionar sua primeira meta.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {activeGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Em Andamento</Text>
                {activeGoals.map((goal) => (
                  <Card key={goal.id} style={styles.card}>
                    <CardHeader>
                      <View style={styles.cardTitleRow}>
                        <CardTitle style={{ flex: 1, color: theme.foreground }}>{goal.titulo}</CardTitle>
                        <TouchableOpacity onPress={() => toggleStatus(goal)}>
                          <Circle color={theme.mutedForeground} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openEditDialog(goal)}>
                          <Edit color={theme.mutedForeground} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(goal.id)}>
                          <Trash2 color={theme.destructive} size={18} />
                        </TouchableOpacity>
                      </View>
                      {goal.descricao && <CardDescription>{goal.descricao}</CardDescription>}
                    </CardHeader>
                    <CardContent style={{ gap: 16 }}>
                      <View>
                        <View style={styles.progressHeader}>
                          <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>Progresso</Text>
                          <Text style={{ color: theme.foreground, fontWeight: '500' }}>
                            {goal.progresso || 0}%
                          </Text>
                        </View>
                        <Progress value={goal.progresso} />
                      </View>

                      <View style={styles.sliderContainer}>
                        <Text style={[styles.label, { color: theme.mutedForeground, fontSize: 12, marginBottom: -8 }]}>
                          Ajustar Progresso: {goal.progresso || 0}%
                        </Text>
                        <Slider
                          style={styles.slider}
                          minimumValue={0}
                          maximumValue={100}
                          step={1}
                          value={parseInt(goal.progresso, 10)}
                          onValueChange={(value) => handleProgressChange(goal.id, value)}
                          minimumTrackTintColor={theme.primary}
                          maximumTrackTintColor={theme.mutedForeground}
                          thumbTintColor={theme.primary}
                        />
                      </View>

                      <View style={styles.cardFooter}>
                        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
                          {formatToDisplayDate(goal.dataInicio)} {goal.dataFim ? `- ${formatToDisplayDate(goal.dataFim)}` : ''}
                        </Text>
                        {getStatusBadge(goal.status)}
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}

            {completedGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Concluídos</Text>
                {completedGoals.map((goal) => (
                  <Card key={goal.id} style={styles.card}>
                    <CardHeader>
                      <View style={styles.cardTitleRow}>
                        <CardTitle style={{ flex: 1, color: theme.foreground }}>{goal.titulo}</CardTitle>
                        <TouchableOpacity onPress={() => toggleStatus(goal)}>
                          <CheckCircle2 color={theme.primary} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(goal.id)}>
                          <Trash2 color={theme.destructive} size={18} />
                        </TouchableOpacity>
                      </View>
                      {goal.descricao && <CardDescription>{goal.descricao}</CardDescription>}
                    </CardHeader>
                    <CardContent style={{ gap: 16 }}>
                      <View>
                        <View style={styles.progressHeader}>
                          <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>Progresso</Text>
                          <Text style={{ color: theme.foreground, fontWeight: '500' }}>
                            {goal.progresso || 0}%
                          </Text>
                        </View>
                        <Progress value={goal.progresso} />
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
                          {formatToDisplayDate(goal.dataInicio)} {goal.dataFim ? `- ${formatToDisplayDate(goal.dataFim)}` : ''}
                        </Text>
                        {getStatusBadge(goal.status)}
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {!isPageLoading && (
        <TouchableOpacity style={[styles.fabButton, { backgroundColor: theme.primary }]} onPress={openCreateDialog}>
          <Plus size={30} color={theme.primaryForeground} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // CORRIGIDO: Aumentar paddingBottom para não ser cortado pela Tab Bar
  scrollContent: { padding: 20, gap: 24, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4 },
  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  dialogActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 20 },
  grid: { gap: 24 },
  section: { gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  card: { width: '100%' },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  fakeInput: {
    height: 44,
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  sliderContainer: { paddingVertical: 4 },
  slider: { width: '100%', height: 40 },
  fabButton: {
    position: 'absolute',
    // CORRIGIDO: Mover para cima da Tab Bar (bottom: 96)
    bottom: 96,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
    minHeight: 400,
  },
  emptyIcon: { marginBottom: 16, opacity: 0.8 },
  emptyTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  emptyText: { textAlign: 'center', fontSize: 16, marginBottom: 16 },
  segmentedControl: { height: 44 },
});
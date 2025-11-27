// app/(tabs)/objetivos.jsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { CheckCircle2, Circle, Edit, Plus, Target, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Slider from '@react-native-community/slider';

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
import { useAuth } from '../../contexto/AuthContexto';
import { useStudyData } from '../../contexto/StudyDataContexto';
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

  const {
    goals,
    updateGoal,
    addGoal,
    deleteGoal,
    toggleGoalStatus,
    isLoading: isContextLoading
  } = useStudyData();

  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showDatePickerFor, setShowDatePickerFor] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());

  // Estado simplificado: Apenas Título e Data
  const [formData, setFormData] = useState({
    titulo: '',
    data: new Date().toISOString().split('T')[0], // Padrão hoje
  });

  const handleProgressChange = (goalId, newProgressValue) => {
    const progressoValido = Math.max(0, Math.min(100, Math.round(newProgressValue)));
    let newStatus = 'EM_ANDAMENTO';

    if (progressoValido === 100) {
      newStatus = 'CONCLUIDO';
    }

    const goalToUpdate = goals.find(g => g.id === goalId);
    if (goalToUpdate) {
      // Nota: O backend atual pode não salvar progresso/status se não tiver os campos,
      // mas mantemos a lógica otimista no front.
      updateGoal({ ...goalToUpdate, progresso: progressoValido, status: newStatus });
    }
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

  const openDatePicker = () => {
    setShowDatePickerFor('data');
    setTempDate(getDateValue(formData.data));
  };

  const onDateChange = (event, selectedDate) => {
    const formatDateToISOString = (date) => date.toISOString().split('T')[0];

    if (Platform.OS === 'android') {
      setShowDatePickerFor(null);
      if (event.type === 'set' && selectedDate) {
        const formattedDate = formatDateToISOString(selectedDate);
        setFormData({ ...formData, data: formattedDate });
      }
    } else {
      setTempDate(selectedDate || tempDate);
    }
  };

  const confirmDate = () => {
    const formatDateToISOString = (date) => date.toISOString().split('T')[0];
    const formattedDate = formatDateToISOString(tempDate);
    setFormData({ ...formData, data: formattedDate });
    setShowDatePickerFor(null);
  };

  const cancelDate = () => {
    setShowDatePickerFor(null);
  };
  // ==============================

  const handleSubmit = async () => {
    if (formData.titulo.trim() === '') {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha o título da meta.');
      return;
    }

    setIsLoading(true);
    
    // Pequeno delay para UX
    await new Promise(res => setTimeout(res, 300));

    try {
      const userId = user?.id || null;

      if (!userId) {
        throw new Error('Id do usuário não encontrado.');
      }

      // Payload estritamente compatível com o Backend (MetasDTORequest.java)
      const dadosSalvos = {
        nome: formData.titulo, // Backend espera 'nome'
        data: formData.data,   // Backend espera 'data' (LocalDate)
        status: 0,             // 0 = Em andamento (Backend espera int)
        usuarioId: userId
      };

      if (editingGoal) {
        // Ao editar, mantemos o ID e outros dados que já existiam
        updateGoal({ ...editingGoal, ...dadosSalvos });
      } else {
        // Adiciona campos locais para o Front funcionar bem (progresso)
        const newGoal = {
          ...dadosSalvos,
          progresso: 0,
          status: 'EM_ANDAMENTO' // Para controle visual imediato
        };
        addGoal(newGoal);
      }

      setIsDialogOpen(false);
      setEditingGoal(null);
      setFormData({
        titulo: '',
        data: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error(error);
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
          deleteGoal(id);
        },
      },
    ]);
  };

  const toggleStatus = (goal) => {
    toggleGoalStatus(goal);
  };

  const openEditDialog = (goal) => {
    setEditingGoal(goal);
    setFormData({
      titulo: goal.titulo || goal.nome, // Fallback caso venha como 'nome' do backend
      data: goal.data || goal.dataInicio, // Tenta pegar a data disponível
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingGoal(null);
    setFormData({
      titulo: '',
      data: new Date().toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    // Tratamento para status numérico ou string
    const s = String(status);
    if (s === 'CONCLUIDO' || s === '1') {
      return <Badge variant="secondary">Concluído</Badge>;
    }
    if (s === 'EM_ANDAMENTO' || s === '0') {
      return <Badge variant="default">Em Andamento</Badge>;
    }
    return <Badge variant="destructive">Cancelado</Badge>;
  };

  const activeGoals = goals.filter((g) => String(g.status) !== 'CONCLUIDO' && String(g.status) !== '1');
  const completedGoals = goals.filter((g) => String(g.status) === 'CONCLUIDO' || String(g.status) === '1');

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
                  Selecione a Data
                </Text>

                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'default' : 'spinner'}
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

                  <Text style={[styles.label, { color: theme.foreground }]}>Data</Text>
                  <TouchableOpacity
                    style={[styles.fakeInput, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={openDatePicker}
                  >
                    <Text style={[{ fontSize: 14, color: formData.data ? theme.foreground : theme.mutedForeground }]}>
                      {formatToDisplayDate(formData.data) || 'DD/MM/AAAA'}
                    </Text>
                  </TouchableOpacity>

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

        {isContextLoading && <ActivityIndicator size="large" color={theme.primary} />}

        {!isContextLoading && goals.length === 0 ? (
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
                  <Card key={String(goal.id)} style={styles.card}>
                    <CardHeader>
                      <View style={styles.cardTitleRow}>
                        <CardTitle style={{ flex: 1, color: theme.foreground }}>
                           {goal.titulo || goal.nome}
                        </CardTitle>
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
                      {/* Descrição removida visualmente se não existir, mas o campo no objeto ainda pode existir */}
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
                        <Progress value={goal.progresso || 0} />
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
                          value={parseInt(goal.progresso || 0, 10)}
                          onValueChange={(value) => handleProgressChange(goal.id, value)}
                          minimumTrackTintColor={theme.primary}
                          maximumTrackTintColor={theme.mutedForeground}
                          thumbTintColor={theme.primary}
                        />
                      </View>

                      <View style={styles.cardFooter}>
                        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
                          {formatToDisplayDate(goal.data || goal.dataInicio)}
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
                  <Card key={String(goal.id)} style={styles.card}>
                    <CardHeader>
                      <View style={styles.cardTitleRow}>
                        <CardTitle style={{ flex: 1, color: theme.foreground }}>
                            {goal.titulo || goal.nome}
                        </CardTitle>
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
                        <Progress value={goal.progresso || 0} />
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
                           {formatToDisplayDate(goal.data || goal.dataInicio)}
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

      {!isContextLoading && (
        <TouchableOpacity style={[styles.fabButton, { backgroundColor: theme.primary }]} onPress={openCreateDialog}>
          <Plus size={30} color={theme.primaryForeground} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});
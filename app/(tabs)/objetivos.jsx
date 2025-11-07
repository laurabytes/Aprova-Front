// app/(tabs)/objetivos.jsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { CheckCircle2, Circle, Edit, Plus, Target, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

// ===== INÍCIO DA IMPORTAÇÃO =====
// Adicionando o SegmentedControl
import SegmentedControl from '@react-native-segmented-control/segmented-control';
// ===== FIM DA IMPORTAÇÃO =====

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
// O Select de progresso foi removido, então não precisamos mais dele aqui
// AINDA PRECISAMOS dele para o Status (ops, não, vamos remover)
// import { Select, SelectItem } from '../../componentes/Select'; 
// import { Select } from '../../componentes/Select'; // Removido
import { Textarea } from '../../componentes/Textarea';
import { useAuth } from '../../contexto/AuthContexto';
import { cores } from '../../tema/cores';

export default function TelaMetas() {
  const { user } = useAuth();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;

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
    progresso: '0', 
  });

  useEffect(() => {
    setIsPageLoading(true);
    setGoals([]);
    setIsPageLoading(false);
  }, [user]);
  
  // --- LÓGICA DO CALENDÁRIO (sem alteração) ---
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
    if (Platform.OS === 'android') {
      setShowDatePickerFor(null); 
      if (event.type === 'set' && selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        setFormData({ ...formData, [showDatePickerFor]: formattedDate });
      }
    } else {
      setTempDate(selectedDate || tempDate);
    }
  };

  const confirmDate = () => {
    const formattedDate = tempDate.toISOString().split('T')[0];
    setFormData({ ...formData, [showDatePickerFor]: formattedDate });
    setShowDatePickerFor(null); 
  };

  const cancelDate = () => {
    setShowDatePickerFor(null);
  };
  // --- FIM DA LÓGICA DO CALENDÁRIO ---

  const handleSubmit = async () => {
    
    // ===== VALIDAÇÃO DE DATA (sem alteração) =====
    if (formData.dataFim && formData.dataInicio) {
      const dataInicio = new Date(formData.dataInicio + 'T00:00:00');
      const dataFim = new Date(formData.dataFim + 'T00:00:00');

      if (dataFim < dataInicio) {
        Alert.alert('Data Inválida', 'A data de fim não pode ser anterior à data de início.');
        return; 
      }
    }
    // ===== FIM DA VALIDAÇÃO DE DATA =====

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 300)); 
    try {
      let progressoNumerico = parseInt(formData.progresso, 10) || 0;
      let progressoValido = Math.max(0, Math.min(100, progressoNumerico)); 
      let statusFinal = formData.status;

      if (formData.status === 'CONCLUIDO') {
        progressoValido = 100;
      } else if (progressoValido === 100) {
        statusFinal = 'CONCLUIDO';
      } else {
        statusFinal = 'EM_ANDAMENTO';
      }
      
      const dadosSalvos = {
        ...formData,
        progresso: progressoValido, 
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

  // Funções handleDelete, toggleStatus, openEditDialog, openCreateDialog, getStatusBadge...
  // ... (NENHUMA ALTERAÇÃO NECESSÁRIA AQUI) ...

  const handleDelete = async (id) => {
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

  const toggleStatus = async (goal) => {
    const newStatus =
      goal.status === 'CONCLUIDO' ? 'EM_ANDAMENTO' : 'CONCLUIDO';
      
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
      progresso: String(goal.progresso || 0), 
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
      progresso: '0', 
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
        {/* ... (Cabeçalho "Metas" - sem alteração) ... */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.foreground }]}>Metas</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Defina e acompanhe suas metas
            </Text>
          </View>
        </View>

        {/* --- MODAL / DIALOG --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ScrollView 
            keyboardShouldPersistTaps="handled" 
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {showDatePickerFor ? (
              // --- VISTA DO CALENDÁRIO (sem alteração) ---
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
                    <Botao variant="outline" onPress={cancelDate} style={{ flex: 1 }}>
                      Cancelar
                    </Botao>
                    <Botao onPress={confirmDate} style={{ flex: 1 }}>
                      Confirmar
                    </Botao>
                  </View>
                )}
              </View>

            ) : (
              // --- VISTA DO FORMULÁRIO (COM ALTERAÇÕES) ---
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
                  
                  {/* ... (Campos de Data - sem alteração) ... */}
                  <Text style={[styles.label, { color: theme.foreground }]}>Data Início</Text>
                  <TouchableOpacity 
                    style={[styles.fakeInput, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={() => openDatePicker('dataInicio')}
                  >
                    <Text style={[{ fontSize: 14, color: formData.dataInicio ? theme.foreground : theme.mutedForeground }]}>
                      {formData.dataInicio || 'AAAA-MM-DD'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.label, { color: theme.foreground }]}>Data Fim (Opcional)</Text>
                  <TouchableOpacity 
                    style={[styles.fakeInput, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={() => openDatePicker('dataFim')}
                  >
                    <Text style={[{ fontSize: 14, color: formData.dataFim ? theme.foreground : theme.mutedForeground }]}>
                      {formData.dataFim || 'AAAA-MM-DD'}
                    </Text>
                  </TouchableOpacity>

                  {/* ===== INÍCIO DA ALTERAÇÃO 1 (Progresso) ===== */}
                  {/* Trocando o <Select> por <CampoDeTexto> */}
                  <Text style={[styles.label, { color: theme.foreground }]}>Progresso (%)</Text>
                  <CampoDeTexto
                    value={formData.progresso}
                    onChangeText={(p) => {
                      // Garante que apenas números sejam inseridos
                      const num = p.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, progresso: num });
                    }}
                    placeholder="0"
                    keyboardType="number-pad"
                    maxLength={3} // 100 é o máximo
                  />
                  {/* ===== FIM DA ALTERAÇÃO 1 ===== */}


                  {/* ===== INÍCIO DA ALTERAÇÃO 2 (Status) ===== */}
                  {/* Trocando o <Select> por <SegmentedControl> */}
                  <Text style={[styles.label, { color: theme.foreground }]}>Status</Text>
                  <SegmentedControl
                    values={['Em Andamento', 'Concluído']}
                    // Mapeia o estado (String) para o índice (Número)
                    selectedIndex={formData.status === 'CONCLUIDO' ? 1 : 0}
                    onValueChange={(value) => {
                      // Mapeia o valor do controle (String) de volta para o estado
                      const newStatus = value === 'Concluído' ? 'CONCLUIDO' : 'EM_ANDAMENTO';
                      setFormData({ ...formData, status: newStatus });
                    }}
                    style={styles.segmentedControl} // Estilo adicionado abaixo
                    backgroundColor={theme.muted} // Fundo cinza
                    tintColor={theme.primary} // Cor do botão ativo (azul)
                    fontStyle={{ color: theme.foreground }}
                    activeFontStyle={{ color: theme.primaryForeground, fontWeight: 'bold' }}
                  />
                  {/* ===== FIM DA ALTERAÇÃO 2 ===== */}
                  
                  <View style={styles.dialogActions}>
                    <Botao variant="destructive" onPress={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Botao>
                    <Botao onPress={handleSubmit} disabled={isLoading}>
                      {isLoading ? <ActivityIndicator color={theme.primaryForeground} /> : (editingGoal ? 'Salvar' : 'Criar')}
                    </Botao>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </Dialog>
        
        {/* ... (Resto do arquivo: DatePicker, Lista de Metas, Botão Flutuante - sem alteração) ... */}
        
        {showDatePickerFor && Platform.OS === 'android' && (
          <DateTimePicker
            value={getDateValue(formData[showDatePickerFor])}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}


        {isPageLoading && <ActivityIndicator size="large" color={theme.primary} />}

        {/* ===== INÍCIO DO AJUSTE PARA O LAYOUT VAZIO (emptyState) ===== */}
        {!isPageLoading && goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Target color={theme.mutedForeground} size={48} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
              Nenhuma meta cadastrada
            </Text>
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Comece criando sua primeira meta e alcançando seus objetivos!
            </Text>
            {/* Botão de criação (agora Botao) */}
            <Botao onPress={openCreateDialog} style={styles.emptyButton}>
              <Plus size={18} color={theme.primaryForeground} style={{ marginRight: 8 }} />
              Criar Primeira Meta
            </Botao>
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
                        <CardTitle style={{ flex: 1, color: theme.foreground }}>
                          {goal.titulo}
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
                          {goal.dataInicio} {goal.dataFim ? `- ${goal.dataFim}` : ''}
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
                        <CardTitle style={{ flex: 1, color: theme.foreground }}>
                          {goal.titulo}
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
                        <Progress value={goal.progresso} />
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
                          {goal.dataInicio} {goal.dataFim ? `- ${goal.dataFim}` : ''}
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

      {!isPageLoading && goals.length > 0 && (
        <TouchableOpacity 
          style={[styles.roundFloatingButtonBase, styles.floatingButton, { backgroundColor: theme.primary }]} 
          onPress={openCreateDialog}
        >
          <Plus size={28} color={theme.primaryForeground} />
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 100 }, 
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4 },
  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
  // Removido emptyState

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

  // NOVO: Base para o botão flutuante redondo (antigo emptyAddButton)
  roundFloatingButtonBase: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    elevation: 8, 
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // =======================================================
  // ESTILOS DO ESTADO VAZIO (emptyState) - NOVO LAYOUT
  // =======================================================
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
    minHeight: 400, 
  },
  emptyIcon: {
    marginBottom: 16, 
    opacity: 0.8,
  },
  // Ajustado para se parecer com a tela de matérias (maior/mais ousado)
  emptyTitle: { 
    fontSize: 22, 
    fontWeight: '700',
    textAlign: 'center', 
  },
  emptyText: { 
    textAlign: 'center',
    fontSize: 16, 
    marginBottom: 16, 
  },
  emptyButton: {
    paddingHorizontal: 24,
    width: 'auto',
    minWidth: 200,
  },
  // =======================================================

  segmentedControl: {
    height: 44, 
  },
});
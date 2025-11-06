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
  View
} from 'react-native';
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
import { Select, SelectItem } from '../../componentes/Select';
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
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 300)); 
    try {
      if (editingGoal) {
        setGoals(prev =>
          prev.map(g =>
            g.id === editingGoal.id
              ? { ...g, ...formData }
              : g,
          ),
        );
      } else {
        const newGoal = {
          ...formData,
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
    setGoals(prev =>
      prev.map(g => (g.id === goal.id ? { ...g, status: newStatus } : g)),
    );
  };

  const openEditDialog = (goal) => {
    setEditingGoal(goal);
    setFormData({
      titulo: goal.titulo,
      descricao: goal.descricao,
      dataInicio: goal.dataInicio.split('T')[0],
      dataFim: goal.dataFim.split('T')[0],
      status: goal.status,
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

  const calculateProgress = (goal) => {
    if (goal.status === 'CONCLUIDO') return 100;
    const start = new Date(goal.dataInicio).getTime();
    const end = new Date(goal.dataFim).getTime();
    const now = Date.now();
    if (now < start || start === end) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const activeGoals = goals.filter((g) => g.status === 'EM_ANDAMENTO');
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <View>
            {showDatePickerFor ? (
              // --- VISTA DO CALENDÁRIO ---
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
              // --- VISTA DO FORMULÁRIO ---
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
                    placeholder="Descreva sua meta"
                  />
                  
                  <Text style={[styles.label, { color: theme.foreground }]}>Data Início</Text>
                  <TouchableOpacity 
                    style={[styles.fakeInput, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={() => openDatePicker('dataInicio')}
                  >
                    <Text style={[{ fontSize: 14, color: formData.dataInicio ? theme.foreground : theme.mutedForeground }]}>
                      {formData.dataInicio || 'AAAA-MM-DD'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.label, { color: theme.foreground }]}>Data Fim</Text>
                  <TouchableOpacity 
                    style={[styles.fakeInput, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={() => openDatePicker('dataFim')}
                  >
                    <Text style={[{ fontSize: 14, color: formData.dataFim ? theme.foreground : theme.mutedForeground }]}>
                      {formData.dataFim || 'AAAA-MM-DD'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.label, { color: theme.foreground }]}>Status</Text>
                  <Select
                    value={formData.status}
                    onValueChange={(status) => setFormData({ ...formData, status })}
                    prompt="Selecione o status" 
                  >
                    <SelectItem label="Em Andamento" value="EM_ANDAMENTO" />
                    <SelectItem label="Concluído" value="CONCLUIDO" />
                    <SelectItem label="Cancelado" value="CANCELADO" />
                  </Select>
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
          </View>
        </Dialog>
        
        {showDatePickerFor && Platform.OS === 'android' && (
          <DateTimePicker
            value={getDateValue(formData[showDatePickerFor])}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}


        {isPageLoading && <ActivityIndicator size="large" color={theme.primary} />}

        {!isPageLoading && goals.length === 0 ? (
          // --- INÍCIO DA ALTERAÇÃO DO ESTADO VAZIO ---
          <Card>
            <CardContent style={styles.emptyState}>
              <Target color={theme.mutedForeground} size={48} />
              <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
                Nenhuma meta cadastrada
              </Text>
              
              {/* O <Botao> antigo foi substituído por este <TouchableOpacity> */}
              <TouchableOpacity 
                style={[styles.emptyAddButton, { backgroundColor: theme.primary }]} 
                onPress={openCreateDialog}
              >
                <Plus size={28} color={theme.primaryForeground} />
              </TouchableOpacity>

            </CardContent>
          </Card>
          // --- FIM DA ALTERAÇÃO DO ESTADO VAZIO ---
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
                          <CheckCircle2 color={theme.mutedForeground} size={18} />
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
                            {calculateProgress(goal)}%
                          </Text>
                        </View>
                        <Progress value={calculateProgress(goal)} />
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
                          {goal.dataInicio} - {goal.dataFim}
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
                  <Card key={goal.id} style={[styles.card, { opacity: 0.7 }]}>
                    <CardHeader>
                      <View style={styles.cardTitleRow}>
                        <CardTitle style={{ flex: 1, color: theme.foreground }}>
                          {goal.titulo}
                        </CardTitle>
                        <TouchableOpacity onPress={() => toggleStatus(goal)}>
                          <Circle color={theme.mutedForeground} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(goal.id)}>
                          <Trash2 color={theme.destructive} size={18} />
                        </TouchableOpacity>
                      </View>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(goal.status)}
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4 },
  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
  emptyState: { paddingVertical: 48, alignItems: 'center', gap: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
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

  // --- NOVO ESTILO ADICIONADO PARA O BOTÃO CIRCULAR ---
  emptyAddButton: {
    width: 60,
    height: 60,
    borderRadius: 30, // Metade da largura/altura para ser um círculo
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8, // Espaçamento
    // Sombra sutil para combinar com os cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
});
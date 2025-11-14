// app/(tabs)/perfil.jsx -> PLANEJADOR SEMANAL MOBILE

import { Plus, Edit, Trash2, Calendar } from 'lucide-react-native'; 
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Dimensions,
} from 'react-native';
// Importação do SegmentedControl para a seleção de dia na tela principal
import SegmentedControl from '@react-native-segmented-control/segmented-control'; 
import { Botao } from '../../componentes/Botao';
import { CampoDeTexto } from '../../componentes/CampoDeTexto';
import { Card } from '../../componentes/Card';
import { Dialog } from '../../componentes/Dialog';
// Importação do Select e SelectItem para o formulário de edição/criação
import { Select, SelectItem } from '../../componentes/Select'; 
import { cores } from '../../tema/cores';

// CORREÇÃO: Inicializa o MOCK_ROUTINE como uma matriz vazia []
const MOCK_ROUTINE = [];

const DIAS_DA_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// ==============================================================
// 1. LÓGICA DE GERENCIAMENTO DE ESTADO E AGRUPAMENTO
// ==============================================================

function useRoutineManager(initialRoutine) {
  const [routine, setRoutine] = useState(initialRoutine);
  const [editingItem, setEditingItem] = useState(null);
  
  const formatDuration = (minutes) => {
    if (minutes % 60 === 0) return `${minutes / 60}h`;
    return `${minutes}min`;
  };

  const formatItemForDisplay = (item) => ({
    ...item,
    horario: `${item.hora.toString().padStart(2, '0')}:${item.min.toString().padStart(2, '0')}`,
    duracao: formatDuration(item.duracao),
  });
  
  const getFilteredAndSortedRoutine = (selectedDay) => {
    return routine
      .filter(item => item.dia === selectedDay)
      .map(formatItemForDisplay)
      .sort((a, b) => {
        const timeA = a.hora * 60 + a.min;
        const timeB = b.hora * 60 + b.min;
        return timeA - timeB;
      });
  };

  const deleteItem = (id) => {
    Alert.alert('Excluir Item', 'Tem certeza que deseja remover este bloco de estudo?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setRoutine(prev => prev.filter(i => i.id !== id));
          },
        },
      ]);
  };

  const saveItem = (formData, currentEditingItem) => {
    const [horaStr, minStr] = formData.horario.split(':');
    const hora = parseInt(horaStr, 10);
    const min = parseInt(minStr, 10) || 0;
    
    let duracaoMinutos = 60;
    const duracaoMatch = formData.duracao.match(/(\d+)(h|min)/);
    if (duracaoMatch) {
      const value = parseInt(duracaoMatch[1], 10);
      const unit = duracaoMatch[2];
      duracaoMinutos = unit === 'h' ? value * 60 : value;
    }
    
    if (isNaN(hora) || hora < 0 || hora > 23 || isNaN(min) || min < 0 || min > 59) {
        throw new Error('O formato do horário deve ser HH:MM (Ex: 14:00)');
    }

    const dadosSalvos = {
        id: currentEditingItem ? currentEditingItem.id : Math.random(),
        dia: formData.dia,
        hora,
        min,
        duracao: duracaoMinutos, 
        materia: formData.materia.trim(),
    };

    if (currentEditingItem) {
        setRoutine(prev =>
            prev.map(i => (i.id === currentEditingItem.id ? dadosSalvos : i)),
        );
    } else {
        setRoutine(prev => [...prev, dadosSalvos]);
    }
  };

  return {
    routine,
    getFilteredAndSortedRoutine,
    deleteItem,
    saveItem,
    editingItem,
    setEditingItem,
    formatDuration,
    formatItemForDisplay
  };
}

// ==============================================================
// 2. COMPONENTE DE ITEM DA ROTINA
// ==============================================================

function RoutineItem({ item, theme, openEditDialog, handleDelete }) {
    // Calcula o horário final
    const endHour = Math.floor((item.hora * 60 + item.min + item.duracao) / 60) % 24;
    const endMin = (item.hora * 60 + item.min + item.duracao) % 60;

    return (
        <Card style={styles.routineCard}>
            <View style={styles.cardHeaderTime}>
                <Text style={[styles.cardTime, { color: theme.primary }]}>
                    {item.horario} - {endHour.toString().padStart(2, '0')}:{endMin.toString().padStart(2, '0')}
                </Text>
                <Text style={[styles.cardDuration, { color: theme.mutedForeground }]}>
                    {item.duracao}
                </Text>
            </View>
            <View style={styles.cardContentSubject}>
                <Text style={[styles.cardSubject, { color: theme.foreground }]} numberOfLines={2}>
                    {item.materia}
                </Text>
                
                <View style={styles.routineActions}>
                    <TouchableOpacity onPress={() => openEditDialog(item)} style={{padding: 4}}>
                        <Edit color={theme.mutedForeground} size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={{padding: 4}}>
                        <Trash2 color={theme.destructive} size={18} />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );
}


// ==============================================================
// 3. COMPONENTE PRINCIPAL DA TELA (Planejador)
// ==============================================================

export default function TelaPlanejadorSemanal() {
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];
  
  // Encontra o índice do dia atual para o SegmentedControl iniciar no dia correto
  const initialDayIndex = Math.max(0, DIAS_DA_SEMANA.indexOf(new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].charAt(0).toUpperCase() + new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].slice(1)));

  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex); 
  const selectedDay = DIAS_DA_SEMANA[selectedDayIndex];

  const {
    routine,
    getFilteredAndSortedRoutine,
    deleteItem,
    saveItem,
    editingItem,
    setEditingItem
  } = useRoutineManager(MOCK_ROUTINE);
  
  const filteredRoutine = getFilteredAndSortedRoutine(selectedDay);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    dia: selectedDay,
    horario: '08:00', // HH:MM
    duracao: '2h',   // Ex: 2h, 90min
    materia: '',
  });

  const handleOpenDialog = (item = null) => {
    if (item) {
        setEditingItem(item);
        const duracaoString = item.duracao >= 60 && item.duracao % 60 === 0 
                               ? `${item.duracao / 60}h` 
                               : `${item.duracao}min`;
        
        setFormData({
            id: item.id,
            dia: item.dia,
            horario: `${item.hora.toString().padStart(2, '0')}:${item.min.toString().padStart(2, '0')}`,
            duracao: duracaoString,
            materia: item.materia,
        });
    } else {
        setEditingItem(null);
        setFormData(prev => ({ 
            ...prev, 
            dia: selectedDay, 
            horario: '08:00', 
            duracao: '2h', 
            materia: '' 
        }));
    }
    setIsDialogOpen(true);
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
        await new Promise(res => setTimeout(res, 300));
        saveItem(formData, editingItem);
        handleCloseDialog();
    } catch (error) {
        Alert.alert('Erro', error.message || 'Não foi possível salvar.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({ dia: selectedDay, horario: '08:00', duracao: '2h', materia: '' });
  };
  
  const handleDayChange = (index) => {
    setSelectedDayIndex(index);
    setFormData(prev => ({ ...prev, dia: DIAS_DA_SEMANA[index] }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Cabeçalho Fixo (Título) - Fundo uniforme e sem borda */}
      <View style={[styles.headerRow, { backgroundColor: theme.background, borderBottomWidth: 0 }]}>
          <Text style={[styles.title, { color: theme.foreground }]}>Planejador Semanal</Text>
      </View>

      {/* Seleção de Dia (Segmented Control Horizontal) - Fundo uniforme e sem borda */}
      <View style={[styles.daySelectorContainer, { borderBottomWidth: 0, backgroundColor: theme.background }]}>
        <SegmentedControl
            values={DIAS_DA_SEMANA.map(d => d.substring(0, 3))} // Seg, Ter, Qua, etc.
            selectedIndex={selectedDayIndex}
            onChange={(event) => handleDayChange(event.nativeEvent.selectedSegmentIndex)}
            style={styles.segmentedControl}
            backgroundColor={theme.muted} 
            tintColor={theme.primary}
            fontStyle={{ color: theme.foreground }}
            activeFontStyle={{ color: theme.primaryForeground, fontWeight: 'bold' }}
        />
      </View>
      
      {/* Lista de Rotina (Scrollable) */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {filteredRoutine.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar color={theme.mutedForeground} size={48} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
              {selectedDay} está livre!
            </Text>
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Adicione um bloco de estudo para este dia.
            </Text>
          </View>
        ) : (
          <View style={styles.routineList}>
            <Text style={[styles.listSubtitle, { color: theme.mutedForeground }]}>
                Blocos de estudo para {selectedDay}:
            </Text>
            {filteredRoutine.map(item => (
                <RoutineItem 
                    key={item.id} 
                    item={item} 
                    theme={theme} 
                    openEditDialog={handleOpenDialog}
                    handleDelete={deleteItem}
                />
            ))}
          </View>
        )}
      </ScrollView>


      {/* ==============================================================
          DIALOG / MODAL (Criação e Edição)
      ============================================================== */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={[styles.dialogTitle, { color: theme.foreground }]}>
            {editingItem ? `Editar Bloco - ${editingItem.dia}` : `Novo Bloco`}
          </Text>
          <View style={styles.form}>
              
            {/* Campo Dia da Semana (SELECT) */}
            <Text style={[styles.label, { color: theme.foreground }]}>Dia da Semana</Text>
            <Select
                value={formData.dia}
                onValueChange={(value) => setFormData({ ...formData, dia: value })}
                prompt="Selecione o Dia da Semana"
            >
                {DIAS_DA_SEMANA.map((day) => (
                    <SelectItem key={day} label={day} value={day} />
                ))}
            </Select>

            {/* Campo Horário */}
            <Text style={[styles.label, { color: theme.foreground }]}>Horário de Início (HH:MM)</Text>
            <CampoDeTexto
              value={formData.horario}
              onChangeText={(t) => setFormData({ ...formData, horario: t })}
              placeholder="Ex: 14:00"
              keyboardType="numbers-and-punctuation" 
            />

            {/* Campo Duração */}
            <Text style={[styles.label, { color: theme.foreground }]}>Duração (Ex: 2h ou 90min)</Text>
            <CampoDeTexto
              value={formData.duracao}
              onChangeText={(t) => setFormData({ ...formData, duracao: t })}
              placeholder="Ex: 2h ou 90min"
            />

            {/* Campo Matéria/Foco */}
            <Text style={[styles.label, { color: theme.foreground }]}>Matéria/Foco (Ex: UERJ)</Text>
            <CampoDeTexto
              value={formData.materia}
              onChangeText={(t) => setFormData({ ...formData, materia: t })}
              placeholder="Ex: História do Brasil, Foco UERJ, Redação"
            />
            
            <View style={styles.dialogActions}>
              <Botao variant="destructive-outline" onPress={handleCloseDialog} style={{ flex: 1 }}>
                Cancelar
              </Botao>
              <Botao onPress={handleSave} disabled={isLoading} style={{ flex: 1 }}>
                {isLoading ? <ActivityIndicator color={theme.primaryForeground} /> : (editingItem ? 'Salvar Edição' : 'Adicionar')}
              </Botao>
            </View>
          </View>
        </ScrollView>
      </Dialog>
      
      {/* Botão Flutuante (Criar Novo) */}
      <TouchableOpacity 
        style={[styles.roundFloatingButtonBase, styles.floatingButton, { backgroundColor: theme.primary }]} 
        onPress={() => handleOpenDialog(null)}
      >
        {/* CORRIGIDO: Alterado o size de 28 para 30 para corresponder às outras telas. */}
        <Plus size={30} color={theme.primaryForeground} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 }, 
  
  // --- Cabeçalho e Seleção de Dia ---
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0,
  },
  title: { fontSize: 28, fontWeight: '700' },

  daySelectorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  segmentedControl: {
    height: 38,
  },
  listSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },

  // --- Lista de Rotina ---
  routineList: {
    marginTop: 16,
    gap: 12,
  },
  routineCard: {
      width: '100%',
      padding: 16,
      borderLeftWidth: 4, 
      borderLeftColor: cores.light.primary,
  },
  cardHeaderTime: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  cardTime: {
      fontSize: 16,
      fontWeight: '700',
  },
  cardDuration: {
      fontSize: 12,
      fontWeight: '600',
  },
  cardContentSubject: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  cardSubject: {
      fontSize: 16,
      fontWeight: '500',
      flexShrink: 1,
      marginRight: 10,
  },
  routineActions: {
      flexDirection: 'row',
      gap: 4,
      marginLeft: 'auto',
  },
  
  // --- Dialog/Formulário ---
  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
  
  // --- Estado Vazio (Empty State) ---
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyIcon: {
    marginBottom: 16, 
    opacity: 0.8,
  },
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
  
  // --- Botão Flutuante ---
  roundFloatingButtonBase: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Propriedades de sombra fortes e corretas (iOS e Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 8, 
  },
  floatingButton: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    // Removidas as propriedades de sombra redundantes/conflitantes
  },
});
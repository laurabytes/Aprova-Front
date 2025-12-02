// app/(tabs)/perfil.jsx
import { Plus, Edit, Trash2, Calendar, Clock, ChevronUp, ChevronDown, BookOpen } from 'lucide-react-native'; 
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SegmentedControl from '@react-native-segmented-control/segmented-control'; 
import { useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Botao } from '../../componentes/Botao';
import { CampoDeTexto } from '../../componentes/CampoDeTexto';
import { Card } from '../../componentes/Card';
import { Dialog } from '../../componentes/Dialog';
import { Select, SelectItem } from '../../componentes/Select'; 
import { cores } from '../../tema/cores';

import { useAuth } from '../../contexto/AuthContexto';
import PlanejadorService from '../../servicos/PlanejadorService';

const DIAS_DA_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function TelaPlanejadorSemanal() {
  const { user } = useAuth();
  const theme = cores[useColorScheme() === 'dark' ? 'dark' : 'light'];
  
  const initialDayIndex = Math.max(0, DIAS_DA_SEMANA.indexOf(new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].charAt(0).toUpperCase() + new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].slice(1)));
  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex); 
  const selectedDay = DIAS_DA_SEMANA[selectedDayIndex];

  const [routine, setRoutine] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const [formData, setFormData] = useState({
    dia: selectedDay,
    horario: '08:00', // HH:MM
    duracao: '2h 00min', 
    materia: '',
  });

  const parseTimeString = (timeStr) => {
    if (!timeStr) return new Date();
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h) || 0, parseInt(m) || 0, 0, 0);
    return d;
  };

  const parseDurationString = (durStr) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const hMatch = durStr.match(/(\d+)h/);
    const mMatch = durStr.match(/(\d+)min/);
    
    let hours = hMatch ? parseInt(hMatch[1]) : 0;
    let minutes = mMatch ? parseInt(mMatch[1]) : 0;
    
    if (!hMatch && !mMatch && !isNaN(parseInt(durStr))) {
        hours = Math.floor(parseInt(durStr) / 60);
        minutes = parseInt(durStr) % 60;
    } else if (!hMatch && !mMatch) {
        hours = 2; minutes = 0;
    }
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const loadRoutine = async () => {
    if (!user || !user.id) return;
    try {
        setIsLoadingData(true);
        const data = await PlanejadorService.listarPorUsuario(user.id);
        setRoutine(data || []);
    } catch (error) {
        console.error("Erro ao carregar rotina", error);
    } finally {
        setIsLoadingData(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoutine();
    }, [user])
  );

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  const getFilteredAndSortedRoutine = (day) => {
    return routine
      .filter(item => item.dia === day)
      .map(item => ({
        ...item,
        horarioDisplay: `${item.hora.toString().padStart(2, '0')}:${item.min.toString().padStart(2, '0')}`,
        duracaoDisplay: formatDuration(item.duracao),
      }))
      .sort((a, b) => {
        const timeA = a.hora * 60 + a.min;
        const timeB = b.hora * 60 + b.min;
        return timeA - timeB;
      });
  };

  const filteredRoutine = getFilteredAndSortedRoutine(selectedDay);

  const toggleTimePicker = () => {
    setShowDurationPicker(false);
    setShowTimePicker(prev => !prev);
  };

  const toggleDurationPicker = () => {
    setShowTimePicker(false);
    setShowDurationPicker(prev => !prev);
  };

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setShowTimePicker(false);
    }
    
    if (selectedDate) {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        setFormData({ ...formData, horario: `${hours}:${minutes}` });
    }
  };

  const onDurationChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setShowDurationPicker(false);
    }

    if (selectedDate) {
        const h = selectedDate.getHours();
        const m = selectedDate.getMinutes();
        setFormData({ ...formData, duracao: `${h}h ${m}min` });
    }
  };

  const handleSave = async () => {
    const [horaStr, minStr] = formData.horario.split(':');
    const hora = parseInt(horaStr, 10);
    const min = parseInt(minStr, 10) || 0;
    
    if (!formData.materia.trim()) {
        Alert.alert('Erro', 'O nome da matéria é obrigatório.');
        return;
    }

    const durDate = parseDurationString(formData.duracao);
    const duracaoMinutos = (durDate.getHours() * 60) + durDate.getMinutes();

    if (duracaoMinutos === 0) {
        Alert.alert('Erro', 'A duração não pode ser zero.');
        return;
    }

    setIsSaving(true);

    try {
        const payload = {
            dia: formData.dia,
            hora: hora,
            min: min,
            duracao: duracaoMinutos,
            materia: formData.materia,
            usuarioId: user.id
        };

        if (editingItem) {
            await PlanejadorService.atualizar(editingItem.id, payload);
        } else {
            await PlanejadorService.criar(payload);
        }

        await loadRoutine();
        handleCloseDialog();

    } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir Item', 'Tem certeza que deseja remover?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
                await PlanejadorService.apagar(id);
                setRoutine(prev => prev.filter(item => item.id !== id));
            } catch (error) {
                Alert.alert('Erro', 'Falha ao excluir.');
            }
          },
        },
      ]);
  };

  const handleOpenDialog = (item = null) => {
    setShowTimePicker(false);
    setShowDurationPicker(false);

    if (item) {
        setEditingItem(item);
        const h = Math.floor(item.duracao / 60);
        const m = item.duracao % 60;
        
        setFormData({
            dia: item.dia,
            horario: `${item.hora.toString().padStart(2, '0')}:${item.min.toString().padStart(2, '0')}`,
            duracao: `${h}h ${m}min`,
            materia: item.materia,
        });
    } else {
        setEditingItem(null);
        setFormData({ 
            dia: selectedDay, 
            horario: '08:00', 
            duracao: '2h 00min', 
            materia: '' 
        });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };
  
  const handleDayChange = (index) => {
    setSelectedDayIndex(index);
    setFormData(prev => ({ ...prev, dia: DIAS_DA_SEMANA[index] }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.foreground }]}>Planejador</Text>
      </View>

      <View style={[styles.daySelectorContainer, { backgroundColor: theme.background }]}>
        <SegmentedControl
            values={DIAS_DA_SEMANA.map(d => d.substring(0, 3))}
            selectedIndex={selectedDayIndex}
            onChange={(event) => handleDayChange(event.nativeEvent.selectedSegmentIndex)}
            style={styles.segmentedControl}
            backgroundColor={theme.muted} 
            tintColor={theme.primary}
            fontStyle={{ color: theme.foreground }}
            activeFontStyle={{ color: theme.primaryForeground, fontWeight: 'bold' }}
        />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoadingData ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : filteredRoutine.length === 0 ? (
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
            {filteredRoutine.map(item => {
                const endMinutesTotal = (item.hora * 60) + item.min + item.duracao;
                const endHour = Math.floor(endMinutesTotal / 60) % 24;
                const endMin = endMinutesTotal % 60;

                return (
                    <Card key={item.id} style={styles.routineCard}>
                        {/* Linha Principal: Matéria e Ações */}
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.subjectContainer}>
                                <BookOpen size={18} color={theme.primary} style={{ marginRight: 8 }} />
                                <Text style={[styles.cardSubject, { color: theme.foreground }]} numberOfLines={1}>
                                    {item.materia}
                                </Text>
                            </View>
                            <View style={styles.routineActions}>
                                <TouchableOpacity onPress={() => handleOpenDialog(item)} style={styles.actionButton}>
                                    <Edit color={theme.mutedForeground} size={18} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                                    <Trash2 color={theme.destructive} size={18} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Linha Secundária: Horário e Duração (mais sutil) */}
                        <View style={styles.cardFooterRow}>
                            <View style={styles.timeInfo}>
                                <Clock size={14} color={theme.mutedForeground} style={{ marginRight: 6 }} />
                                <Text style={[styles.cardTime, { color: theme.mutedForeground }]}>
                                    {item.horarioDisplay} - {endHour.toString().padStart(2, '0')}:{endMin.toString().padStart(2, '0')}
                                </Text>
                            </View>
                            <Text style={[styles.cardDuration, { color: theme.mutedForeground }]}>
                                {item.duracaoDisplay}
                            </Text>
                        </View>
                    </Card>
                );
            })}
          </View>
        )}
      </ScrollView>

      {/* --- FORMULÁRIO --- */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={[styles.dialogTitle, { color: theme.foreground }]}>
            {editingItem ? `Editar Bloco` : `Novo Bloco`}
          </Text>
          <View style={styles.form}>
              
            <Text style={[styles.label, { color: theme.foreground }]}>Dia da Semana</Text>
            <Select
                value={formData.dia}
                onValueChange={(value) => setFormData({ ...formData, dia: value })}
                prompt="Selecione o Dia"
            >
                {DIAS_DA_SEMANA.map((day) => (
                    <SelectItem key={day} label={day} value={day} />
                ))}
            </Select>

            {/* SELETOR DE HORÁRIO */}
            <Text style={[styles.label, { color: theme.foreground }]}>Horário de Início</Text>
            <TouchableOpacity 
                style={[
                    styles.pickerButton, 
                    { 
                        borderColor: showTimePicker ? theme.primary : theme.border, 
                        backgroundColor: theme.card 
                    }
                ]}
                onPress={toggleTimePicker}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Clock size={20} color={theme.mutedForeground} style={{marginRight: 8}}/>
                    <Text style={{ fontSize: 16, color: theme.foreground }}>
                        {formData.horario}
                    </Text>
                </View>
                {Platform.OS === 'ios' && (
                    showTimePicker 
                        ? <ChevronUp size={20} color={theme.mutedForeground} /> 
                        : <ChevronDown size={20} color={theme.mutedForeground} />
                )}
            </TouchableOpacity>
            
            {showTimePicker && (
                <View style={styles.inlinePickerContainer}>
                    <DateTimePicker
                        value={parseTimeString(formData.horario)}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onTimeChange}
                        textColor={theme.foreground}
                        is24Hour={true}
                        style={Platform.OS === 'ios' ? { height: 120 } : undefined}
                    />
                </View>
            )}

            {/* SELETOR DE DURAÇÃO */}
            <Text style={[styles.label, { color: theme.foreground }]}>Duração</Text>
            <TouchableOpacity 
                style={[
                    styles.pickerButton, 
                    { 
                        borderColor: showDurationPicker ? theme.primary : theme.border, 
                        backgroundColor: theme.card 
                    }
                ]}
                onPress={toggleDurationPicker}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Clock size={20} color={theme.mutedForeground} style={{marginRight: 8}}/>
                    <Text style={{ fontSize: 16, color: theme.foreground }}>
                        {formData.duracao}
                    </Text>
                </View>
                {Platform.OS === 'ios' && (
                    showDurationPicker 
                        ? <ChevronUp size={20} color={theme.mutedForeground} /> 
                        : <ChevronDown size={20} color={theme.mutedForeground} />
                )}
            </TouchableOpacity>

            {showDurationPicker && (
                <View style={styles.inlinePickerContainer}>
                    <DateTimePicker
                        value={parseDurationString(formData.duracao)}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDurationChange}
                        textColor={theme.foreground}
                        is24Hour={true}
                        locale="pt-BR"
                        style={Platform.OS === 'ios' ? { height: 120 } : undefined}
                    />
                    <Text style={{fontSize: 12, color: theme.mutedForeground, textAlign: 'center', marginBottom: 8}}>
                        Selecione as horas e minutos de duração
                    </Text>
                </View>
            )}

            <Text style={[styles.label, { color: theme.foreground }]}>Matéria/Foco</Text>
            <CampoDeTexto
              value={formData.materia}
              onChangeText={(t) => setFormData({ ...formData, materia: t })}
              placeholder="Ex: História, Redação..."
            />
            
            <View style={styles.dialogActions}>
              <Botao variant="destructive-outline" onPress={handleCloseDialog} style={{ flex: 1 }}>
                Cancelar
              </Botao>
              <Botao onPress={handleSave} disabled={isSaving} style={{ flex: 1 }}>
                {isSaving ? <ActivityIndicator color={theme.primaryForeground} /> : (editingItem ? 'Salvar' : 'Adicionar')}
              </Botao>
            </View>
          </View>
        </ScrollView>
      </Dialog>
      
      <TouchableOpacity 
        style={[styles.roundFloatingButtonBase, styles.floatingButton, { backgroundColor: theme.primary }]} 
        onPress={() => handleOpenDialog(null)}
      >
        <Plus size={30} color={theme.primaryForeground} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 }, 
  headerRow: { 
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: { fontSize: 28, fontWeight: '700' },
  daySelectorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  segmentedControl: { height: 38 },
  listSubtitle: { fontSize: 14, marginBottom: 16 },
  routineList: { marginTop: 16, gap: 12 },
  
  // -- Estilo do Cartão Atualizado --
  routineCard: {
      width: '100%',
      padding: 16,
      // Removida a barra lateral azul (borderLeftWidth e borderLeftColor)
  },
  cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
  },
  subjectContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
  cardSubject: {
      fontSize: 18,
      fontWeight: '600',
      flexShrink: 1,
  },
  routineActions: { 
      flexDirection: 'row', 
      gap: 12, 
      marginLeft: 8 
  },
  actionButton: {
      padding: 4,
  },
  cardFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.05)', // Separador sutil
  },
  timeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  cardTime: { fontSize: 14, fontWeight: '500' },
  cardDuration: { fontSize: 13, fontWeight: '400' },
  // ---------------------------------

  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inlinePickerContainer: {
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 12,
  },

  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyIcon: { marginBottom: 16, opacity: 0.8 },
  emptyTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  emptyText: { textAlign: 'center', fontSize: 16, marginBottom: 16 },
  roundFloatingButtonBase: {
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
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
});
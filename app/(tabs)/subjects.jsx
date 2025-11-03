import { useRouter } from 'expo-router'; // Importante: ter o useRouter
import { Check, Pencil, Trash2, X } from 'lucide-react-native';
import React, { useContext, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SubjectsContext } from '../../context/SubjectsContext';
import { colors, fonts, spacing } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';

// ... (função getTextColorForBackground) ...
function getTextColorForBackground(hexColor) {
  try {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 140 ? colors.primaryText : colors.white;
  } catch (e) {
    return colors.primaryText; 
  }
}

export default function SubjectsScreen() {
  const { subjects, setSubjects } = useContext(SubjectsContext);
  const router = useRouter(); // Importante: inicializar o router
  const [subjectName, setSubjectName] = useState('');
  // ... (resto dos estados e funções) ...
  const [subjectColor, setSubjectColor] = useState('#FFD6E5');
  const [editingSubject, setEditingSubject] = useState(null);
  const [isColorPickerVisible, setColorPickerVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState(subjectColor);
  const [colorTarget, setColorTarget] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const touchableRefs = useRef({});

  const openColorPicker = (target, initialColor, ref) => {
    ref.current.measure((fx, fy, width, height, px, py) => {
      setPopoverPosition({ top: py + height + 5, left: px });
      setColorTarget(target);
      setCurrentColor(initialColor);
      setColorPickerVisible(true);
    });
  };

  const handleLiveColorChange = (color) => {
    setCurrentColor(color);
    if (colorTarget === 'add') {
      setSubjectColor(color);
    } else if (colorTarget === 'edit') {
      setEditingSubject({ ...editingSubject, color: color });
    }
  };

  const handleEditPress = (subject) => setEditingSubject({ ...subject });
  const handleCancelEdit = () => setEditingSubject(null);

  const handleUpdateSubject = () => {
    setSubjects(currentSubjects => 
      currentSubjects.map(s => (s.id === editingSubject.id ? editingSubject : s))
    );
    setEditingSubject(null);
  };

  const handleDeletePress = (subjectIdToDelete) => {
    Alert.alert('Confirmar Exclusão', 'Deseja mesmo excluir esta matéria?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => {
          setSubjects(currentSubjects => 
            currentSubjects.filter(subject => subject.id !== subjectIdToDelete)
          );
        },
      },
    ]);
  };

  const handleAddSubject = () => {
    if (subjectName.trim() === '') {
      Alert.alert('Erro', 'O nome da matéria não pode ser vazio.');
      return;
    }
    const newSubject = { id: Date.now().toString(), name: subjectName, hours: 0, color: subjectColor, priority: 'Normal' };
    setSubjects(currentSubjects => [newSubject, ...currentSubjects]);
    setSubjectName('');
  };

  const renderSubjectItem = ({ item }) => {
    const isEditing = editingSubject && editingSubject.id === item.id;
    const textColor = getTextColorForBackground(isEditing ? editingSubject.color : item.color);

    if (isEditing) {
      // ... (código do modo de edição) ...
      return (
        <Card style={[styles.subjectCard, { backgroundColor: editingSubject.color }]}>
          <View style={styles.subjectInfo}>
            <TextInput 
              style={[styles.editInput, { color: textColor, borderBottomColor: textColor }]}
              value={editingSubject.name} 
              onChangeText={(text) => setEditingSubject({ ...editingSubject, name: text })} 
              autoFocus 
            />
            <TouchableOpacity 
              ref={touchableRefs.current[item.id]} 
              onPress={() => openColorPicker('edit', editingSubject.color, touchableRefs.current[item.id])}
            >
              <Text style={[styles.changeColorText, { color: textColor, textDecorationColor: textColor }]}>Alterar cor</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.subjectActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleUpdateSubject}><Check size={24} color="green" /></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleCancelEdit}><X size={24} color={colors.red} /></TouchableOpacity>
          </View>
        </Card>
      );
    }

    return (
      <Card style={[styles.subjectCard, { backgroundColor: item.color }]}>
        <TouchableOpacity 
          style={styles.subjectInfo} 
          onPress={() => router.push(`/subject/${item.id}`)} // O link está aqui
        >
          <Text style={[styles.subjectName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.subjectHours, { color: textColor }]}>{item.hours}H estudadas</Text>
        </TouchableOpacity>
        <View style={styles.subjectActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEditPress(item)}>
            <Pencil size={20} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeletePress(item.id)}>
            <Trash2 size={20} color={colors.red} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };
  
  const addColorRef = React.createRef();

  return (
    <View style={commonStyles.container}>
      <Header showBackButton showProgress currentStep={3} totalSteps={5} />
      <ScrollView style={commonStyles.screenPadding} showsVerticalScrollIndicator={false}>
        {/* ... (o resto do JSX da tela) ... */}
        <Text style={styles.title}>Minhas Matérias</Text>
        <Text style={styles.subtitle}>Gerencie suas disciplinas de estudo.</Text>

        <Card>
          <Text style={styles.cardTitle}>Adicionar Matéria</Text>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} placeholder="Digite o nome da matéria" value={subjectName} onChangeText={setSubjectName} />
          <Text style={styles.label}>Cor</Text>
          <TouchableOpacity ref={addColorRef} style={styles.colorPreviewTouchable} onPress={() => openColorPicker('add', subjectColor, addColorRef)}>
            <View style={[styles.colorPreview, { backgroundColor: subjectColor }]} />
            <Text style={styles.colorValueText}>{subjectColor.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddSubject}><Text style={styles.addButtonText}>Adicionar</Text></TouchableOpacity>
        </Card>

        <FlatList data={subjects} keyExtractor={(item) => item.id} scrollEnabled={false} renderItem={renderSubjectItem} />
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <Modal visible={isColorPickerVisible} transparent={true} animationType="fade" onRequestClose={() => setColorPickerVisible(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setColorPickerVisible(false)} />
        <View style={[styles.popoverContainer, popoverPosition]}>
          <View style={styles.colorPickerWrapper}>
            <ColorPicker
              color={currentColor}
              onColorChange={handleLiveColorChange}
              thumbSize={25}
              sliderSize={25}
              noSnap={true}
              row={false}
              swatches={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    title: { fontSize: fonts.titleSize, fontWeight: '600', color: colors.primaryText, marginBottom: spacing.xs, },
    subtitle: { fontSize: fonts.bodySize, color: colors.secondaryText, marginBottom: spacing.md, },
    cardTitle: { fontSize: fonts.subtitleSize, fontWeight: '600', color: colors.primaryText, marginBottom: spacing.md, },
    label: { fontSize: fonts.bodySize, color: colors.primaryText, marginBottom: spacing.xs, fontWeight: '500', marginTop: spacing.sm, },
    input: { borderWidth: 1, borderColor: colors.gray, borderRadius: 8, padding: spacing.sm, fontSize: fonts.bodySize, color: colors.primaryText, backgroundColor: colors.white, },
    addButton: { backgroundColor: colors.accent, padding: spacing.sm, borderRadius: 8, alignItems: 'center', marginTop: spacing.md, },
    addButtonText: { color: colors.white, fontWeight: '600', fontSize: fonts.subtitleSize, },
    subjectCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
    subjectInfo: { flex: 1, },
    subjectName: { fontSize: fonts.subtitleSize, fontWeight: '600', marginBottom: spacing.xs, }, 
    subjectHours: { fontSize: fonts.bodySize, }, 
    subjectActions: { flexDirection: 'row', gap: spacing.sm, },
    actionButton: { padding: spacing.xs, },
    editInput: { 
      fontSize: fonts.subtitleSize, fontWeight: '600', 
      marginBottom: spacing.sm, 
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      backgroundColor: 'transparent',
    },
    changeColorText: { 
      fontWeight: '500', 
      textDecorationLine: 'underline',
    },
    colorPreviewTouchable: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.gray, borderRadius: 8, padding: spacing.xs, marginTop: spacing.xs, },
    colorPreview: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.gray, },
    colorValueText: { fontSize: fonts.bodySize, color: colors.secondaryText, },
    popoverContainer: { position: 'absolute', backgroundColor: 'white', borderRadius: 12, padding: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, gap: spacing.sm, },
    colorPickerWrapper: { height: 250, width: 250, },
});
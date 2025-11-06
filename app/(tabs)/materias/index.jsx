// app/(tabs)/materias/index.jsx
import { Link, useRouter } from 'expo-router'; 
import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react-native'; 
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal, 
  Pressable, 
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, 
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker'; 
import { Botao } from '../../../componentes/Botao';
import { CampoDeTexto } from '../../../componentes/CampoDeTexto';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../componentes/Card';
import { Dialog } from '../../../componentes/Dialog';
import { Textarea } from '../../../componentes/Textarea';
import { useAuth } from '../../../contexto/AuthContexto';
import { cores } from '../../../tema/cores';

// ALTERAÇÃO 1: Mock de dados removido
// let MOCK_SUBJECTS = [ ... ];

// Função helper para decidir a cor do texto (sem alteração)
function getTextColorForBackground(hexColor) {
  try {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 180 ? cores.light.foreground : cores.light.primaryForeground; 
  } catch (e) {
    return cores.light.foreground; 
  }
}

export default function TelaMaterias() {
  const { user } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  // ALTERAÇÃO 2: O estado 'subjects' já começa vazio (correto)
  const [subjects, setSubjects] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [isColorPickerVisible, setColorPickerVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState(cores.light.primary);
  const [colorTarget, setColorTarget] = useState(null);
  
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', cor: cores.light.primary });

  // ALTERAÇÃO 3: useEffect modificado para não carregar mais o MOCK_SUBJECTS
  useEffect(() => {
    setIsPageLoading(true);
    // No futuro, você pode carregar dados do AsyncStorage aqui
    // Por enquanto, apenas garantimos que começa vazio
    setSubjects([]);
    setIsPageLoading(false);
  }, [user]);

  // --- Lógica de Abertura do Color Picker (sem alteração) ---
  const openColorPicker = (target, initialColor) => {
    setColorTarget(target);
    setCurrentColor(initialColor);
    setColorPickerVisible(true);
  };

  const handleLiveColorChange = (color) => {
    setCurrentColor(color);
  };
  
  const handleConfirmColor = () => {
    setFormData(prev => ({ ...prev, cor: currentColor }));
    setColorPickerVisible(false);
  }

  // --- Lógica de Form (sem alteração) ---
  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 300)); 

    try {
      if (editingSubject) {
        setSubjects(prev => 
          prev.map(s => 
            s.id === editingSubject.id 
            ? { ...s, nome: formData.nome, descricao: formData.descricao, cor: formData.cor } 
            : s
          )
        );
      } else {
        const newSubject = {
          ...formData,
          id: Math.random(), 
          usuarioId: user?.id,
          cor: formData.cor,
        };
        setSubjects(prev => [...prev, newSubject]);
      }
      setIsDialogOpen(false);
      setFormData({ nome: '', descricao: '', cor: theme.primary });
      setEditingSubject(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a matéria.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Excluir Matéria', 'Tem certeza que deseja excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSubjects(prev => prev.filter(s => s.id !== id));
        },
      },
    ]);
  };

  const openEditDialog = (subject) => {
    setEditingSubject(subject);
    setFormData({ nome: subject.nome, descricao: subject.descricao, cor: subject.cor });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSubject(null);
    setFormData({ nome: '', descricao: '', cor: theme.primary });
    setIsDialogOpen(true);
  };
  
  const ColorPreviewSelector = ({ onPress, color }) => (
    <TouchableOpacity style={styles.colorPreviewTouchable} onPress={onPress}>
      <View style={[styles.colorPreview, { backgroundColor: color }]} />
      <Text style={styles.colorValueText}>{color?.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.foreground }]}>Matérias</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Organize suas matérias e flashcards
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={openCreateDialog}
          >
            <Plus color={theme.primaryForeground} size={20} />
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* MODAL DE CRIAÇÃO/EDIÇÃO (sem alteração) */}
        {/* ============================================================== */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <View>
            <Text style={[styles.dialogTitle, { color: theme.foreground }]}>
              {editingSubject ? 'Editar Matéria' : 'Nova Matéria'}
            </Text>
            <Text style={[styles.dialogDescription, { color: theme.mutedForeground }]}>
              {editingSubject ? 'Edite as informações da matéria' : 'Adicione uma nova matéria'}
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>Nome</Text>
                <CampoDeTexto
                  value={formData.nome}
                  onChangeText={(t) => setFormData({ ...formData, nome: t })}
                  placeholder="Ex: Matemática"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>Descrição</Text>
                <Textarea
                  value={formData.descricao}
                  onChangeText={(t) => setFormData({ ...formData, descricao: t })}
                  placeholder="Descreva a matéria"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>Cor</Text>
                <ColorPreviewSelector
                  color={formData.cor}
                  onPress={() => openColorPicker(editingSubject ? 'edit' : 'add', formData.cor)}
                />
              </View>

              <View style={styles.dialogActions}>
                <Botao variant="destructive" onPress={() => setIsDialogOpen(false)}>
                  Cancelar
                </Botao>
                <Botao onPress={handleSubmit} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color={theme.primaryForeground} /> : (editingSubject ? 'Salvar' : 'Criar')}
                </Botao>
              </View>
            </View>
          </View>
        </Dialog>

        {isPageLoading && <ActivityIndicator size="large" color={theme.primary} />}

        {/* ALTERAÇÃO 4: Esta lógica agora mostrará o estado vazio primeiro */}
        {!isPageLoading && subjects.length === 0 ? (
          <Card>
            <CardContent style={styles.emptyState}>
              <BookOpen color={theme.mutedForeground} size={48} />
              <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
                Nenhuma matéria cadastrada
              </Text>
              <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
                Comece criando sua primeira matéria
              </Text>
              <Botao onPress={openCreateDialog}>
                <Plus size={16} color="#FFF" style={{ marginRight: 8 }} />
                Criar Primeira Matéria
              </Botao>
            </CardContent>
          </Card>
        ) : (
          <View style={styles.grid}>
            {subjects.map((subject) => {
                const textColor = getTextColorForBackground(subject.cor);
                return (
                    <Card key={subject.id} style={[styles.card, { backgroundColor: subject.cor || theme.card }]}>
                      <CardHeader style={{ paddingTop: 16, paddingBottom: 8, paddingHorizontal: 16 }}>
                        <View style={styles.cardTitleRow}>
                          <CardTitle style={{ flex: 1, color: textColor, fontSize: 20 }}>
                            {subject.nome}
                          </CardTitle>
                          <TouchableOpacity onPress={() => openEditDialog(subject)}>
                            <Edit color={textColor} size={18} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(subject.id)}>
                            <Trash2 color={theme.destructive} size={18} />
                          </TouchableOpacity>
                        </View>
                        {subject.descricao && (
                          <CardDescription style={{ color: textColor, opacity: 0.8 }}>{subject.descricao}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                        <Link href={`/(tabs)/materias/${subject.id}`} asChild>
                          <Botao variant="default" style={{ backgroundColor: theme.primary }}>
                            <BookOpen size={16} color={theme.primaryForeground} style={{ marginRight: 8 }} />
                            Ver Flashcards
                          </Botao>
                        </Link>
                      </CardContent>
                    </Card>
                );
            })}
          </View>
        )}
      </ScrollView>

      {/* ============================================================== */}
      {/* MODAL DO COLOR PICKER (sem alteração) */}
      {/* ============================================================== */}
      <Modal visible={isColorPickerVisible} transparent={true} animationType="fade" onRequestClose={() => setColorPickerVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setColorPickerVisible(false)} />
        
        <View style={styles.colorPickerModalContent}>
          <Card style={styles.colorPickerWrapper}>
            <Text style={[styles.dialogTitle, { color: theme.foreground, marginBottom: 16 }]}>
                Selecione a Cor
            </Text>
            <ColorPicker
              color={currentColor}
              onColorChange={handleLiveColorChange}
              thumbSize={35}
              sliderSize={20}
              noSnap={true}
              row={false}
              swatches={false}
            />
            <View style={styles.colorPickerActions}>
                <Botao variant="destructive" onPress={() => setColorPickerVisible(false)} style={{ flex: 1 }}>
                    Cancelar
                </Botao>
                <Botao onPress={handleConfirmColor} style={{ flex: 1 }}>
                    Confirmar
                </Botao>
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==============================================================
// ESTILOS (sem alteração)
// ==============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 60 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4 },
  addButton: {
    padding: 10,
    borderRadius: 20,
  },
  grid: { gap: 16 },
  card: { width: '100%' },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyText: { textAlign: 'center' },
  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  dialogDescription: { fontSize: 14, color: '#737373', marginBottom: 16 },
  form: { gap: 12 },
  inputGroup: { width: '100%', gap: 6 }, 
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorPickerModalContent: {
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerWrapper: {
    width: '90%',
    maxWidth: 350,
    padding: 20,
    maxHeight: '80%',
  },
  colorPickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  colorPreviewTouchable: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    borderWidth: 1, 
    borderColor: cores.light.border, 
    borderRadius: 8, 
    padding: 8, 
    backgroundColor: cores.light.card,
    height: 44,
  },
  colorPreview: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: cores.light.border, 
  },
  colorValueText: { 
    fontSize: 14, 
    color: cores.light.mutedForeground,
  },
});
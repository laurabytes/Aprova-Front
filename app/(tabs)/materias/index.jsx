// app/(tabs)/materias/index.jsx
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { BookOpen, Edit, Plus, Shuffle, Trash2 } from 'lucide-react-native';
import { useState, useCallback } from 'react'; 
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import ColorPicker from 'react-native-wheel-color-picker';

// Componentes
import { Botao } from '../../../componentes/Botao';
import { CampoDeTexto } from '../../../componentes/CampoDeTexto';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../componentes/Card';
import { Dialog } from '../../../componentes/Dialog';
import { Textarea } from '../../../componentes/Textarea';

// Contextos e Serviços
import { useAuth } from '../../../contexto/AuthContexto';
import { useSubjects } from '../../../contexto/SubjectContexto'; 
import MateriaService from '../../../servicos/MateriaService'; 
import { cores } from '../../../tema/cores';

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
  const { getFlashcardsBySubject } = useSubjects();
  
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [isPageLoading, setIsPageLoading] = useState(true); 

  // Estados do Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', cor: theme.primary });

  // --- FUNÇÃO PARA CARREGAR MATÉRIAS DA API ---
  const loadMaterias = async () => {
    // 💡 CORREÇÃO 1: Evita chamada com ID undefined
    if (!user || !user.id) return;

    try {
      setIsPageLoading(true);
      // 💡 CORREÇÃO 2: Passa o ID do usuário para o serviço
      const data = await MateriaService.listar(user.id);
      setSubjects(data || []);
    } catch (error) {
      console.error("Erro ao listar matérias:", error);
      Alert.alert('Erro', 'Não foi possível carregar as matérias.');
    } finally {
      setIsPageLoading(false);
    }
  };

  useFocusEffect(
    // 💡 CORREÇÃO 3: Adiciona 'user' como dependência para recarregar ao logar
    useCallback(() => {
      loadMaterias();
    }, [user])
  );

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setShowColorPicker(false);
    setEditingSubject(null);
    setFormData({ nome: '', descricao: '', cor: theme.primary });
  };

  // --- SUBMIT COM MATERIASERVICE ---
  const handleSubmit = async () => {
    if (formData.nome.trim() === '') {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha o nome da matéria.');
      return;
    }

    if (!user || !user.id) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao, 
        cor: formData.cor,
        usuarioId: user.id 
      };

      if (editingSubject) {
        await MateriaService.atualizar(editingSubject.id, payload);
      } else {
        await MateriaService.criar(payload);
      }
      
      await loadMaterias();
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a matéria.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE COM MATERIASERVICE ---
  const handleDelete = async (id) => {
    Alert.alert('Excluir Matéria', 'Tem certeza que deseja excluir? Isso excluirá todos os flashcards associados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);
            await MateriaService.apagar(id);
            await loadMaterias(); 
          } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir matéria.');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const openEditDialog = (subject) => {
    setEditingSubject(subject);
    setFormData({ 
      nome: subject.nome, 
      descricao: subject.descricao || '', 
      cor: subject.cor || theme.primary 
    });
    setShowColorPicker(false);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSubject(null);
    setFormData({ nome: '', descricao: '', cor: theme.primary });
    setShowColorPicker(false);
    setIsDialogOpen(true);
  };

  const handleStartMixedSession = () => {
    let allFlashcards = [];

    subjects.forEach(subject => {
      const materiaId = String(subject.id); 
      const materiaColor = subject.cor && subject.cor.length > 3 ? subject.cor : theme.primary;
      
      const materiaFlashcards = getFlashcardsBySubject(materiaId);
      
      if (materiaFlashcards && materiaFlashcards.length > 0) {
        const flashcardsWithColor = materiaFlashcards.map(fc => ({
          ...fc,
          cor: materiaColor,
          materiaNome: subject.nome, 
        }));
        allFlashcards = allFlashcards.concat(flashcardsWithColor);
      }
    });

    if (allFlashcards.length === 0) {
      Alert.alert('Sessão Mista', 'Nenhum flashcard encontrado nas suas matérias.');
      return;
    }

    // Embaralhar
    for (let i = allFlashcards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allFlashcards[i], allFlashcards[j]] = [allFlashcards[j], allFlashcards[i]];
    }

    router.push({
      pathname: '/(tabs)/materias/revisao',
      params: { deck: JSON.stringify(allFlashcards) },
    });
  };

  const ColorPreviewSelector = ({ onPress, color }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        padding: 8,
        backgroundColor: theme.card,
        height: 44,
      }}
      onPress={onPress}
    >
      <View style={[styles.colorPreview, { backgroundColor: color, borderColor: theme.border }]} />
      <Text style={{ fontSize: 14, color: theme.mutedForeground }}>
        {color?.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.foreground }]}>Matérias</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Organize suas matérias e flashcards
            </Text>
          </View>

          <View style={styles.headerButtonsContainer}>
            {subjects.length > 0 && (
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.muted }]}
                onPress={handleStartMixedSession}
              >
                <Shuffle color={theme.foreground} size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* DIALOGO DE CRIAÇÃO/EDIÇÃO */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[styles.dialogTitle, { color: theme.foreground }]}>
              {editingSubject ? 'Editar Matéria' : 'Nova Matéria'}
            </Text>
            <CardDescription style={{ color: theme.mutedForeground, marginBottom: 16 }}>
              {editingSubject ? 'Edite as informações da matéria' : 'Adicione uma nova matéria'}
            </CardDescription>

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
                  placeholder="Descreva a matéria (opcional)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>Cor</Text>
                <ColorPreviewSelector
                  color={formData.cor}
                  onPress={() => setShowColorPicker(prev => !prev)}
                />
              </View>

              {showColorPicker && (
                <View style={styles.colorPickerContainer}>
                  <ColorPicker
                    color={formData.cor}
                    onColorChange={(color) => {
                      setFormData(prev => ({ ...prev, cor: color }));
                    }}
                    thumbSize={30}
                    sliderSize={20}
                    noSnap={true}
                    row={false}
                    swatches={false}
                    style={{ height: 200 }}
                  />
                  <Botao
                    onPress={() => setShowColorPicker(false)}
                    style={{ width: '100%', marginTop: 16 }}
                  >
                    Confirmar Cor
                  </Botao>
                </View>
              )}

              <View style={[styles.dialogActions, { justifyContent: 'space-between' }]}>
                <Botao
                  variant="destructive-outline"
                  onPress={handleCloseDialog}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Botao>
                <Botao
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.primaryForeground} />
                  ) : (
                    editingSubject ? 'Salvar' : 'Criar'
                  )}
                </Botao>
              </View>
            </View>
          </ScrollView>
        </Dialog>

        {/* LISTA DE MATÉRIAS OU EMPTY STATE */}
        {isPageLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : subjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen color={theme.mutedForeground} size={48} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
              Nenhuma matéria cadastrada
            </Text>
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Toque o botão abaixo para adicionar sua primeira matéria.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {subjects.map((subject) => {
               const cardColor = subject.cor || theme.card; 
               const textColor = getTextColorForBackground(cardColor === theme.card ? '#FFFFFF' : cardColor);
               
               return (
                <Link 
                  key={subject.id} 
                  href={{
                    pathname: "/(tabs)/materias/[id]",
                    params: { 
                      id: subject.id,
                      cor: cardColor.replace('#', ''), 
                      nome: subject.nome,
                      descricao: subject.descricao || ''
                    }
                  }}
                  asChild
                >
                  <Pressable>
                    <Card style={[styles.card, { borderLeftColor: cardColor, borderLeftWidth: 6 }]}>
                      <CardHeader>
                        <View style={styles.cardTitleRow}>
                          <CardTitle style={{ color: theme.foreground }}>
                            {subject.nome}
                          </CardTitle>
                          
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity 
                              onPress={(e) => {
                                e.stopPropagation(); 
                                openEditDialog(subject);
                              }}
                              style={{ padding: 4 }}
                            >
                              <Edit size={18} color={theme.mutedForeground} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              onPress={(e) => {
                                e.stopPropagation(); 
                                handleDelete(subject.id);
                              }}
                              style={{ padding: 4 }}
                            >
                              <Trash2 size={18} color={theme.destructive} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {subject.descricao ? (
                          <CardDescription numberOfLines={2}>
                            {subject.descricao}
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                    </Card>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: theme.primary }]}
        onPress={openCreateDialog}
      >
        <Plus size={30} color={theme.primaryForeground} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 120 }, 
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4 },
  headerButton: {
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { gap: 16 },
  card: { width: '100%' },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
    minHeight: 300,
  },
  emptyIcon: { marginBottom: 16, opacity: 0.8 },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptyText: { textAlign: 'center', fontSize: 16, marginBottom: 16 },
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
  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  form: { gap: 12 },
  inputGroup: { width: '100%', gap: 6 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 20,
  },
  colorPickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    gap: 0,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
});
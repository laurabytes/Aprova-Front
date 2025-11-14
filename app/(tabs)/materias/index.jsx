// app/(tabs)/materias/index.jsx
import { Link, useRouter } from 'expo-router';
import { BookOpen, Edit, Plus, Shuffle, Trash2 } from 'lucide-react-native';
import { useState } from 'react'; // Removido useEffect
import {
  ActivityIndicator,
  Alert,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../componentes/Card';
import { Dialog } from '../../../componentes/Dialog';
import { Textarea } from '../../../componentes/Textarea';
import { useAuth } from '../../../contexto/AuthContexto';
import { useSubjects } from '../../../contexto/SubjectContexto'; // NOVO: Importar useSubjects
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
  // USAR CONTEXTO: Obter subjects, loading state e funções CRUD
  const { 
    subjects, 
    isLoading: isPageLoading,
    addSubject, 
    updateSubject, 
    deleteSubject,
    getFlashcardsBySubject,
  } = useSubjects();
  
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', cor: theme.primary });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setShowColorPicker(false);
    setEditingSubject(null);
    setFormData({ nome: '', descricao: '', cor: theme.primary });
  };

  const handleSubmit = async () => {
    if (formData.nome.trim() === '') {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha o nome da matéria.');
      return;
    }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 300));

    try {
      if (editingSubject) {
        updateSubject({ ...editingSubject, nome: formData.nome, descricao: formData.descricao, cor: formData.cor });
      } else {
        const newSubject = {
          ...formData,
          id: Date.now().toString(), // Usando string ID para consistência
          usuarioId: user?.id || 'guest',
          cor: formData.cor,
        };
        addSubject(newSubject);
      }
      handleCloseDialog();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a matéria.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Excluir Matéria', 'Tem certeza que deseja excluir? Isso excluirá todos os flashcards associados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          deleteSubject(id);
        },
      },
    ]);
  };

  const openEditDialog = (subject) => {
    setEditingSubject(subject);
    setFormData({ nome: subject.nome, descricao: subject.descricao, cor: subject.cor });
    setShowColorPicker(false);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSubject(null);
    setFormData({ nome: '', descricao: '', cor: theme.primary });
    setShowColorPicker(false);
    setIsDialogOpen(true);
  };

  // CORREÇÃO DA LÓGICA DE SESSÃO MISTA
  const handleStartMixedSession = () => {
    let allFlashcards = [];

    subjects.forEach(subject => {
      // CORREÇÃO: Garante que o ID da matéria é uma string, prevenindo erros de chave.
      const materiaId = String(subject.id); 
      const materiaColor = subject.cor;
      // Puxa os flashcards do contexto
      const materiaFlashcards = getFlashcardsBySubject(materiaId);
      
      if (materiaFlashcards.length > 0) {
        const flashcardsWithColor = materiaFlashcards.map(fc => ({
          ...fc,
          cor: materiaColor,
          materiaNome: subject.nome, // Adicionar o nome para exibir na revisão
        }));
        allFlashcards = allFlashcards.concat(flashcardsWithColor);
      }
    });

    if (allFlashcards.length === 0) {
      Alert.alert('Sessão Mista', 'Nenhum flashcard encontrado nas suas matérias cadastradas.');
      return;
    }

    // Embaralhar o array
    for (let i = allFlashcards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allFlashcards[i], allFlashcards[j]] = [allFlashcards[j], allFlashcards[i]];
    }

    // Navegar para a tela de revisão
    router.push({
      pathname: '/(tabs)/materias/revisao',
      params: {
        deck: JSON.stringify(allFlashcards),
      },
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
                  placeholder="Descreva a matéria"
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

        {isPageLoading && <ActivityIndicator size="large" color={theme.primary} />}

        {!isPageLoading && subjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen color={theme.mutedForeground} size={48} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
              Nenhuma matéria cadastrada
            </Text>
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Toque o botão abaixo para adicionar sua primeira matéria e começar a criar flashcards!
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {subjects.map((subject) => {
              const textColor = getTextColorForBackground(subject.cor);
              return (
                <Link
                  key={subject.id}
                  href={{
                    pathname: `/(tabs)/materias/${subject.id}`,
                    params: {
                      cor: subject.cor.replace('#', ''),
                      nome: subject.nome,
                      descricao: subject.descricao || ''
                    }
                  }}
                  asChild
                >
                  <Pressable>
                    <Card style={[styles.card, { backgroundColor: subject.cor || theme.card }]}>
                      <CardHeader style={{ paddingTop: 24, paddingBottom: 24, paddingHorizontal: 16 }}>
                        <View style={styles.cardTitleRow}>
                          <CardTitle style={{ flex: 1, color: textColor, fontSize: 20 }}>
                            {subject.nome}
                          </CardTitle>

                          <TouchableOpacity
                            style={{ padding: 12 }}
                            onPress={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openEditDialog(subject);
                            }}
                          >
                            <Edit color={textColor} size={18} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ padding: 12 }}
                            onPress={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(subject.id);
                            }}
                          >
                            <Trash2 color={textColor} size={18} />
                          </TouchableOpacity>
                        </View>
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
// ... (styles)
const styles = StyleSheet.create({
  container: { flex: 1 },
  // CORRIGIDO: Aumentar paddingBottom para não ser cortado pela Tab Bar
  scrollContent: { padding: 20, gap: 24, paddingBottom: 120 }, 
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    minHeight: 400,
  },
  emptyIcon: { marginBottom: 16, opacity: 0.8 },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptyText: { textAlign: 'center', fontSize: 16, marginBottom: 16 },

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

  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  dialogDescription: { fontSize: 14, color: '#737373', marginBottom: 16 },
  form: { gap: 12 },
  inputGroup: { width: '100%', gap: 6 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },

  // === BOTÕES GRANDES NO MODAL ===
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
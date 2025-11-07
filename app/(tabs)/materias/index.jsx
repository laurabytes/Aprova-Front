// app/(tabs)/materias/index.jsx
import { Link, useRouter } from 'expo-router';
import { BookOpen, Edit, Plus, Shuffle, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../componentes/Card';
import { Dialog } from '../../../componentes/Dialog';
import { Textarea } from '../../../componentes/Textarea';
import { useAuth } from '../../../contexto/AuthContexto';
import { cores } from '../../../tema/cores';

// MOCK_DATA (Flashcards)
const MOCK_DATA = {
    1: { 
        flashcards: [
            { id: 101, pergunta: 'O que é 2+2?', resposta: '4', materiaId: 1 },
            { id: 102, pergunta: 'O que é a fórmula de Bhaskara?', resposta: 'x = [-b ± sqrt(b² - 4ac)] / 2a', materiaId: 1 },
        ]
    },
    2: {
        flashcards: [
            { id: 103, pergunta: 'Quem descobriu o Brasil?', resposta: 'Pedro Álvares Cabral', materiaId: 2 },
        ]
    }
};

// (Função getTextColorForBackground... sem alteração)
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

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', cor: theme.primary });

  useEffect(() => {
    setIsPageLoading(true);
    setSubjects([]); // Deixando vazio para testar o estado vazio
    setIsPageLoading(false);
  }, [user]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setShowColorPicker(false);
    setEditingSubject(null);
    setFormData({ nome: '', descricao: '', cor: theme.primary });
  }

  const handleSubmit = async () => {
    if (formData.nome.trim() === '') {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha o nome da matéria.');
      return;
    }
    
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
      handleCloseDialog();
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
    const subjectColorMap = new Map();
    subjects.forEach(subject => {
      subjectColorMap.set(subject.id, subject.cor);
    });

    let allFlashcards = [];
    Object.keys(MOCK_DATA).forEach(materiaId => {
      const materiaColor = subjectColorMap.get(Number(materiaId));
      
      if (materiaColor) {
        const materiaFlashcards = MOCK_DATA[materiaId].flashcards;
        const flashcardsWithColor = materiaFlashcards.map(fc => ({
          ...fc,
          cor: materiaColor,
        }));
        allFlashcards = allFlashcards.concat(flashcardsWithColor);
      }
    });

    if (allFlashcards.length === 0) {
      Alert.alert('Sessão Mista', 'Nenhum flashcard encontrado nas suas matérias cadastradas.');
      return;
    }

    for (let i = allFlashcards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allFlashcards[i], allFlashcards[j]] = [allFlashcards[j], allFlashcards[i]];
    }

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
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.muted }]} // Botão de Sessão Mista
              onPress={handleStartMixedSession}
            >
              <Shuffle color={theme.foreground} size={20} />
            </TouchableOpacity>

            {/* Condição: Mostra o botão "+" do header APENAS se houver matérias */}
            {!isPageLoading && subjects.length > 0 && (
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.primary }]} // Botão de Adicionar
                onPress={openCreateDialog}
              >
                <Plus color={theme.primaryForeground} size={20} />
              </TouchableOpacity>
            )}

          </View>

        </View>
        
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <ScrollView keyboardShouldPersistTaps="handled">
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

              <View style={styles.dialogActions}>
                <Botao variant="destructive-outline" onPress={handleCloseDialog} style={styles.dialogButton}>
                  Cancelar
                </Botao>
                <Botao onPress={handleSubmit} disabled={isLoading} style={styles.dialogButton}>
                  {isLoading ? <ActivityIndicator color={theme.primaryForeground} /> : (editingSubject ? 'Salvar' : 'Criar')}
                </Botao>
              </View>
            </View>
          </ScrollView>
        </Dialog>

        {isPageLoading && <ActivityIndicator size="large" color={theme.primary} />}

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
                      <CardHeader style={{ paddingTop: 16, paddingBottom: 16, paddingHorizontal: 16 }}>
                        <View style={styles.cardTitleRow}>
                          <CardTitle style={{ flex: 1, color: textColor, fontSize: 20 }}>
                            {subject.nome}
                          </CardTitle>

                          <TouchableOpacity onPress={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openEditDialog(subject);
                          }}>
                            <Edit color={textColor} size={18} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(subject.id);
                          }}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 60 },
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
  dialogButton: {
    flex: 1, // Torna os botões proporcionais (50%/50%)
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
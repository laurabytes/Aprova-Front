// app/(tabs)/materias/index.jsx
import { Link, useRouter } from 'expo-router';
import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react-native';
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
    setSubjects([]);
    setIsPageLoading(false);
  }, [user]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setShowColorPicker(false);
    setEditingSubject(null);
    setFormData({ nome: '', descricao: '', cor: theme.primary });
  }

  const handleSubmit = async () => {
    // ==============================================================
    // ALTERAÇÃO 2: Adicionada Validação
    // ==============================================================
    if (formData.nome.trim() === '') {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha o nome da matéria.');
      return; // Impede o envio
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
  
  // ==============================================================
  // ALTERAÇÃO 1: Estilos do botão de cor agora usam o 'theme'
  // ==============================================================
  const ColorPreviewSelector = ({ onPress, color }) => (
    <TouchableOpacity 
      // Os estilos agora são inline para acessar o 'theme'
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: theme.border, // <- Corrigido
        borderRadius: 8,
        padding: 8,
        backgroundColor: theme.card, // <- Corrigido
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
        {/* (Header... sem alteração) */}
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

        {/* (Dialog e Formulário... sem alteração no layout) */}
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
                <Botao variant="destructive" onPress={handleCloseDialog}>
                  Cancelar
                </Botao>
                <Botao onPress={handleSubmit} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color={theme.primaryForeground} /> : (editingSubject ? 'Salvar' : 'Criar')}
                </Botao>
              </View>
            </View>
          </ScrollView>
        </Dialog>

        {isPageLoading && <ActivityIndicator size="large" color={theme.primary} />}

        {/* (Estado Vazio... sem alteração) */}
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
                    // ==============================================================
                    // ALTERAÇÃO 3: Passando a descrição como parâmetro
                    // ==============================================================
                    params: {
                      cor: subject.cor.replace('#', ''),
                      nome: subject.nome,
                      descricao: subject.descricao || '' // Passa a descrição
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
                            <Trash2 color={theme.destructive} size={18} />
                          </TouchableOpacity>
                        </View>

                        {/* ==============================================================
                        // ALTERAÇÃO 3: Descrição removida daqui
                        // ============================================================== */}
                        {/* {subject.descricao && (
                          <CardDescription style={{ color: textColor, opacity: 0.8, marginTop: 8 }}>
                            {subject.descricao}
                          </CardDescription>
                        )} */}
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

// ==============================================================
// ALTERAÇÃO 1: Removidos estilos que foram movidos para inline
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
  
  colorPickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    gap: 0,
  },
  
  // Estilos do preview (não dependem do tema, exceto a cor de fundo)
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    // A cor da borda será aplicada inline
  },
  
  // Estilos removidos daqui e movidos para inline:
  // - colorPreviewTouchable
  // - colorValueText
});
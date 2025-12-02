// app/(tabs)/materias/index.jsx
import { Link, useRouter } from 'expo-router';
import {
  BookOpen,
  Edit, // Ícone para a revisão mista
  Layers // Ícone alternativo
  ,
  Plus,
  Shuffle,
  Trash2
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ColorPicker from 'react-native-wheel-color-picker';

// Componentes
import { Botao } from '../../../componentes/Botao';
import { CampoDeTexto } from '../../../componentes/CampoDeTexto';
import { Dialog } from '../../../componentes/Dialog';
import { Textarea } from '../../../componentes/Textarea';

// Contextos e Serviços
import { useAuth } from '../../../contexto/AuthContexto';
import { useSubjects } from '../../../contexto/SubjectContexto';
import { cores } from '../../../tema/cores';

// Header do Mascote
function MascotHeader({ user, theme }) {
  return (
    <View style={styles.mascotSection}>
      <View style={styles.mascotContainer}>
        <View style={[styles.mascotPlaceholder, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
            <BookOpen size={32} color={theme.primary} />
            <Text style={{fontSize: 10, color: theme.primary, fontWeight:'bold', marginTop: 4}}>PROF. TUBARÃO</Text>
        </View>
      </View>

      <View style={[styles.speechBubble, { backgroundColor: theme.card, shadowColor: theme.primary }]}>
        <View style={styles.speechArrow} />
        <Text style={[styles.speechTitle, { color: theme.primary }]}>
          Hora de organizar!
        </Text>
        <Text style={[styles.speechText, { color: theme.mutedForeground }]}>
          Qual matéria vamos dominar hoje, {user?.nome?.split(' ')[0]}? 📚
        </Text>
      </View>
    </View>
  );
}

export default function TelaMaterias() {
  const { user } = useAuth();
  
  const { 
    subjects, 
    isLoading: isContextLoading, 
    addSubject, 
    updateSubject, 
    deleteSubject,
    getFlashcardsBySubject // Necessário para a revisão mista
  } = useSubjects();
  
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', cor: theme.primary });
  const [isSaving, setIsSaving] = useState(false);

  // --- Lógica da Revisão Mista ---
  const handleMixedReview = () => {
    // 1. Coleta todos os flashcards de todas as matérias
    const allFlashcards = subjects.flatMap(subject => {
        const cards = getFlashcardsBySubject(subject.id) || [];
        return cards.map(card => ({
            ...card,
            materiaNome: subject.nome, // Adiciona o nome da matéria para exibir no card
            cor: subject.cor || theme.primary
        }));
    });

    // 2. Valida se existem cards
    if (allFlashcards.length === 0) {
        Alert.alert('Ops!', 'Você precisa criar flashcards dentro das matérias antes de iniciar uma revisão mista.');
        return;
    }

    // 3. Navega enviando o deck completo
    router.push({
        pathname: '/(tabs)/materias/revisao',
        params: { deck: JSON.stringify(allFlashcards) }
    });
  };
  // -------------------------------

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

    setIsSaving(true);

    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao, 
        cor: formData.cor,
        usuarioId: user.id 
      };

      if (editingSubject) {
        await updateSubject({ ...payload, id: editingSubject.id });
      } else {
        await addSubject(payload);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a matéria.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Excluir Matéria', 'Tem certeza que deseja excluir? Isso excluirá todos os flashcards associados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubject(id);
          } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir matéria.');
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

  const ColorPreviewSelector = ({ onPress, color }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12, 
        padding: 12,
        backgroundColor: theme.card,
        height: 50,
      }}
      onPress={onPress}
    >
      <View style={[styles.colorPreview, { backgroundColor: color, borderColor: theme.border }]} />
      <Text style={{ fontSize: 14, color: theme.mutedForeground, fontWeight: '500' }}>
        {color?.toUpperCase() || 'SELECIONAR COR'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. MASCOTE */}
        <MascotHeader user={user} theme={theme} />

        {/* 2. BOTÃO DE REVISÃO MISTA (NOVO) */}
        {subjects.length > 0 && (
            <TouchableOpacity 
                style={[styles.mixedReviewButton, { backgroundColor: theme.card, borderColor: theme.primary }]}
                onPress={handleMixedReview}
                activeOpacity={0.8}
            >
                <View style={[styles.mixedIconBox, { backgroundColor: theme.primary + '20' }]}>
                    <Shuffle size={24} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.mixedTitle, { color: theme.foreground }]}>Revisão Mista</Text>
                    <Text style={[styles.mixedSubtitle, { color: theme.mutedForeground }]}>
                        Misturar todos os cards
                    </Text>
                </View>
                <Layers size={20} color={theme.mutedForeground} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
        )}

        {/* 3. LISTA DE MATÉRIAS */}
        <View style={styles.listHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
                Minhas Matérias ({subjects.length})
            </Text>
        </View>

        {isContextLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : subjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen color={theme.mutedForeground} size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Nenhuma matéria encontrada.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {subjects.map((subject) => {
               const cardColor = subject.cor || theme.primary; 
               
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
                    {/* CARD ESTILIZADO */}
                    <View style={[styles.subjectCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        {/* Faixa de cor lateral */}
                        <View style={[styles.colorStrip, { backgroundColor: cardColor }]} />
                        
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.subjectTitle, { color: theme.foreground }]} numberOfLines={1}>
                                    {subject.nome}
                                </Text>
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); openEditDialog(subject); }} style={styles.actionBtn}>
                                        <Edit size={16} color={theme.mutedForeground} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(subject.id); }} style={styles.actionBtn}>
                                        <Trash2 size={16} color={theme.destructive} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            
                            <Text style={[styles.subjectDesc, { color: theme.mutedForeground }]} numberOfLines={2}>
                                {subject.descricao || 'Sem descrição definida.'}
                            </Text>
                        </View>
                    </View>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
        onPress={openCreateDialog}
        activeOpacity={0.9}
      >
        <Plus size={32} color="#FFF" />
      </TouchableOpacity>

      {/* DIALOGO */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.dialogTitle, { color: theme.foreground }]}>
              {editingSubject ? 'Editar Matéria' : 'Nova Matéria'}
            </Text>
            
            <View style={styles.form}>
              <Text style={[styles.label, { color: theme.foreground }]}>Nome</Text>
              <CampoDeTexto
                value={formData.nome}
                onChangeText={(t) => setFormData({ ...formData, nome: t })}
                placeholder="Ex: Biologia Marinha"
              />
              
              <Text style={[styles.label, { color: theme.foreground }]}>Descrição</Text>
              <Textarea
                value={formData.descricao}
                onChangeText={(t) => setFormData({ ...formData, descricao: t })}
                placeholder="Detalhes sobre a matéria..."
              />

              <Text style={[styles.label, { color: theme.foreground }]}>Cor de Identificação</Text>
              <ColorPreviewSelector
                color={formData.cor}
                onPress={() => setShowColorPicker(prev => !prev)}
              />

              {showColorPicker && (
                <View style={styles.colorPickerContainer}>
                  <ColorPicker
                    color={formData.cor}
                    onColorChange={(color) => setFormData(prev => ({ ...prev, cor: color }))}
                    thumbSize={30}
                    sliderSize={20}
                    noSnap={true}
                    row={false}
                    swatches={false}
                    style={{ height: 200, width: '100%' }}
                  />
                  <Botao onPress={() => setShowColorPicker(false)} style={{ width: '100%', marginTop: 16 }}>
                    Confirmar Cor
                  </Botao>
                </View>
              )}

              <View style={[styles.dialogActions]}>
                <Botao variant="destructive-outline" onPress={handleCloseDialog} style={{ flex: 1 }}>
                  Cancelar
                </Botao>
                <Botao onPress={handleSubmit} disabled={isSaving} style={{ flex: 1 }}>
                  {isSaving ? <ActivityIndicator color="#FFF" /> : (editingSubject ? 'Salvar' : 'Criar')}
                </Botao>
              </View>
            </View>
          </ScrollView>
        </Dialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 100 }, 

  // MASCOTE
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  mascotContainer: {
    marginRight: 16,
  },
  mascotPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  speechTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  speechText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // BOTÃO MISTA (NOVO)
  mixedReviewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 10,
      gap: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
  },
  mixedIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  mixedTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
  },
  mixedSubtitle: {
      fontSize: 13,
  },

  // LISTA
  listHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  grid: { gap: 12 },
  
  // CARD DE MATÉRIA
  subjectCard: {
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: 'row',
      overflow: 'hidden', 
      height: 90,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
  },
  colorStrip: {
      width: 12,
      height: '100%',
  },
  cardContent: {
      flex: 1,
      padding: 14,
      justifyContent: 'center',
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
  },
  subjectTitle: {
      fontSize: 18,
      fontWeight: '700',
      flexShrink: 1,
  },
  subjectDesc: {
      fontSize: 13,
  },
  actionsRow: {
      flexDirection: 'row',
      gap: 12,
  },
  actionBtn: {
      padding: 4,
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    minHeight: 200,
  },
  emptyText: { textAlign: 'center', fontSize: 16 },

  // FAB
  fabButton: {
    position: 'absolute',
    bottom: 24, 
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 10,
  },

  // FORM
  dialogTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: -8 },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  colorPickerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
});
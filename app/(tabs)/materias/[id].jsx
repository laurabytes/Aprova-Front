// app/(tabs)/materias/[id].jsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit, FlipHorizontal, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Botao } from '../../../componentes/Botao';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/Card';
import { Dialog } from '../../../componentes/Dialog';
import { Textarea } from '../../../componentes/Textarea';
import { useSubjects } from '../../../contexto/SubjectContexto'; // NOVO: Importar useSubjects
import { cores } from '../../../tema/cores';

// MOCK_DATA REMOVIDO

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

export default function TelaFlashcards() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // USAR CONTEXTO: Obter funções de flashcard e o array de flashcards
  const { 
    getFlashcardsBySubject, 
    addFlashcard, 
    updateFlashcard, 
    deleteFlashcard 
  } = useSubjects();
  
  const { id: subjectId, cor: corParam, nome: nomeParam, descricao: descricaoParam } = params;
  
  // A lista de flashcards é puxada diretamente do contexto
  const flashcards = getFlashcardsBySubject(subjectId); 

  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const [subject, setSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [formData, setFormData] = useState({ pergunta: '', resposta: '' });
  const [flippedCards, setFlippedCards] = useState(new Set());

  const [subjectColor, setSubjectColor] = useState(theme.card);
  const [textColor, setTextColor] = useState(theme.foreground);

  useEffect(() => {
    // Processamento dos parâmetros (Nome, Cor, Descrição)
    const decodedColor = corParam ? `#${corParam}` : theme.card;
    const decodedName = nomeParam ? nomeParam : 'Matéria';
    const decodedDescription = descricaoParam ? descricaoParam : 'Flashcards para revisão';

    setSubjectColor(decodedColor);
    setTextColor(getTextColorForBackground(decodedColor));
    
    setSubject({ id: subjectId, nome: decodedName, descricao: decodedDescription });

    if (!subjectId) {
         Alert.alert("Erro", "Matéria não encontrada.", [
          { text: 'OK', onPress: () => router.replace('/(tabs)/materias') }
        ]);
    }
  }, [subjectId, corParam, nomeParam, descricaoParam, theme]);

  const handleSubmit = async () => {
    if (formData.pergunta.trim() === '' || formData.resposta.trim() === '') {
        Alert.alert('Erro', 'Pergunta e Resposta são obrigatórios.');
        return;
    }
      
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 300)); 
    try {
      if (editingFlashcard) {
        updateFlashcard(subjectId, { ...editingFlashcard, ...formData });
      } else {
        const newFlashcard = {
          ...formData,
          id: Date.now().toString(), // Usando string ID para consistência
          materiaId: subjectId,
        };
        addFlashcard(subjectId, newFlashcard);
      }
      setIsDialogOpen(false);
      setFormData({ pergunta: '', resposta: '' });
      setEditingFlashcard(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o flashcard.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteCard = async (id) => {
    Alert.alert('Excluir Flashcard', 'Tem certeza que deseja excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteFlashcard(subjectId, id);
        },
      },
    ]);
  };

  const openEditDialog = (flashcard) => {
    setEditingFlashcard(flashcard);
    setFormData({ pergunta: flashcard.pergunta, resposta: flashcard.resposta });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingFlashcard(null);
    setFormData({ pergunta: '', resposta: '' });
    setIsDialogOpen(true);
  };

  const toggleFlip = (id) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isPageLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/materias')}>
            <ArrowLeft color={theme.foreground} size={24} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            
            <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>{subject?.nome}</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              {subject?.descricao || 'Flashcards para revisão'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.primary }]} 
            onPress={openCreateDialog}
          >
            <Plus color={theme.primaryForeground} size={20} />
          </TouchableOpacity>
        </View>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[styles.dialogTitle, { color: theme.foreground }]}>
              {editingFlashcard ? 'Editar Flashcard' : 'Novo Flashcard'}
            </Text>
            <View style={styles.form}>
              <Text style={[styles.label, { color: theme.foreground }]}>Pergunta</Text>
              <Textarea
                value={formData.pergunta}
                onChangeText={(t) => setFormData({ ...formData, pergunta: t })}
                placeholder="Digite a pergunta"
              />
              <Text style={[styles.label, { color: theme.foreground }]}>Resposta</Text>
              <Textarea
                value={formData.resposta}
                onChangeText={(t) => setFormData({ ...formData, resposta: t })}
                placeholder="Digite a resposta"
              />
              <View style={styles.dialogActions}>
                <Botao variant="destructive-outline" onPress={() => setIsDialogOpen(false)} style={{flex: 1}}>
                  Cancelar
                </Botao>
                <Botao onPress={handleSubmit} disabled={isLoading} style={{flex: 1}}>
                  {isLoading ? <ActivityIndicator color={theme.primaryForeground} /> : (editingFlashcard ? 'Salvar' : 'Criar')}
                </Botao>
              </View>
            </View>
          </ScrollView>
        </Dialog>

        {flashcards.length === 0 ? (
           <Card>
            <CardContent style={styles.emptyState}>
              <FlipHorizontal color={theme.mutedForeground} size={48} />
              <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
                Nenhum flashcard cadastrado
              </Text>
              <Botao onPress={openCreateDialog}>
                <Plus size={16} color="#FFF" style={{ marginRight: 8 }} />
                Criar Primeiro Flashcard
              </Botao>
            </CardContent>
          </Card>
        ) : (
          <View style={styles.grid}>
            {flashcards.map((flashcard) => (
              <Card key={flashcard.id} style={[styles.card, { backgroundColor: subjectColor }]}>
                <CardHeader>
                  <View style={styles.cardTitleRow}>
                    <CardTitle style={{ flex: 1, color: textColor }}>
                      {flippedCards.has(flashcard.id) ? 'Resposta' : 'Pergunta'}
                    </CardTitle>
                    <TouchableOpacity onPress={() => openEditDialog(flashcard)}>
                      <Edit color={textColor} size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCard(flashcard.id)}>
                      <Trash2 color={theme.destructive} size={18} />
                    </TouchableOpacity>
                  </View>
                </CardHeader>
                <CardContent style={{ gap: 16 }}>
                  <Text style={[styles.flashcardText, { color: textColor }]}>
                    {flippedCards.has(flashcard.id) ? flashcard.resposta : flashcard.pergunta}
                  </Text>
                  
                  <Botao 
                    variant="outline" 
                    onPress={() => toggleFlip(flashcard.id)}
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderColor: 'transparent',
                    }}
                  >
                    <FlipHorizontal size={16} color={textColor} style={{ marginRight: 8 }} />
                    <Text style={{ color: textColor, fontWeight: '500', fontSize: 14 }}>
                      Virar Card
                    </Text>
                  </Botao>
                </CardContent>
              </Card>
            ))}
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
    alignItems: 'center',
    gap: 16,
  },
  title: { fontSize: 24, fontWeight: '700', flexShrink: 1 },
  subtitle: { fontSize: 14 },
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
  flashcardText: {
    minHeight: 80,
    fontSize: 16,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  dialogTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 20,
  },
});
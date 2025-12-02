// app/(tabs)/materias/[id].jsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Library 
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '../../../componentes/Botao';
import { Dialog } from '../../../componentes/Dialog';
import { Textarea } from '../../../componentes/Textarea';
import { useSubjects } from '../../../contexto/SubjectContexto';
import { cores } from '../../../tema/cores';

// Função auxiliar para cor do texto
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

export default function TelaDetalhesMateria() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const { 
    getFlashcardsBySubject, 
    addFlashcard, 
    updateFlashcard, 
    deleteFlashcard 
  } = useSubjects();
  
  const { id: subjectId, cor: corParam, nome: nomeParam, descricao: descricaoParam } = params;
  
  const flashcards = getFlashcardsBySubject(subjectId); 

  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const [subjectColor, setSubjectColor] = useState(theme.card);
  const [textColor, setTextColor] = useState(theme.foreground);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [formData, setFormData] = useState({ pergunta: '', resposta: '' });
  const [isLoading, setIsLoading] = useState(false);

  // === ESTADOS DO MODO DE ESTUDO ===
  const [isStudying, setIsStudying] = useState(false);
  const [studyQueue, setStudyQueue] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  useEffect(() => {
    const decodedColor = corParam ? `#${corParam}` : theme.primary;
    setSubjectColor(decodedColor);
    setTextColor(getTextColorForBackground(decodedColor));
    setSubjectName(nomeParam || 'Matéria');
    setSubjectDesc(descricaoParam || '');

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
    try {
      if (editingFlashcard) {
        await updateFlashcard(subjectId, { ...editingFlashcard, ...formData });
      } else {
        const newFlashcard = {
          ...formData,
          id: Date.now().toString(),
          materiaId: subjectId,
        };
        await addFlashcard(subjectId, newFlashcard);
      }
      setIsDialogOpen(false);
      setFormData({ pergunta: '', resposta: '' });
      setEditingFlashcard(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o flashcard.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteCard = async (id) => {
    Alert.alert('Excluir Flashcard', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteFlashcard(subjectId, id) },
    ]);
  };

  const openCreateDialog = () => {
    setEditingFlashcard(null);
    setFormData({ pergunta: '', resposta: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (card) => {
    setEditingFlashcard(card);
    setFormData({ pergunta: card.pergunta, resposta: card.resposta });
    setIsDialogOpen(true);
  };

  const startStudySession = () => {
    if (flashcards.length === 0) return;
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setStudyQueue(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, wrong: 0 });
    setIsSessionFinished(false);
    setIsStudying(true);
  };

  const handleCardResponse = (correct) => {
    const currentCard = studyQueue[currentCardIndex];

    if (correct) {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setStudyQueue(prev => [...prev, currentCard]);
    }

    if (currentCardIndex < studyQueue.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev + 1), 200); 
    } else {
      setIsSessionFinished(true);
    }
  };

  const exitStudyMode = () => {
    setIsStudying(false);
    setIsSessionFinished(false);
  };

  // --- RENDERIZADORES ---

  if (isSessionFinished) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <CheckCircle2 size={80} color={theme.primary} style={{marginBottom: 20}} />
        <Text style={[styles.headerTitle, { color: theme.foreground, textAlign: 'center', fontSize: 28 }]}>Sessão Concluída!</Text>
        <Text style={{ color: theme.mutedForeground, textAlign: 'center', marginTop: 10, marginBottom: 40 }}>
          Você revisou {studyQueue.length} cards.
          {'\n'}Acertos de primeira: {flashcards.length - (sessionStats.wrong > 0 ? 1 : 0) } (aprox)
        </Text>
        <Botao onPress={exitStudyMode} style={{ width: '100%' }}>Voltar para a Matéria</Botao>
        <Botao variant="outline" onPress={startStudySession} style={{ width: '100%', marginTop: 12 }}>Revisar Novamente</Botao>
      </SafeAreaView>
    );
  }

  if (isStudying) {
    const activeCard = studyQueue[currentCardIndex];
    const totalInQueue = studyQueue.length;
    const currentNumber = currentCardIndex + 1;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.studyHeader}>
           <TouchableOpacity onPress={exitStudyMode} style={styles.closeButton}>
             <ArrowLeft color={theme.mutedForeground} size={24} />
             <Text style={{color: theme.mutedForeground, fontWeight:'600'}}>Sair</Text>
           </TouchableOpacity>
           <Text style={{color: theme.mutedForeground, fontWeight:'600'}}>
             {currentNumber} / {totalInQueue}
           </Text>
        </View>

        <View style={styles.studyContainer}>
           <TouchableOpacity 
             activeOpacity={0.9} 
             onPress={() => setIsFlipped(!isFlipped)}
             style={[styles.studyCard, { backgroundColor: subjectColor }]}
           >
              <Text style={[styles.studyLabel, { color: textColor + '90' }]}>
                {isFlipped ? 'RESPOSTA' : 'PERGUNTA'}
              </Text>
              <ScrollView contentContainerStyle={styles.centerScroll}>
                <Text style={[styles.studyText, { color: textColor }]}>
                  {isFlipped ? activeCard.resposta : activeCard.pergunta}
                </Text>
              </ScrollView>
              <Text style={[styles.tapHint, { color: textColor + '80' }]}>
                Toque para virar
              </Text>
           </TouchableOpacity>

           {isFlipped && (
             <View style={styles.studyActions}>
               {/* BOTÃO ERRADO (X) */}
               <TouchableOpacity 
                 style={[styles.actionBtnCircle, { borderColor: theme.destructive, backgroundColor: theme.background }]} 
                 onPress={() => handleCardResponse(false)}
               >
                 <XCircle size={40} color={theme.destructive} />
               </TouchableOpacity>

               {/* BOTÃO CERTO (CHECK) */}
               <TouchableOpacity 
                 style={[styles.actionBtnCircle, { borderColor: theme.primary, backgroundColor: theme.background }]} 
                 onPress={() => handleCardResponse(true)}
               >
                 <CheckCircle2 size={40} color={theme.primary} />
               </TouchableOpacity>
             </View>
           )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/materias')} style={styles.backBtn}>
          <ArrowLeft color={theme.foreground} size={24} />
        </TouchableOpacity>
        <View style={{flex: 1}}>
            <Text style={[styles.headerTitle, { color: theme.foreground }]} numberOfLines={1}>{subjectName}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]} numberOfLines={1}>
                {flashcards.length} cards • {subjectDesc || 'Revisão'}
            </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {flashcards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Library color={theme.mutedForeground} size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Nenhum card ainda</Text>
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Crie flashcards para começar a estudar esta matéria.
            </Text>
            <Botao onPress={openCreateDialog} style={{marginTop: 20}}>Criar Primeiro Card</Botao>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
             <TouchableOpacity 
                style={[styles.diveButton, { backgroundColor: subjectColor }]}
                onPress={startStudySession}
                activeOpacity={0.9}
             >
                <View>
                    <Text style={[styles.diveTitle, { color: textColor }]}>Mergulhar</Text>
                    <Text style={[styles.diveSubtitle, { color: textColor + 'CC' }]}>Iniciar sessão de revisão</Text>
                </View>
                <View style={[styles.playIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Play size={24} color={textColor} fill={textColor} />
                </View>
             </TouchableOpacity>

             <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>SEUS FLASHCARDS</Text>

             {flashcards.map((card) => (
               <View key={card.id} style={[styles.flashcardItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.colorStrip, { backgroundColor: subjectColor }]} />
                  <View style={styles.flashcardContent}>
                      <Text style={[styles.cardQuestion, { color: theme.foreground }]} numberOfLines={2}>
                        {card.pergunta}
                      </Text>
                      <Text style={[styles.cardAnswer, { color: theme.mutedForeground }]} numberOfLines={1}>
                        {card.resposta}
                      </Text>
                  </View>
                  <View style={styles.cardActions}>
                      <TouchableOpacity onPress={() => openEditDialog(card)} style={{padding: 8}}>
                          <Edit size={18} color={theme.mutedForeground} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteCard(card.id)} style={{padding: 8}}>
                          <Trash2 size={18} color={theme.destructive} />
                      </TouchableOpacity>
                  </View>
               </View>
             ))}
          </View>
        )}
      </ScrollView>

      {!isStudying && flashcards.length > 0 && (
        <TouchableOpacity
            style={[styles.fabButton, { backgroundColor: theme.primary }]}
            onPress={openCreateDialog}
        >
            <Plus size={32} color="#FFF" />
        </TouchableOpacity>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[styles.dialogTitle, { color: theme.foreground }]}>
              {editingFlashcard ? 'Editar Flashcard' : 'Novo Flashcard'}
            </Text>
            <View style={{ gap: 16 }}>
              <View>
                  <Text style={[styles.label, { color: theme.foreground }]}>Pergunta</Text>
                  <Textarea
                    value={formData.pergunta}
                    onChangeText={(t) => setFormData({ ...formData, pergunta: t })}
                    placeholder="Digite a pergunta..."
                  />
              </View>
              <View>
                  <Text style={[styles.label, { color: theme.foreground }]}>Resposta</Text>
                  <Textarea
                    value={formData.resposta}
                    onChangeText={(t) => setFormData({ ...formData, resposta: t })}
                    placeholder="Digite a resposta..."
                  />
              </View>
              <View style={styles.dialogActions}>
                <Botao variant="destructive-outline" onPress={() => setIsDialogOpen(false)} style={{flex: 1}}>
                  Cancelar
                </Botao>
                <Botao onPress={handleSubmit} disabled={isLoading} style={{flex: 1}}>
                  {isLoading ? <ActivityIndicator color="#FFF" /> : 'Salvar'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSubtitle: { fontSize: 14 },
  listContent: { padding: 20, paddingBottom: 100 },
  sectionLabel: {
      fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 16, marginBottom: 8
  },
  flashcardItem: {
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      overflow: 'hidden',
      height: 80,
      alignItems: 'center',
  },
  colorStrip: { width: 6, height: '100%' },
  flashcardContent: { flex: 1, paddingHorizontal: 12, justifyContent: 'center' },
  cardQuestion: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardAnswer: { fontSize: 13 },
  cardActions: { flexDirection: 'row', marginRight: 8 },
  diveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderRadius: 16,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
  },
  diveTitle: { fontSize: 20, fontWeight: '800' },
  diveSubtitle: { fontSize: 14, fontWeight: '500' },
  playIconContainer: { padding: 10, borderRadius: 25 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { textAlign: 'center', fontSize: 16, marginBottom: 16, paddingHorizontal: 40 },
  studyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
  },
  closeButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  studyContainer: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
  },
  studyCard: {
      width: '100%',
      aspectRatio: 0.8,
      borderRadius: 24,
      padding: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
      marginBottom: 40,
  },
  studyLabel: {
      fontSize: 12, fontWeight: '800', letterSpacing: 2, position: 'absolute', top: 30,
  },
  centerScroll: {
      flexGrow: 1, justifyContent: 'center', alignItems: 'center'
  },
  studyText: {
      fontSize: 24, fontWeight: '600', textAlign: 'center', lineHeight: 34
  },
  tapHint: {
      fontSize: 12, position: 'absolute', bottom: 30,
  },
  studyActions: {
      flexDirection: 'row',
      gap: 40, // Aumentei o espaço entre os botões
      width: '100%',
      justifyContent: 'center',
  },
  actionBtnCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      // Removido o gap, pois não tem mais texto
  },
  fabButton: {
    position: 'absolute', bottom: 24, right: 20,
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  dialogTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  dialogActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
});
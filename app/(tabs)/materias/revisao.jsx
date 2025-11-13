// app/(tabs)/materias/revisao.jsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, FlipHorizontal, RotateCcw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Botao } from '../../../componentes/Botao';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/Card';
import { cores } from '../../../tema/cores';

// Função para calcular a cor do texto (Preto ou Branco)
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

// Função para re-embaralhar
function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export default function TelaRevisaoMista() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  // Recebe o deck serializado dos parâmetros
  const params = useLocalSearchParams();
  const { deck: deckString } = params;

  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para carregar e desserializar o deck
  useEffect(() => {
    if (deckString) {
      try {
        const deck = JSON.parse(deckString);
        setShuffledDeck(deck);
        setCurrentIndex(0);
        setIsFlipped(false);
      } catch (e) {
        console.error("Falha ao carregar deck de revisão:", e);
        Alert.alert("Erro", "Não foi possível carregar os flashcards.", [
          { text: 'OK', onPress: () => router.replace('/(tabs)/materias') }
        ]);
      }
    } else {
       Alert.alert("Erro", "Nenhum flashcard foi selecionado.", [
          { text: 'OK', onPress: () => router.replace('/(tabs)/materias') }
        ]);
    }
    setIsLoading(false);
  }, [deckString, router]); // Depende apenas do deckString

  const handleNextCard = () => {
    if (currentIndex < shuffledDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // O usuário terminou o baralho
      Alert.alert('Fim da Revisão!', 'Você revisou todos os flashcards. Deseja recomeçar?', [
        { text: 'Sair', onPress: () => router.replace('/(tabs)/materias'), style: 'cancel' },
        { text: 'Recomeçar', onPress: handleReset },
      ]);
    }
  };

  const handleReset = () => {
    setIsLoading(true);
    setShuffledDeck(shuffleArray([...shuffledDeck])); // Reembaralha
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  const currentCard = shuffledDeck[currentIndex];
  
  // Define a cor do card E a cor do texto com base no flashcard atual
  const cardColor = currentCard ? currentCard.cor : theme.card;
  const textColor = getTextColorForBackground(cardColor);
  // NOVO: Pega o nome da matéria do flashcard
  const materiaNome = currentCard?.materiaNome || 'Revisão Mista'; 

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.scrollContent}>
        {/* Cabeçalho */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/materias')}>
            <ArrowLeft color={theme.foreground} size={24} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>
              {/* ATUALIZADO: Exibe o nome da matéria */}
              {materiaNome}
            </Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              {shuffledDeck.length > 0 ? `Flashcard ${currentIndex + 1} de ${shuffledDeck.length}` : 'Sem flashcards'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.muted }]} onPress={handleReset} disabled={shuffledDeck.length === 0}>
            <RotateCcw color={theme.foreground} size={20} />
          </TouchableOpacity>
        </View>

        {/* Card de Flashcard */}
        {currentCard ? (
          <Card style={[styles.card, { backgroundColor: cardColor }]}>
            <CardHeader>
              <CardTitle style={{ color: textColor }}>
                {isFlipped ? 'Resposta' : 'Pergunta'}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 24 }}>
              <Text style={[styles.flashcardText, { color: textColor }]}>
                {isFlipped ? currentCard.resposta : currentCard.pergunta}
              </Text>

              <Botao 
                variant="outline" 
                onPress={() => setIsFlipped(!isFlipped)}
                // Estilo customizado para o botão "virar" em fundos coloridos
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
        ) : (
          <Card>
            <CardContent style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Nenhum flashcard encontrado.</Text>
            </CardContent>
          </Card>
        )}

        {/* Botão de Próximo */}
        {currentCard && (
          <Botao onPress={handleNextCard} style={{ marginTop: 'auto' }}>
            {currentIndex === shuffledDeck.length - 1 ? 'Finalizar Sessão' : 'Próximo Card'}
          </Botao>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, flex: 1 }, // flex: 1 para o botão "Próximo" ir para baixo
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: { fontSize: 24, fontWeight: '700', flexShrink: 1 },
  subtitle: { fontSize: 14 },
  headerButton: {
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { 
    width: '100%', 
    flex: 1, 
    maxHeight: 400, // Altura máxima para o card
    justifyContent: 'space-between', // Empurra o conteúdo e o botão "Virar"
    paddingBottom: 24, // Espaçamento inferior
  },
  flashcardText: {
    minHeight: 150,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    paddingTop: 16, 
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
});
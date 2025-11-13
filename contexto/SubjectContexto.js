import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const SubjectContext = createContext(undefined);

const SUBJECTS_KEY = 'app:subjects';
const FLASHCARDS_KEY = 'app:flashcards';

/**
 * Hook customizado para acessar os dados de matérias.
 */
export function useSubjects() {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
}

export function SubjectProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [flashcardsData, setFlashcardsData] = useState({}); // { subjectId: [flashcard, ...] }
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load Data from Storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedSubjects = await AsyncStorage.getItem(SUBJECTS_KEY);
        const storedFlashcards = await AsyncStorage.getItem(FLASHCARDS_KEY);

        if (storedSubjects) {
          setSubjects(JSON.parse(storedSubjects));
        }
        if (storedFlashcards) {
          setFlashcardsData(JSON.parse(storedFlashcards));
        }
      } catch (e) {
        console.error('Falha ao carregar dados de estudo', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Save Subjects to Storage whenever the subjects state changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects)).catch(console.error);
    }
  }, [subjects, isLoading]);

  // 3. Save Flashcards to Storage whenever the flashcardsData state changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(flashcardsData)).catch(console.error);
    }
  }, [flashcardsData, isLoading]);

  // 4. Subject CRUD Operations
  const addSubject = (newSubject) => {
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = (updatedSubject) => {
    setSubjects(prev => 
      prev.map(s => (s.id === updatedSubject.id ? updatedSubject : s))
    );
  };

  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setFlashcardsData(prev => {
        const newFlashcards = { ...prev };
        delete newFlashcards[id]; // Remove todos os flashcards da matéria excluída
        return newFlashcards;
    });
  };

  // 5. Flashcard CRUD Operations
  const getFlashcardsBySubject = (subjectId) => {
    return flashcardsData[subjectId] || [];
  };

  const addFlashcard = (subjectId, newFlashcard) => {
    setFlashcardsData(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), newFlashcard],
    }));
  };

  const updateFlashcard = (subjectId, updatedFlashcard) => {
    setFlashcardsData(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).map(f => 
        f.id === updatedFlashcard.id ? updatedFlashcard : f
      ),
    }));
  };

  const deleteFlashcard = (subjectId, flashcardId) => {
    setFlashcardsData(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).filter(f => f.id !== flashcardId),
    }));
  };
  
  const value = {
    subjects,
    isLoading,
    addSubject,
    updateSubject,
    deleteSubject,
    getFlashcardsBySubject,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
  };

  return (
    <SubjectContext.Provider value={value}>
      {children}
    </SubjectContext.Provider>
  );
}
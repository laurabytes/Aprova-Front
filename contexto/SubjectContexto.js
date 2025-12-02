// contexto/SubjectContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContexto'; 
import MateriaService from '../servicos/MateriaService'; 
import FlashcardService from '../servicos/FlashcardService'; 

const SubjectContext = createContext(undefined);

export function useSubjects() {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
}

export function SubjectProvider({ children }) {
  const { user, isLoading: isAuthLoading } = useAuth(); 
  const [subjects, setSubjects] = useState([]);
  const [flashcardsData, setFlashcardsData] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || isAuthLoading) { 
        setSubjects([]);
        setFlashcardsData({});
        setIsLoading(false); 
        return; 
    }
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // CORREÇÃO CRÍTICA: Passando user.id
        const materias = await MateriaService.listar(user.id);
        
        if (Array.isArray(materias)) {
             setSubjects(materias);
             
             const flashcardsMap = {};
             await Promise.all(materias.map(async (materia) => {
                 try {
                     const cards = await FlashcardService.listarPorMateria(materia.id);
                     flashcardsMap[materia.id] = Array.isArray(cards) ? cards : [];
                 } catch (err) {
                     console.error(`Erro ao carregar flashcards da materia ${materia.id}`, err);
                     flashcardsMap[materia.id] = [];
                 }
             }));
             setFlashcardsData(flashcardsMap);
        }

      } catch (e) {
        console.error('Falha ao carregar dados de estudo:', e); 
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, isAuthLoading]);

  const addSubject = async (newSubject) => {
    try {
        // Garante que o ID do usuário vá no payload
        const payload = { ...newSubject, usuarioId: user.id };
        const savedSubjectPartial = await MateriaService.criar(payload);
        
        const savedSubjectFull = { 
            ...newSubject, 
            ...savedSubjectPartial, 
            id: savedSubjectPartial.id, 
        };

        setSubjects(prev => [...prev, savedSubjectFull]);
    } catch (e) { 
        console.error("Erro ao criar matéria", e); 
        throw e; 
    }
  };

  const updateSubject = async (updatedSubject) => {
    try {
        const payload = { ...updatedSubject, usuarioId: user.id };
        const savedPartial = await MateriaService.atualizar(updatedSubject.id, payload);
        
        const savedFull = {
            ...updatedSubject, 
            ...savedPartial, 
            id: savedPartial.id || updatedSubject.id,
        };

        setSubjects(prev => prev.map(s => (s.id === savedFull.id ? savedFull : s)));
    } catch (e) { 
        console.error("Erro ao atualizar matéria", e); 
        throw e; 
    }
  };

  const deleteSubject = async (id) => {
    try {
        await MateriaService.apagar(id);
        setSubjects(prev => prev.filter(s => s.id !== id));
        setFlashcardsData(prev => {
            const newFlashcards = { ...prev };
            delete newFlashcards[id];
            return newFlashcards;
        });
    } catch (e) { console.error("Erro ao apagar matéria", e); }
  };

  const getFlashcardsBySubject = (subjectId) => {
    return flashcardsData[subjectId] || [];
  };

  const addFlashcard = async (subjectId, newFlashcard) => {
    try {
        const savedCard = await FlashcardService.criar(
            newFlashcard.pergunta, 
            newFlashcard.resposta, 
            subjectId
        );
        
        setFlashcardsData(prev => ({
            ...prev,
            [subjectId]: [...(prev[subjectId] || []), savedCard],
        }));
    } catch (e) { 
        console.error("Erro ao criar flashcard", e); 
        throw e; 
    }
  };

  const updateFlashcard = async (subjectId, updatedFlashcard) => {
      try {
          const saved = await FlashcardService.atualizar(
              updatedFlashcard.id, 
              updatedFlashcard.pergunta, 
              updatedFlashcard.resposta, 
              subjectId
          );

          setFlashcardsData(prev => ({
            ...prev,
            [subjectId]: (prev[subjectId] || []).map(f => f.id === saved.id ? saved : f),
          }));
      } catch(e) { 
          console.error("Erro update flashcard", e);
          throw e; 
      }
  };

  const deleteFlashcard = async (subjectId, flashcardId) => {
     try {
         await FlashcardService.apagar(flashcardId);
         setFlashcardsData(prev => ({
            ...prev,
            [subjectId]: (prev[subjectId] || []).filter(f => f.id !== flashcardId),
         }));
     } catch (e) { 
         console.error("Erro delete flashcard", e);
     }
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
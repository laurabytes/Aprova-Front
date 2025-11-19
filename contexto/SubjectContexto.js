// laurabytes/aprova-front/Aprova-Front-a2673b7d96b43f3032686fb9ef44966c6caebbb4/contexto/SubjectContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import MateriaService from '../servicos/MateriaService'; // 👈 Importa o novo serviço
import FlashcardService from '../servicos/FlashcardService'; // 👈 Importa o novo serviço

const SubjectContext = createContext(undefined);

export function useSubjects() {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
}

export function SubjectProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [flashcardsData, setFlashcardsData] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);

  // 1. Carregar Dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        
        // A. Busca as Matérias
        const materias = await MateriaService.listar();
        
        if (Array.isArray(materias)) {
             setSubjects(materias);
             
             // B. Busca Flashcards para cada matéria
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
        console.error('Falha ao carregar dados de estudo da API', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- MATÉRIAS (CRUD) ---

  const addSubject = async (newSubject) => {
    try {
        // 🚀 Chamada simplificada ao Service
        const savedSubject = await MateriaService.criar(newSubject.nome);
        setSubjects(prev => [...prev, savedSubject]);
    } catch (e) { console.error("Erro ao criar matéria", e); }
  };

  const updateSubject = async (updatedSubject) => {
    try {
        // 🚀 Chamada simplificada ao Service
        const saved = await MateriaService.atualizar(updatedSubject.id, updatedSubject.nome);
        setSubjects(prev => prev.map(s => (s.id === saved.id ? saved : s)));
    } catch (e) { console.error("Erro ao atualizar matéria", e); }
  };

  const deleteSubject = async (id) => {
    try {
        // 🚀 Chamada simplificada ao Service
        await MateriaService.apagar(id);
        
        setSubjects(prev => prev.filter(s => s.id !== id));
        setFlashcardsData(prev => {
            const newFlashcards = { ...prev };
            delete newFlashcards[id];
            return newFlashcards;
        });
    } catch (e) { console.error("Erro ao apagar matéria", e); }
  };

  // --- FLASHCARDS (CRUD) ---

  const getFlashcardsBySubject = (subjectId) => {
    return flashcardsData[subjectId] || [];
  };

  const addFlashcard = async (subjectId, newFlashcard) => {
    try {
        // 🚀 Chamada simplificada ao Service
        const savedCard = await FlashcardService.criar(
            newFlashcard.pergunta, 
            newFlashcard.resposta, 
            subjectId
        );
        
        setFlashcardsData(prev => ({
            ...prev,
            [subjectId]: [...(prev[subjectId] || []), savedCard],
        }));
    } catch (e) { console.error("Erro ao criar flashcard", e); }
  };

  const updateFlashcard = async (subjectId, updatedFlashcard) => {
      try {
          // 🚀 Chamada simplificada ao Service
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
      } catch(e) { console.error("Erro update flashcard", e); }
  };

  const deleteFlashcard = async (subjectId, flashcardId) => {
     try {
         // 🚀 Chamada simplificada ao Service
         await FlashcardService.apagar(flashcardId);
         
         setFlashcardsData(prev => ({
            ...prev,
            [subjectId]: (prev[subjectId] || []).filter(f => f.id !== flashcardId),
         }));
     } catch (e) { console.error("Erro delete flashcard", e); }
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
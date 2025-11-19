// laurabytes/aprova-front/Aprova-Front-9e5fd88febe483dcb9d8589e063cb1ddd4a74884/contexto/SubjectContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const SubjectContext = createContext(undefined);

export function useSubjects() {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
}

// 👇 SUBSTITUA PELO SEU IP! (Porta 8409)
const API_BASE_URL = 'http://SEU_IP_AQUI:8409/api'; 

export function SubjectProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [flashcardsData, setFlashcardsData] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para pegar o Token
  const getAuthHeaders = async () => {
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // 1. Carregar Dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        const headers = await getAuthHeaders();
        
        // A. Busca as Matérias
        const resMat = await fetch(`${API_BASE_URL}/materias/listar`, { headers });
        const materias = await resMat.json();
        
        // Atualiza estado de matérias (garantindo que é um array)
        if (Array.isArray(materias)) {
             setSubjects(materias);
             
             // B. Busca Flashcards para cada matéria
             // Isso mantém a estrutura { idMateria: [cards] } que seu front usa
             const flashcardsMap = {};
             
             await Promise.all(materias.map(async (materia) => {
                 try {
                     const resFlash = await fetch(`${API_BASE_URL}/flashcards/listar/materia/${materia.id}`, { headers });
                     const cards = await resFlash.json();
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
        const headers = await getAuthHeaders();
        // POST /api/materias/criar
        const response = await fetch(`${API_BASE_URL}/materias/criar`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ nome: newSubject.nome }) // O backend espera um DTO
        });
        if (response.ok) {
            const savedSubject = await response.json();
            setSubjects(prev => [...prev, savedSubject]);
        }
    } catch (e) { console.error("Erro ao criar matéria", e); }
  };

  const updateSubject = async (updatedSubject) => {
    try {
        const headers = await getAuthHeaders();
        // PUT /api/materias/atualizar/{id}
        const response = await fetch(`${API_BASE_URL}/materias/atualizar/${updatedSubject.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ nome: updatedSubject.nome })
        });
        if (response.ok) {
            const saved = await response.json();
            setSubjects(prev => prev.map(s => (s.id === saved.id ? saved : s)));
        }
    } catch (e) { console.error("Erro ao atualizar matéria", e); }
  };

  const deleteSubject = async (id) => {
    try {
        const headers = await getAuthHeaders();
        // DELETE /api/materias/apagar/{id}
        await fetch(`${API_BASE_URL}/materias/apagar/${id}`, { method: 'DELETE', headers });
        
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
        const headers = await getAuthHeaders();
        // POST /api/flashcards/criar
        // O DTO requer: pergunta, resposta, e materiaId
        const payload = {
            pergunta: newFlashcard.pergunta,
            resposta: newFlashcard.resposta,
            materiaId: subjectId 
        };

        const response = await fetch(`${API_BASE_URL}/flashcards/criar`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const savedCard = await response.json();
            setFlashcardsData(prev => ({
                ...prev,
                [subjectId]: [...(prev[subjectId] || []), savedCard],
            }));
        }
    } catch (e) { console.error("Erro ao criar flashcard", e); }
  };

  const updateFlashcard = async (subjectId, updatedFlashcard) => {
      // Implementação similar usando PUT /api/flashcards/atualizar/{id}
      // Você pode implementar se necessário, seguindo a lógica acima
      try {
          const headers = await getAuthHeaders();
          const payload = {
              pergunta: updatedFlashcard.pergunta,
              resposta: updatedFlashcard.resposta,
              materiaId: subjectId
          };
           const response = await fetch(`${API_BASE_URL}/flashcards/atualizar/${updatedFlashcard.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify(payload)
          });
          if(response.ok){
              const saved = await response.json();
              setFlashcardsData(prev => ({
                ...prev,
                [subjectId]: (prev[subjectId] || []).map(f => f.id === saved.id ? saved : f),
              }));
          }
      } catch(e) { console.error("Erro update flashcard", e); }
  };

  const deleteFlashcard = async (subjectId, flashcardId) => {
     try {
         const headers = await getAuthHeaders();
         // DELETE /api/flashcards/apagar/{id}
         await fetch(`${API_BASE_URL}/flashcards/apagar/${flashcardId}`, { method: 'DELETE', headers });
         
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
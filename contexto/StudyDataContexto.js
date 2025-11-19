// laurabytes/aprova-front/Aprova-Front-9e5fd88febe483dcb9d8589e063cb1ddd4a74884/contexto/StudyDataContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const StudyDataContext = createContext(undefined);

const FOCUS_KEY = 'app:studyFocus';

export function useStudyData() {
  const context = useContext(StudyDataContext);
  if (context === undefined) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
}

// 👇 SUBSTITUA PELO SEU IP! (Porta 8409)
const API_BASE_URL = 'http://SEU_IP_AQUI:8409/api';

const getDailyStudyMinutes = (sessions) => {
    const dailyData = {};
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Backend retorna dataInicio. O JS converte string para Date.
    sessions.filter(s => s.tipo === 'TRABALHO').forEach(session => {
      const date = new Date(session.dataInicio);
      const dayName = days[date.getDay()];
      dailyData[dayName] = (dailyData[dayName] || 0) + session.duracao; // duracao em minutos
    });
    
    return days.map(day => ({ dia: day, valor: dailyData[day] || 0 }));
};

export function StudyDataProvider({ children }) {
  const [foco, setFoco] = useState('');
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper de Headers
  const getAuthHeaders = async () => {
    const user = await AsyncStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // 1. CARREGAMENTO (API + AsyncStorage para Foco)
  useEffect(() => {
    const loadData = async () => {
        try {
            const headers = await getAuthHeaders();

            // Foco (Local)
            const storedFocus = await AsyncStorage.getItem(FOCUS_KEY);
            if (storedFocus) setFoco(storedFocus);

            // Metas (API)
            const resMetas = await fetch(`${API_BASE_URL}/metas/listar`, { headers });
            if(resMetas.ok) setGoals(await resMetas.json());

            // Sessões Pomodoro (API)
            const resSess = await fetch(`${API_BASE_URL}/sessoes-estudo/listar`, { headers });
            if(resSess.ok) setSessions(await resSess.json());

        } catch (e) { 
            console.error('Falha ao carregar dados (Metas/Sessões)', e); 
        } finally { 
            setIsLoading(false); 
        }
    };
    loadData();
  }, []);

  // Salvar Foco (Local - Mantido)
  useEffect(() => {
    if (!isLoading) AsyncStorage.setItem(FOCUS_KEY, foco).catch(console.error);
  }, [foco, isLoading]);

  // --- AÇÕES DE FOCO (Local) ---
  const updateFoco = (newFoco) => setFoco(newFoco);

  // --- AÇÕES DE METAS (API) ---
  const addGoal = async (newGoal) => {
    try {
        const headers = await getAuthHeaders();
        // POST /api/metas/criar
        // DTO: { descricao, status: "EM_ANDAMENTO", ... }
        const payload = {
            descricao: newGoal.descricao, // Ajuste para o nome do campo no seu Java
            status: newGoal.status || 'EM_ANDAMENTO',
            progresso: newGoal.progresso || 0
        };
        
        const response = await fetch(`${API_BASE_URL}/metas/criar`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        
        if(response.ok) {
            const saved = await response.json();
            setGoals(prev => [...prev, saved]);
        }
    } catch (e) { console.error("Erro ao criar meta", e); }
  };
  
  const updateGoal = async (updatedGoal) => {
    // Atualizar texto da meta
    // PUT /api/metas/atualizar/{id}
    // ... Implementar se seu app permitir editar texto da meta
  };
  
  const deleteGoal = async (id) => {
      try {
          const headers = await getAuthHeaders();
          // DELETE /api/metas/apagar/{id}
          await fetch(`${API_BASE_URL}/metas/apagar/${id}`, { method: 'DELETE', headers });
          setGoals(prev => prev.filter(g => g.id !== id));
      } catch (e) { console.error("Erro ao apagar meta", e); }
  };
  
  const toggleGoalStatus = async (goal) => {
    try {
        const newStatus = goal.status === 'CONCLUIDO' ? 'EM_ANDAMENTO' : 'CONCLUIDO';
        const newProgress = newStatus === 'CONCLUIDO' ? 100 : 0;
        const headers = await getAuthHeaders();

        // PUT /api/metas/atualizar/{id}
        const payload = { ...goal, status: newStatus, progresso: newProgress };
        
        const response = await fetch(`${API_BASE_URL}/metas/atualizar/${goal.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const saved = await response.json();
            setGoals(prev => prev.map(g => (g.id === goal.id ? saved : g)));
        }
    } catch(e) { console.error("Erro toggle status meta", e); }
  }

  // --- AÇÕES DE POMODORO (API) ---
  const addSession = async (newSession) => {
    try {
        const headers = await getAuthHeaders();
        // POST /api/sessoes-estudo/criar
        // DTO espera: dataInicio, duracao, tipo, etc.
        const payload = {
            dataInicio: newSession.dataInicio, // Certifique-se de enviar ISO String
            duracao: newSession.duracao,
            tipo: newSession.tipo, // 'TRABALHO' ou 'PAUSA'
            // Se precisar de materiaId, adicione aqui
        };
        
        const response = await fetch(`${API_BASE_URL}/sessoes-estudo/criar`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const saved = await response.json();
            setSessions(prev => [saved, ...prev]); // Adiciona no topo
        }
    } catch (e) { console.error("Erro ao salvar sessão", e); }
  };
  
  const getDailyStudyMinutesData = () => getDailyStudyMinutes(sessions);

  const value = {
    isLoading,
    foco,
    updateFoco,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    sessions,
    addSession,
    getDailyStudyMinutesData,
  };

  return (
    <StudyDataContext.Provider value={value}>
      {children}
    </StudyDataContext.Provider>
  );
}
// laurabytes/aprova-front/Aprova-Front-a2673b7d96b43f3032686fb9ef44966c6caebbb4/contexto/StudyDataContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../servicos/api'; // 👈 Importando a instância Axios

const StudyDataContext = createContext(undefined);

const FOCUS_KEY = 'app:studyFocus';

export function useStudyData() {
  const context = useContext(StudyDataContext);
  if (context === undefined) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
}

const getDailyStudyMinutes = (sessions) => {
    const dailyData = {};
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    sessions.filter(s => s.tipo === 'TRABALHO').forEach(session => {
      const date = new Date(session.dataInicio);
      const dayName = days[date.getDay()];
      dailyData[dayName] = (dailyData[dayName] || 0) + session.duracao;
    });
    
    return days.map(day => ({ dia: day, valor: dailyData[day] || 0 }));
};

export function StudyDataProvider({ children }) {
  const [foco, setFoco] = useState('');
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARREGAMENTO (API + AsyncStorage para Foco)
  useEffect(() => {
    const loadData = async () => {
        try {
            // Foco (Local)
            const storedFocus = await AsyncStorage.getItem(FOCUS_KEY);
            if (storedFocus) setFoco(storedFocus);

            // Metas (API) (GET /metas/listar)
            const resMetas = await api.get('/metas/listar');
            setGoals(resMetas.data);

            // Sessões Pomodoro (API) (GET /sessoes-estudo/listar)
            const resSess = await api.get('/sessoes-estudo/listar');
            setSessions(resSess.data);

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
        // POST /metas/criar
        const payload = {
            descricao: newGoal.descricao, 
            status: newGoal.status || 'EM_ANDAMENTO',
            progresso: newGoal.progresso || 0
        };
        
        const response = await api.post('/metas/criar', payload);
        const saved = response.data;
        setGoals(prev => [...prev, saved]);
        
    } catch (e) { console.error("Erro ao criar meta", e); }
  };
  
  const updateGoal = async (updatedGoal) => {
    // PUT /metas/atualizar/{id}
    try {
        const payload = { ...updatedGoal }; // Envie o objeto completo
        const response = await api.put(`/metas/atualizar/${updatedGoal.id}`, payload);
        const saved = response.data;
        setGoals(prev => prev.map(g => (g.id === saved.id ? saved : g)));
    } catch(e) { console.error("Erro ao atualizar meta", e); }
  };
  
  const deleteGoal = async (id) => {
      try {
          // DELETE /metas/apagar/{id}
          await api.delete(`/metas/apagar/${id}`);
          setGoals(prev => prev.filter(g => g.id !== id));
      } catch (e) { console.error("Erro ao apagar meta", e); }
  };
  
  const toggleGoalStatus = async (goal) => {
    try {
        const newStatus = goal.status === 'CONCLUIDO' ? 'EM_ANDAMENTO' : 'CONCLUIDO';
        const newProgress = newStatus === 'CONCLUIDO' ? 100 : 0;

        // PUT /metas/atualizar/{id}
        const payload = { ...goal, status: newStatus, progresso: newProgress };
        
        const response = await api.put(`/metas/atualizar/${goal.id}`, payload);
        const saved = response.data;
        setGoals(prev => prev.map(g => (g.id === goal.id ? saved : g)));
        
    } catch(e) { console.error("Erro toggle status meta", e); }
  }

  // --- AÇÕES DE POMODORO (API) ---
  const addSession = async (newSession) => {
    try {
        // POST /sessoes-estudo/criar
        const payload = {
            dataInicio: newSession.dataInicio, 
            duracao: newSession.duracao,
            tipo: newSession.tipo, 
        };
        
        const response = await api.post('/sessoes-estudo/criar', payload);
        const saved = response.data;
        setSessions(prev => [saved, ...prev]); 
        
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
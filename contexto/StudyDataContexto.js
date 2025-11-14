import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const StudyDataContext = createContext(undefined);

const FOCUS_KEY = 'app:studyFocus';
const GOALS_KEY = 'app:goals';
const SESSIONS_KEY = 'app:pomodoroSessions';

/**
 * Hook customizado para acessar os dados de estudo (Foco, Metas e Pomodoro).
 */
export function useStudyData() {
  const context = useContext(StudyDataContext);
  if (context === undefined) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
}

// ==============================================================
// LÓGICA DO POMODORO (para o gráfico)
// ==============================================================
const getDailyStudyMinutes = (sessions) => {
    const dailyData = {};
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Filtra apenas sessões de 'TRABALHO' e soma a duração
    sessions.filter(s => s.tipo === 'TRABALHO').forEach(session => {
      const date = new Date(session.dataInicio);
      const dayName = days[date.getDay()];
      dailyData[dayName] = (dailyData[dayName] || 0) + session.duracao;
    });
    
    // Retorna os dados ordenados pela semana
    return days.map(day => ({ dia: day, valor: dailyData[day] || 0 }));
};

export function StudyDataProvider({ children }) {
  // Estado para Foco
  const [foco, setFoco] = useState('');
  const [isFocusLoading, setIsFocusLoading] = useState(true);
  
  // Estado para Metas
  const [goals, setGoals] = useState([]);
  const [isGoalsLoading, setIsGoalsLoading] = useState(true);

  // Estado para Pomodoro
  const [sessions, setSessions] = useState([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  
  const isLoading = isFocusLoading || isGoalsLoading || isSessionsLoading;

  // -----------------------
  // 1. CARREGAMENTO INICIAL
  // -----------------------
  useEffect(() => {
    const loadData = async () => {
        // Foco
        try {
            const storedFocus = await AsyncStorage.getItem(FOCUS_KEY);
            if (storedFocus !== null) setFoco(storedFocus);
        } catch (e) { console.error('Falha ao carregar foco', e); }
        finally { setIsFocusLoading(false); }

        // Metas
        try {
            const storedGoals = await AsyncStorage.getItem(GOALS_KEY);
            if (storedGoals) setGoals(JSON.parse(storedGoals));
        } catch (e) { console.error('Falha ao carregar metas', e); }
        finally { setIsGoalsLoading(false); }

        // Pomodoro
        try {
            const storedSessions = await AsyncStorage.getItem(SESSIONS_KEY);
            if (storedSessions) setSessions(JSON.parse(storedSessions));
        } catch (e) { console.error('Falha ao carregar sessões', e); }
        finally { setIsSessionsLoading(false); }
    };
    loadData();
  }, []);

  // -----------------------
  // 2. SALVAR NO STORAGE
  // -----------------------
  useEffect(() => {
    if (!isFocusLoading) {
      AsyncStorage.setItem(FOCUS_KEY, foco).catch(console.error);
    }
  }, [foco, isFocusLoading]);

  useEffect(() => {
    if (!isGoalsLoading) {
      AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals)).catch(console.error);
    }
  }, [goals, isGoalsLoading]);

  useEffect(() => {
    if (!isSessionsLoading) {
      AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)).catch(console.error);
    }
  }, [sessions, isSessionsLoading]);
  
  // -----------------------
  // 3. FUNÇÕES CRUD/AÇÕES
  // -----------------------
  
  // Ações de Foco
  const updateFoco = (newFoco) => setFoco(newFoco);

  // Ações de Metas
  const addGoal = (newGoal) => setGoals(prev => [...prev, { ...newGoal, id: Date.now().toString() }]);
  
  const updateGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => (g.id === updatedGoal.id ? updatedGoal : g)));
  };
  
  const deleteGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id));
  
  const toggleGoalStatus = (goal) => {
    const newStatus = goal.status === 'CONCLUIDO' ? 'EM_ANDAMENTO' : 'CONCLUIDO';
    const newProgress = newStatus === 'CONCLUIDO' ? 100 : 0;
    setGoals(prev => 
      prev.map(g => (g.id === goal.id ? { ...g, status: newStatus, progresso: newProgress } : g))
    );
  }

  // Ações de Pomodoro
  const addSession = (newSession) => {
    // Adiciona o ID no contexto
    setSessions(prev => [{ ...newSession, id: Date.now().toString() }, ...prev]);
  };
  
  const getDailyStudyMinutesData = () => getDailyStudyMinutes(sessions);


  const value = {
    isLoading,
    // Foco
    foco,
    updateFoco,
    // Metas
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    // Pomodoro
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
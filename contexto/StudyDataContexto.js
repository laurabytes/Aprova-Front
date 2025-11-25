import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContexto'; // ADICIONADO
import MetasService from '../servicos/MetasService'; 
import SessaoEstudoService from '../servicos/SessaoEstudoService'; 

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
  const { user, isLoading: isAuthLoading } = useAuth(); // ADICIONADO
  const [foco, setFoco] = useState('');
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARREGAMENTO (API + AsyncStorage para Foco) - AGORA DEPENDE DO USER
  useEffect(() => {
    // CORRIGIDO: Só carrega se user existir e autenticação não estiver em loading
    if (!user || isAuthLoading) { 
        setFoco('');
        setGoals([]);
        setSessions([]);
        setIsLoading(false); 
        return;
    }
      
    const loadData = async () => {
        try {
            setIsLoading(true); // Reinicia o loading quando o user muda para autenticado
            
            // Foco (Local) 
            const storedFocus = await AsyncStorage.getItem(FOCUS_KEY);
            if (storedFocus) setFoco(storedFocus);

            // Metas (API)
            const metas = await MetasService.listar();
            setGoals(metas);

            // Sessões Pomodoro (API)
            const sessoes = await SessaoEstudoService.listar();
            setSessions(sessoes);

        } catch (e) { 
            console.error('Falha ao carregar dados (Metas/Sessões) [AxiosError: Request failed with status code 403]', e); 
        } finally { 
            setIsLoading(false); 
        }
    };
    loadData();
  }, [user, isAuthLoading]); // DEPENDÊNCIAS CORRIGIDAS

  // Salvar Foco (Local - Mantido)
  useEffect(() => {
    // Se o user estiver logado e não estiver carregando, salva o foco
    if (user && !isLoading) AsyncStorage.setItem(FOCUS_KEY, foco).catch(console.error);
  }, [foco, isLoading, user]); // DEPENDÊNCIA USER ADICIONADA

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
        
        // 🚀 Chamada simplificada ao Service
        const saved = await MetasService.criar(payload);
        setGoals(prev => [...prev, saved]);
        
    } catch (e) { console.error("Erro ao criar meta", e); }
  };
  
  const updateGoal = async (updatedGoal) => {
    try {
        const payload = { ...updatedGoal };
        // 🚀 Chamada simplificada ao Service
        const saved = await MetasService.atualizar(updatedGoal.id, payload);
        setGoals(prev => prev.map(g => (g.id === saved.id ? saved : g)));
    } catch(e) { console.error("Erro ao atualizar meta", e); }
  };
  
  const deleteGoal = async (id) => {
      try {
          // 🚀 Chamada simplificada ao Service
          await MetasService.apagar(id);
          setGoals(prev => prev.filter(g => g.id !== id));
      } catch (e) { console.error("Erro ao apagar meta", e); }
  };
  
  const toggleGoalStatus = async (goal) => {
    try {
        const newStatus = goal.status === 'CONCLUIDO' ? 'EM_ANDAMENTO' : 'CONCLUIDO';
        const newProgress = newStatus === 'CONCLUIDO' ? 100 : 0;

        // PUT /metas/atualizar/{id}
        const payload = { ...goal, status: newStatus, progresso: newProgress };
        
        // 🚀 Chamada simplificada ao Service
        const saved = await MetasService.atualizar(goal.id, payload);
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
        
        // 🚀 Chamada simplificada ao Service
        const saved = await SessaoEstudoService.criar(payload);
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
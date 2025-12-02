// contexto/StudyDataContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContexto'; 
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
  const { user, isLoading: isAuthLoading } = useAuth();
  const [foco, setFoco] = useState('');
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || isAuthLoading) { 
        setFoco('');
        setGoals([]);
        setSessions([]);
        setIsLoading(false); 
        return;
    }
      
    const loadData = async () => {
        try {
            setIsLoading(true);
            
            const storedFocus = await AsyncStorage.getItem(FOCUS_KEY);
            if (storedFocus) setFoco(storedFocus);

            // CORREÇÃO CRÍTICA: Passando user.id
            const metas = await MetasService.listar(user.id);
            
            const metasFormatadas = metas.map(m => ({
                ...m,
                id: m.id || m.metasId 
            }));
            setGoals(metasFormatadas);

            // CORREÇÃO CRÍTICA: Passando user.id
            const sessoes = await SessaoEstudoService.listar(user.id);
            setSessions(sessoes || []);

        } catch (e) { 
            console.error('Falha ao carregar dados de estudo', e); 
        } finally { 
            setIsLoading(false); 
        }
    };
    loadData();
  }, [user, isAuthLoading]);

  useEffect(() => {
    if (user && !isLoading) AsyncStorage.setItem(FOCUS_KEY, foco).catch(console.error);
  }, [foco, isLoading, user]);

  const updateFoco = (newFoco) => setFoco(newFoco);

  const addGoal = async (newGoal) => {
    try {
        const payload = {
            nome: newGoal.nome || newGoal.titulo, 
            data: newGoal.data, 
            usuarioId: user.id, // Garante envio do ID
            status: 0, 
        };
        
        const saved = await MetasService.criar(payload);

        const savedGoalWithId = {
            ...saved,
            id: saved.id || saved.metasId,
            progresso: 0
        };

        setGoals(prev => [...prev, savedGoalWithId]);
    } catch (e) { console.error("Erro ao criar meta", e); }
  };
  
  const updateGoal = async (updatedGoal) => {
    try {
        const payload = { ...updatedGoal, usuarioId: user.id };
        const idParaAtualizar = updatedGoal.id || updatedGoal.metasId;

        const saved = await MetasService.atualizar(idParaAtualizar, payload);
        
        setGoals(prev => prev.map(g => {
            const currentId = g.id || g.metasId;
            return currentId === idParaAtualizar ? { ...saved, id: currentId } : g;
        }));
    } catch(e) { console.error("Erro ao atualizar meta", e); }
  };
  
  const deleteGoal = async (id) => {
      try {
          await MetasService.apagar(id);
          setGoals(prev => prev.filter(g => (g.id !== id && g.metasId !== id)));
      } catch (e) { console.error("Erro ao apagar meta", e); }
  };
  
  const toggleGoalStatus = async (goal) => {
    try {
        const currentStatus = (goal.status === 1 || goal.status === 'CONCLUIDO') ? 1 : 0;
        const newStatus = currentStatus === 1 ? 0 : 1;
        const newProgress = newStatus === 1 ? 100 : 0;

        const idParaAtualizar = goal.id || goal.metasId;

        const payload = { 
            ...goal, 
            status: newStatus, 
            data: goal.data || goal.dataInicio, 
            nome: goal.nome || goal.titulo,
            progresso: newProgress,
            usuarioId: user.id
        };
        
        const saved = await MetasService.atualizar(idParaAtualizar, payload);
        
        setGoals(prev => prev.map(g => {
             const gId = g.id || g.metasId;
             return gId === idParaAtualizar ? { ...saved, id: gId, status: newStatus, progresso: newProgress } : g;
        }));
        
    } catch(e) { console.error("Erro toggle status meta", e); }
  }

  const addSession = async (newSession) => {
    try {
        const payload = {
            dataInicio: newSession.dataInicio, 
            duracao: newSession.duracao,
            tipo: newSession.tipo, 
            usuarioId: user.id // Adicionar se o backend precisar no futuro
        };
        
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
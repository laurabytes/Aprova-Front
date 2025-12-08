// contexto/StudyDataContexto.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContexto'; 
import MetasService from '../servicos/MetasService'; 
import SessaoEstudoService from '../servicos/SessaoEstudoService'; 

const StudyDataContext = createContext(undefined);

// A chave fixa foi removida para evitar o compartilhamento de dados entre usuários
// const FOCUS_KEY = 'app:studyFocus'; 

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

  // 1. Efeito para CARREGAR os dados quando o usuário muda
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
            
            // --- CORREÇÃO AQUI ---
            // Usa o ID do usuário para criar uma chave única no AsyncStorage
            const userFocusKey = `app:studyFocus:${user.id}`;
            const storedFocus = await AsyncStorage.getItem(userFocusKey);
            
            if (storedFocus) {
                setFoco(storedFocus);
            } else {
                setFoco(''); // Limpa o foco se não houver nada salvo para este usuário específico
            }
            // ---------------------

            // Carrega metas do usuário
            const metas = await MetasService.listar(user.id);
            const metasFormatadas = metas.map(m => ({
                ...m,
                id: m.id || m.metasId 
            }));
            setGoals(metasFormatadas);

            // Carrega sessões de estudo do usuário
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

  // 2. Efeito para SALVAR o foco sempre que ele mudar
  useEffect(() => {
    // Só salva se tiver um usuário válido e não estiver carregando
    if (user && user.id && !isLoading) {
        const userFocusKey = `app:studyFocus:${user.id}`;
        AsyncStorage.setItem(userFocusKey, foco).catch(console.error);
    }
  }, [foco, isLoading, user]);

  const updateFoco = (newFoco) => setFoco(newFoco);

  const addGoal = async (newGoal) => {
    try {
        const payload = {
            nome: newGoal.nome || newGoal.titulo, 
            data: newGoal.data, 
            usuarioId: user.id, 
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
            usuarioId: user.id 
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
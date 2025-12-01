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

  // 1. CARREGAMENTO
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
            
            // Foco (Local) 
            const storedFocus = await AsyncStorage.getItem(FOCUS_KEY);
            if (storedFocus) setFoco(storedFocus);

            // Metas (API)
            const metas = await MetasService.listar();
            
            // CORREÇÃO CRÍTICA: Mapeia metasId para id se necessário para o frontend não quebrar
            const metasFormatadas = metas.map(m => ({
                ...m,
                id: m.id || m.metasId // Garante que 'id' exista
            }));
            setGoals(metasFormatadas);

            // Sessões Pomodoro (API)
            const sessoes = await SessaoEstudoService.listar();
            setSessions(sessoes);

        } catch (e) { 
            console.error('Falha ao carregar dados', e); 
        } finally { 
            setIsLoading(false); 
        }
    };
    loadData();
  }, [user, isAuthLoading]);

  // Salvar Foco (Local)
  useEffect(() => {
    if (user && !isLoading) AsyncStorage.setItem(FOCUS_KEY, foco).catch(console.error);
  }, [foco, isLoading, user]);

  // --- AÇÕES DE FOCO (Local) ---
  const updateFoco = (newFoco) => setFoco(newFoco);

  // --- AÇÕES DE METAS (API) ---
  const addGoal = async (newGoal) => {
    try {
        // CORREÇÃO: Payload ajustado para o Backend Java
        // Backend espera: nome, data, status (int), usuarioId
        const payload = {
            nome: newGoal.nome || newGoal.titulo, // Garante que envia 'nome'
            data: newGoal.data, 
            usuarioId: newGoal.usuarioId,
            status: 0, // CORREÇÃO: Envia Integer 0 (Em andamento)
            // progresso: backend ignora no create, mas o front usa localmente
        };
        
        const saved = await MetasService.criar(payload);

        // Ao salvar no estado local, garantimos que o ID está correto
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
        // Passa o objeto direto, assumindo que já vem com status inteiro do front
        const payload = { ...updatedGoal };
        
        // Garante que usamos o ID correto para a URL
        const idParaAtualizar = updatedGoal.id || updatedGoal.metasId;

        const saved = await MetasService.atualizar(idParaAtualizar, payload);
        
        // Atualiza a lista local
        setGoals(prev => prev.map(g => {
            const currentId = g.id || g.metasId;
            return currentId === idParaAtualizar ? { ...saved, id: currentId } : g;
        }));
    } catch(e) { console.error("Erro ao atualizar meta", e); }
  };
  
  const deleteGoal = async (id) => {
      try {
          await MetasService.apagar(id);
          // Remove filtrando tanto por id quanto por metasId para garantir
          setGoals(prev => prev.filter(g => (g.id !== id && g.metasId !== id)));
      } catch (e) { console.error("Erro ao apagar meta", e); }
  };
  
  const toggleGoalStatus = async (goal) => {
    try {
        // CORREÇÃO: Lógica de status com Inteiro (0 ou 1)
        // 1 = Concluído, 0 = Em andamento
        const currentStatus = (goal.status === 1 || goal.status === 'CONCLUIDO') ? 1 : 0;
        const newStatus = currentStatus === 1 ? 0 : 1;
        const newProgress = newStatus === 1 ? 100 : 0;

        const idParaAtualizar = goal.id || goal.metasId;

        // Monta payload compatível com DTORequest
        const payload = { 
            ...goal, 
            status: newStatus, 
            data: goal.data || goal.dataInicio, // Garante envio da data
            nome: goal.nome || goal.titulo,     // Garante envio do nome
            progresso: newProgress 
        };
        
        // Atualiza no backend
        const saved = await MetasService.atualizar(idParaAtualizar, payload);
        
        // Atualiza no frontend
        setGoals(prev => prev.map(g => {
             const gId = g.id || g.metasId;
             return gId === idParaAtualizar ? { ...saved, id: gId, status: newStatus, progresso: newProgress } : g;
        }));
        
    } catch(e) { console.error("Erro toggle status meta", e); }
  }

  // --- AÇÕES DE POMODORO (API) ---
  const addSession = async (newSession) => {
    try {
        const payload = {
            dataInicio: newSession.dataInicio, 
            duracao: newSession.duracao,
            tipo: newSession.tipo, 
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
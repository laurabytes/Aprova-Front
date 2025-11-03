import React, { createContext, useState } from 'react';
// Não vamos mais importar os dados de mockData

export const GoalsContext = createContext();

export const GoalsProvider = ({ children }) => {
  // A MUDANÇA ESTÁ AQUI:
  // Em vez de carregar 'initialGoals', começamos com uma lista vazia.
  const [goals, setGoals] = useState([]); 

  return (
    <GoalsContext.Provider value={{ goals, setGoals }}>
      {children}
    </GoalsContext.Provider>
  );
};
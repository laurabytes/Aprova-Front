import React, { createContext, useState } from 'react';

export const SessionsContext = createContext();

export const SessionsProvider = ({ children }) => {
  // Começa com uma lista vazia
  const [sessions, setSessions] = useState([]); 

  return (
    <SessionsContext.Provider value={{ sessions, setSessions }}>
      {children}
    </SessionsContext.Provider>
  );
};
import React, { createContext, useState } from 'react';
// Não vamos mais importar os dados de mockData

export const SubjectsContext = createContext();

export const SubjectsProvider = ({ children }) => {
  // A MUDANÇA ESTÁ AQUI:
  // Em vez de carregar 'initialSubjects', começamos com uma lista vazia.
  const [subjects, setSubjects] = useState([]); 

  return (
    <SubjectsContext.Provider value={{ subjects, setSubjects }}>
      {children}
    </SubjectsContext.Provider>
  );
};
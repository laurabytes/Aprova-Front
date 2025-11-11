// app/(tabs)/_layout.jsx

import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
// ÍCONES: Adicionado Calendar e removido UserCircle (agora é a aba Planejador)
import { BookOpen, Home, Target, Timer, Calendar } from 'lucide-react-native';
// O caminho aqui é ../../ porque está dentro de (tabs)/
import { cores } from '../../tema/cores'; 

export default function TabsLayout() {
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.foreground,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ color }) => <Timer size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="objetivos"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color }) => <Target size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="materias/index"
        options={{
          title: 'Matérias',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="materias/[id]"
        options={{
          href: null, 
          headerShown: false,
          title: 'Flashcards',
        }}
      />

      {/* A tela 'revisao' também deve ser listada aqui e escondida com href: null */}
      <Tabs.Screen
        name="materias/revisao" 
        options={{
          href: null, // Esconde da barra de abas
          headerShown: false,
          title: 'Revisão Mista',
        }}
      />

      {/* PERFIL AGORA É O PLANEJADOR */}
      <Tabs.Screen
        name="perfil" // Nome do arquivo .jsx que contém o planejador
        options={{
          title: 'Planejador', // Título alterado na aba
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />, // Ícone alterado
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
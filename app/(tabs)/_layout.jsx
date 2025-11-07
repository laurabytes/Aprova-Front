// app/(tabs)/_layout.jsx

import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { BookOpen, Home, Target, Timer, UserCircle } from 'lucide-react-native';
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
          href: null, // Escondido da barra
          headerShown: false,
          title: 'Flashcards',
        }}
      />

      {/* ===== ESTA É A CORREÇÃO ===== */}
      {/* A tela 'revisao' também deve ser listada aqui e escondida com href: null */}
      <Tabs.Screen
        name="materias/revisao" 
        options={{
          href: null, // Esconde da barra de abas
          headerShown: false,
          title: 'Revisão Mista',
        }}
      />
      {/* ===== FIM DA CORREÇÃO ===== */}

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
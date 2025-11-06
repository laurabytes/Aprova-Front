// app/(tabs)/_layout.jsx

import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { BookOpen, Home, Target, Timer, UserCircle } from 'lucide-react-native';
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
          // ALTERAÇÃO 1: Renomeado o título da aba
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

      {}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
}
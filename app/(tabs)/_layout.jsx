import { Tabs } from 'expo-router';
import { View, useColorScheme, StyleSheet } from 'react-native';
import { BookOpen, Home, Target, Timer, Calendar } from 'lucide-react-native';
import { cores } from '../../tema/cores';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: theme.card, borderTopColor: 'transparent', shadowColor: theme.foreground },
        ],
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Home size={focused ? 26 : 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="materias/index" // Movido para a 2ª posição
        options={{
          title: 'Matérias',
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={focused ? 26 : 22} color={color} />
          ),
        }}
      />

      {/* BOTÃO CENTRAL POMODORO (agora é o 3º na ordem) */}
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.centralButton,
                {
                  // Usa as cores do tema para o botão central
                  backgroundColor: focused ? theme.primary : theme.primary + '30',
                  shadowColor: theme.primary,
                },
              ]}
            >
              <Timer size={30} color={focused ? theme.primaryForeground : theme.primary} />
            </View>
          ),
        }}
      />

      {/* Objetivos (agora é um botão normal) */}
      <Tabs.Screen
        name="objetivos"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color, focused }) => (
            <Target size={focused ? 26 : 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Planejador',
          tabBarIcon: ({ color, focused }) => (
            <Calendar size={focused ? 26 : 22} color={color} />
          ),
        }}
      />
      
      {/* As rotas com href: null e headerShown: false continuam no final */}

      <Tabs.Screen
        name="materias/[id]"
        options={{
          href: null,
          headerShown: false,
          title: 'Flashcards',
        }}
      />

      <Tabs.Screen
        name="materias/revisao"
        options={{
          href: null,
          headerShown: false,
          title: 'Revisão Mista',
        }}
      />

      <Tabs.Screen
        name="minha-conta"
        options={{
          href: null,
          headerShown: false,
          title: 'Minha Conta',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 24,
    height: 64,
    elevation: 10,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  centralButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24, // faz o botão central "saltar" um pouco pra cima
    elevation: 5,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
});
// app/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';
import { View, useColorScheme, StyleSheet } from 'react-native';
import { BookOpen, Home, Award, Timer, Calendar } from 'lucide-react-native'; // Alterado: Target -> Award
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
          { 
            backgroundColor: theme.card, 
            borderTopColor: theme.border,
            borderTopWidth: 1,
            elevation: 0,
          },
        ],
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Home size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="materias/index"
        options={{
          title: 'Matérias',
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="pomodoro"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.centralButton,
                {
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  elevation: 8,
                },
              ]}
            >
              <Timer size={28} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="objetivos"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color, focused }) => (
            // AQUI ESTÁ A MUDANÇA: Award (Medalha) em vez de Target
            <Award size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Planejador',
          tabBarIcon: ({ color, focused }) => (
            <Calendar size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      
      {/* Rotas ocultas */}
      <Tabs.Screen name="materias/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="materias/revisao" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="minha-conta" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  centralButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
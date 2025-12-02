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
        tabBarShowLabel: false, // Sem texto, apenas ícones (mais limpo)
        tabBarActiveTintColor: theme.primary, // Azul Ciano
        tabBarInactiveTintColor: theme.mutedForeground, // Cinza
        tabBarStyle: [
          styles.tabBar,
          { 
            backgroundColor: theme.card, 
            borderTopColor: theme.border, // Borda fina e elegante
            borderTopWidth: 1, // Borda superior apenas (estilo iOS moderno)
            elevation: 0, // Remove sombra pesada no Android para ficar "flat"
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

      {/* BOTÃO CENTRAL - Minimalista e Moderno */}
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.centralButton,
                {
                  backgroundColor: theme.primary, // Fundo Azul Ciano Sólido
                  // Sombra colorida (Glow)
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
            <Target size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
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
    height: 60, // Altura padrão mais confortável
    paddingBottom: 5, // Espaço inferior
    paddingTop: 5,
  },
  centralButton: {
    width: 56, // Um pouco menor e mais discreto
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Sobe um pouco
    
    // Efeito de "Glow" (Brilho) no iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
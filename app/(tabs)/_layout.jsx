import { Tabs } from 'expo-router';
import { BarChart2, Clock, Home, User, UserCircle } from 'lucide-react-native';
import { GoalsProvider } from '../../context/GoalsContext';
import { SessionsProvider } from '../../context/SessionsContext'; // 1. Importar
import { SubjectsProvider } from '../../context/SubjectsContext';
import { colors } from '../../theme/colors';

export default function TabLayout() {
  return (
    <SubjectsProvider>
      <GoalsProvider>
        <SessionsProvider> {/* 2. Adicionar o Provedor aqui */}
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.accent,
              // ... (resto das suas tabs)
              tabBarStyle: {
                backgroundColor: colors.white,
                borderTopWidth: 1,
                borderTopColor: colors.gray,
                paddingBottom: 5,
                paddingTop: 5,
                height: 60,
              },
            }}>
            <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ size, color }) => <Home size={size} color={color} />, }} />
            <Tabs.Screen name="goals" options={{ title: 'Metas', tabBarIcon: ({ size, color }) => <BarChart2 size={size} color={color} />, }} />
            <Tabs.Screen name="session" options={{ title: 'Sessão', tabBarIcon: ({ size, color }) => <Clock size={size} color={color} />, }} />
            <Tabs.Screen name="subjects" options={{ title: 'Matérias', tabBarIcon: ({ size, color }) => <User size={size} color={color} />, }} />
            <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ size, color }) => <UserCircle size={size} color={color} />, }} />
          </Tabs>
        </SessionsProvider>
      </GoalsProvider>
    </SubjectsProvider>
  );
}
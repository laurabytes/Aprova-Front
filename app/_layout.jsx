import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* 1. O grupo principal de abas */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* 2. A tela de detalhes da matéria. O nome DEVE ser o caminho do arquivo */}
      <Stack.Screen name="subject/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
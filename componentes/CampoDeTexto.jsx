// componentes/CampoDeTexto.jsx
import { StyleSheet, TextInput, useColorScheme } from 'react-native';
import { cores } from '../tema/cores';

export function CampoDeTexto({ style, placeholder, value, onChangeText, secureTextEntry }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;

  return (
    <TextInput
      style={[
        styles.input,
        {
          borderColor: theme.border,
          color: theme.foreground,
          backgroundColor: theme.card, // <-- 1. ADICIONADO AQUI
        },
        style,
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.mutedForeground}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    // backgroundColor: '#FFFFFF', // <-- 2. REMOVIDO DAQUI
  },
});
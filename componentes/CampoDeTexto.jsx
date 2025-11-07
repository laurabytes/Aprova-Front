// componentes/CampoDeTexto.jsx
import { StyleSheet, TextInput, useColorScheme } from 'react-native';
import { cores } from '../tema/cores';

// Permite que o Textarea funcione com o alinhamento correto
export function CampoDeTexto({ 
  style, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  multiline = false,
  ...props 
}) {
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <TextInput
      style={[
        styles.input,
        {
          borderColor: theme.border,
          color: theme.foreground,
          backgroundColor: theme.card,
        },
        // Aplica altura 44 apenas se NÃO for multiline
        !multiline && { height: 44 },
        style,
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.mutedForeground}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      multiline={multiline} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});
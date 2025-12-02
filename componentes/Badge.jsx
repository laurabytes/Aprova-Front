// componentes/Badge.jsx
import { StyleSheet, Text, useColorScheme, View, Platform } from 'react-native';
import { cores } from '../tema/cores';

export function Badge({ children, variant = 'default', style }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;

  const variantStyles = {
    default: {
      backgroundColor: theme.primary,
      color: theme.primaryForeground,
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: theme.muted,
      color: theme.mutedForeground,
      borderColor: 'transparent',
    },
    destructive: {
      backgroundColor: theme.destructive,
      color: theme.primaryForeground,
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.foreground,
      borderColor: theme.border,
    },
  };

  const styles = StyleSheet.create({
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 4, // Padding vertical equilibrado
      borderRadius: 12,
      borderWidth: 1,
      alignSelf: 'flex-start',
      
      // Garante que o container se comporte como uma caixa flexível centralizada
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      
      ...variantStyles[variant],
    },
    text: {
      fontSize: 12,
      fontWeight: '600',
      color: variantStyles[variant].color,
      textAlign: 'center',
      
      // CORREÇÃO CRÍTICA PARA ANDROID
      ...Platform.select({
        android: {
          includeFontPadding: false, // Remove o espaço extra nativo da fonte
          textAlignVertical: 'center', // Força o centro vertical
        },
      }),
    },
  });

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}
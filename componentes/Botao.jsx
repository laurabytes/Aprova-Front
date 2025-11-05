// componentes/Botao.jsx
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { cores } from '../tema/cores';

export function Botao({ children, onPress, variant = 'default', style, disabled }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;

  // Lógica de estilo de variante CORRIGIDA
  const variantStyles = {
    style: {},
    text: {},
  };

  if (variant === 'destructive') {
    variantStyles.style.backgroundColor = theme.destructive;
    variantStyles.text.color = theme.primaryForeground;
  } else if (variant === 'outline') {
    // 1. AQUI ONDE ESTAVA O PROBLEMA DO FUNDO CINZA
    // Queremos ele transparente, mas com a borda do tema.
    variantStyles.style.backgroundColor = theme.card; // Usar a cor do card (para se misturar)
    variantStyles.style.borderWidth = 1;
    variantStyles.style.borderColor = theme.border; // Borda com a cor do tema
    variantStyles.text.color = theme.foreground;
  } else {
    // default
    variantStyles.style.backgroundColor = theme.primary;
    variantStyles.text.color = theme.primaryForeground;
  }

  let buttonContent = children;

  if (typeof children === 'string') {
    buttonContent = <Text style={[styles.text, variantStyles.text]}>{children}</Text>;
  } else if (Array.isArray(children)) {
    buttonContent = children.map((child, index) => {
      if (typeof child === 'string') {
        return (
          <Text key={index} style={[styles.text, variantStyles.text]}>
            {child}
          </Text>
        );
      }
      return child;
    });
  }

  return (
    <TouchableOpacity
      style={[
        styles.base, 
        variantStyles.style, 
        style, 
        disabled && styles.disabled 
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: 44,
    // REMOVEMOS O PADDING HORIZONTAL DAQUI
    // paddingHorizontal: 16, 
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.6,
  },
});
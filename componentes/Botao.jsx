// componentes/Botao.jsx
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { cores } from '../tema/cores';

export function Botao({ children, onPress, variant = 'default', style, disabled }) {
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const variantStyles = {
    style: {},
    text: {},
  };

  if (variant === 'destructive') {
    variantStyles.style.backgroundColor = theme.destructive;
    variantStyles.text.color = theme.primaryForeground;
  } else if (variant === 'destructive-outline') {
    // Estilo Destructive como outline (para o modal "Cancelar")
    variantStyles.style.backgroundColor = 'transparent';
    variantStyles.style.borderWidth = 1;
    const borderColor = theme.destructiveLight || theme.destructive;
    variantStyles.style.borderColor = borderColor; 
    variantStyles.text.color = theme.destructive;
  } else if (variant === 'outline') {
    // Mantém o estilo outline normal
    variantStyles.style.backgroundColor = theme.card; 
    variantStyles.style.borderWidth = 1;
    variantStyles.style.borderColor = theme.border; 
    variantStyles.text.color = theme.foreground;
  } else {
    // default (Criar/Salvar)
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: 44,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
// laurabytes/teste/teste-2245de4fd0484947e9d28a093b91aba0b792499b/componentes/Select.jsx
import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native'; // 1. Importar Platform
import { cores } from '../tema/cores'; // Caminho para a pasta 'tema'

// 2. Adicionar 'prompt' nas props
export function Select({ children, onValueChange, value, enabled = true, prompt }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light; //

  const styles = StyleSheet.create({
    container: {
      height: 44,
      width: '100%',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border, //
      justifyContent: 'center',
      // Definimos o background para o valor do Card, para ficar consistente
      backgroundColor: theme.card, //
      overflow: 'hidden', // Adicionado para conter o Picker
    },
    picker: {
      color: theme.foreground, //
      backgroundColor: theme.card, // Adicionado para forçar o fundo no Picker
      // Ajuste para Android: padding negativo para centralizar
      ...Platform.select({
        android: {
          paddingLeft: -12,
        },
      }),
    },
    // Estilo dos itens para o iOS
    pickerItem: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.foreground,
    },
  });

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
        // itemStyle SÓ funciona no iOS
        itemStyle={styles.pickerItem}
        enabled={enabled}
        // Adiciona cor ao ícone de "seta para baixo"
        dropdownIconColor={theme.mutedForeground}
        
        // 3. ADICIONAR ESTAS PROPS
        mode="dialog"
        prompt={prompt || 'Selecione uma opção'}
      >
        {children}
      </Picker>
    </View>
  );
}

export const SelectItem = Picker.Item;
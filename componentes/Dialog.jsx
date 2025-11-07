// componentes/Dialog.jsx
import {
    Modal,
    StyleSheet,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
    // 1. IMPORTAR KeyboardAvoidingView E Platform
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { cores } from '../tema/cores';

export function Dialog({ open, onOpenChange, children }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? cores.dark : cores.light;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      // 2. Adicionar max height para garantir que o scroll funcione
      maxHeight: '85%', 
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={open}
      onRequestClose={() => onOpenChange(false)}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* 3. ADICIONAR O KEYBOARDAVOIDINGVIEW AQUI */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={() => onOpenChange(false)}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                {/* 4. O children (que é o ScrollView de objetivos.jsx) fica aqui */}
                <View style={styles.content}>{children}</View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
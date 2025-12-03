// laurabytes/aprova-front/Aprova-Front-b241cf63137e553c3d5e7e3bcbdf8c6ea8598440/componentes/TelaSplash.jsx

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import { cores } from '../tema/cores'; // Importa as cores do seu tema

const { width } = Dimensions.get('window');

export function TelaSplash() {
  // Animação simples de opacidade (fade-in) para a logo
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // 1 segundo para a logo aparecer suavemente
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Degradê: Começa Branco (#FFFFFF) e vai para a cor primária do seu tema */}
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF', cores.primaria]} // Usando a cor primária do seu tema (se definido)
        locations={[0, 0.4, 1]} // Controla onde a cor muda
        style={styles.background}
      />

      <Animated.View style={{ opacity: fadeAnim }}>
        {/* ALTERADO: Agora aponta para o mascote.png */}
        <Image
          source={require('../assets/images/mascote.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  logo: {
    width: width * 0.5, // 50% da largura da tela
    height: width * 0.5, // Mantém proporção quadrada (ou ajuste conforme necessário)
    maxHeight: 200, // Limite de altura para telas maiores
    maxWidth: 200, // Limite de largura para telas maiores
    // A propriedade tintColor foi removida, pois seu mascote já deve ser colorido.
  },
});
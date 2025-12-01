// componentes/TelaSplash.jsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import { cores } from '../tema/cores'; // Opcional, para usar suas cores

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
      {/* Degradê: Começa Branco (#FFFFFF) e vai para um Azul (#0066FF ou a cor primária do seu tema) */}
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF', '#4da6ff']} // Branco em cima, azulando em baixo
        locations={[0, 0.4, 1]} // Controla onde a cor muda
        style={styles.background}
      />

      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Substitua pelo caminho da sua logo real se for diferente */}
        <Image
          source={require('../assets/images/icon.png')} 
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  logo: {
    width: width * 0.5, // 50% da largura da tela
    height: width * 0.5,
  },
});
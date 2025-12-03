import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View, useColorScheme } from 'react-native'; // 1. Adicione useColorScheme
import { cores } from '../tema/cores';

const { width } = Dimensions.get('window');

export function TelaSplash() {
  // 2. Detectar o tema atual para pegar a cor certa
  const scheme = useColorScheme();
  const theme = cores[scheme === 'dark' ? 'dark' : 'light'];

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        // 3. CORREÇÃO: Use theme.primary em vez de cores.primaria
        colors={['#FFFFFF', '#FFFFFF', theme.primary]} 
        locations={[0, 0.4, 1]}
        style={styles.background}
      />

      <Animated.View style={{ opacity: fadeAnim }}>
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
    width: width * 0.5,
    height: width * 0.5,
    maxHeight: 200,
    maxWidth: 200,
  },
});
// tema/cores.js

// Estas são as cores "traduzidas" do seu site (testando-react)
// para o React Native. Vamos focar no modo claro primeiro.

export const cores = {
  // Modo Claro (Light)
  light: {
    background: '#fcfcfc', // Fundo principal
    foreground: '#262626', // Texto principal
    card: '#FFFFFF',       // Fundo dos cards
    primary: '#3b82f6',    // Azul (Botões, links)
    primaryForeground: '#FFFFFF', // Texto do botão azul
    border: '#e5e5e5',     // Bordas
    input: '#e5e5e5',      // Borda do Input
    muted: '#f4f4f5',      // Fundo sutil (ex: tags)
    mutedForeground: '#737373', // Texto sutil (descrições)
    destructive: '#ef4444', // Vermelho (perigo, apagar)
    // ==============================================================
    // ADICIONADO AQUI
    // ==============================================================
    destructiveLight: '#fca5a5', // Um vermelho claro (Tailwind red-300) para contraste em fundos escuros
  },
  
  // Modo Escuro (Dark)
  dark: {
    background: '#0c0c0c',
    foreground: '#f2f2f2',
    card: '#1a1a1a',
    primary: '#60a5fa',
    primaryForeground: '#fcfcfc',
    border: '#404040',
    input: '#404040',
    muted: '#333333',
    mutedForeground: '#999999',
    destructive: '#ef4444',
    // ==============================================================
    // ADICIONADO AQUI TAMBÉM
    // ==============================================================
    destructiveLight: '#fca5a5',
  },
};
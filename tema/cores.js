// tema/cores.js

export const cores = {
  // Modo Claro: Branco, Cinza e Azul Vibrante
  light: {
    background: '#FFFFFF',        // Branco puro (Clean)
    foreground: '#09090B',        // Preto quase absoluto para texto (leitura fácil)
    card: '#FAFAFA',              // Um cinza super leve apenas para delimitar
    primary: '#2693BE',           // SEU AZUL CIANO (A estrela do design)
    primaryForeground: '#FFFFFF', // Texto branco no botão
    border: '#E4E4E7',            // Bordas cinza claro
    input: '#FFFFFF',             // Input branco com borda
    muted: '#F4F4F5',             // Cinza para fundos secundários
    mutedForeground: '#71717A',   // Texto cinza médio
    destructive: '#EF4444',       // Vermelho padrão (mais profissional que o laranja)
    destructiveLight: '#FEE2E2',  
  },
  
  // Modo Escuro: "True Black" com toques de Neon
  dark: {
    background: '#000000',        // Preto Real (Economia de bateria + Estilo)
    foreground: '#EDEDED',        // Branco levemente "off" (menos cansativo)
    card: '#121212',              // Padrão Material Design (Grafite escuro)
    primary: '#2693BE',           // O Ciano brilha muito no fundo preto
    primaryForeground: '#FFFFFF', 
    border: '#27272A',            // Bordas sutis
    input: '#18181B',             // Um pouco mais claro que o fundo
    muted: '#27272A',             // Cinza escuro para elementos inativos
    mutedForeground: '#A1A1AA',   // Cinza metálico
    destructive: '#FF453A',       // Vermelho iOS Dark
    destructiveLight: '#450a0a',  
  },
};
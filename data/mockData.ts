import { colors } from "@/theme/colors";

// Função helper para criar datas de exemplo
const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

export const performanceData = [
  {
    name: 'História do Brasa',
    hours: 8,
    color: colors.yellow,
    legendFontColor: colors.primaryText,
    legendFontSize: 12,
  },
  {
    name: 'Estatística',
    hours: 6,
    color: colors.blue,
    legendFontColor: colors.primaryText,
    legendFontSize: 12,
  },
  {
    name: 'Geometria (o terror)',
    hours: 5,
    color: colors.lightGreen,
    legendFontColor: colors.primaryText,
    legendFontSize: 12,
  },
  {
    name: 'Álgebra',
    hours: 4,
    color: colors.lightPink,
    legendFontColor: colors.primaryText,
    legendFontSize: 12,
  },
];

export const weeklyStudyData = {
  labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
  datasets: [
    {
      data: [2, 3, 2.5, 4, 3.5, 1, 0.5],
    },
  ],
};

export const goals = [
  {
    id: '1',
    title: 'Ler o livro de Física (finalmente)',
    description: 'Capítulos 3 e 4 sobre Termodinâmica. Fazer pelo menos 20 exercícios.',
    progress: 0.75,
    status: 'Alta',
    deadline: getFutureDate(5), // Prazo de 5 dias a partir de hoje
    statusColor: colors.red,
  },
  {
    id: '2',
    title: 'Revisar Mat. pra prova',
    description: 'Refazer a lista de Funções Quadráticas e Logaritmos.',
    progress: 0.5,
    status: 'Média',
    deadline: getFutureDate(3), // Prazo de 3 dias
    statusColor: colors.orange,
  },
  {
    id: '3',
    title: 'Fazer os exercícios de Química',
    description: 'Lista sobre Estequiometria, página 52.',
    progress: 0.3,
    status: 'Baixa',
    deadline: getFutureDate(1), // Prazo de 1 dia
    statusColor: colors.accent,
  },
];

export const subjects = [
  {
    id: '1',
    name: 'Português',
    hours: 12,
    color: colors.pink,
    priority: 'Alta',
  },
  {
    id: '2',
    name: 'Matemática',
    hours: 15,
    color: colors.green,
    priority: 'Média',
  },
  {
    id: '3',
    name: 'História',
    hours: 8,
    color: colors.purple,
    priority: 'Alta',
  },
];

export const scheduledSessions = [
  {
    id: '1',
    subject: 'Álgebra',
    topic: 'Matrizes (socorro)',
    time: 'Hoje - 14:00',
  },
  {
    id: '2',
    subject: 'Português',
    topic: 'Resumo de Literatura',
    time: 'Hoje - 14:00',
  },
];
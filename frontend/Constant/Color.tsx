const colors = {
  background: '#0D0D0D',
  cardPrimary: '#6E36D4',
  cardSecondary: '#9B4DFF',
  cardGradient: ['#9B4DFF', '#5520C9'] as [string, string], // ✅ Typed as tuple
  accent: '#7A3FFD',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  error: '#FF4D4D',
  whatsappGreen: '#25D366',
  messengerBlue: '#0084FF',
  chartFood: '#FF4D4D',
  chartDress: '#B366FF',
  chartTransport: '#FF66B2',
  chartOthers: '#CCCCCC',
} as const;

export default colors;

export const theme = {
  colors: {
    primary: '#4F46E5', // Indigo 600
    primaryHover: '#4338CA',
    primaryLight: 'rgba(79, 70, 229, 0.15)',
    primaryGlow: 'rgba(99, 102, 241, 0.35)',

    secondary: '#0EA5E9', // Sky 500
    secondaryHover: '#0284C7',

    background: '#0B0F19', // Deep Slate
    surface: '#111827', // Gray 900
    surfaceCard: '#182234', // Slate Dark Card
    surfaceHover: '#1F2E47',
    surfaceSelected: '#243452',

    sidebar: '#0D1322',
    header: '#0E1526',

    text: '#F9FAFB', // Gray 50
    textMuted: '#9CA3AF', // Gray 400
    textDim: '#6B7280', // Gray 500
    textInverse: '#111827',

    border: '#1F2937', // Gray 800
    borderLight: '#374151', // Gray 700
    borderFocus: '#6366F1',

    success: '#10B981', // Emerald 500
    successBg: 'rgba(16, 185, 129, 0.12)',
    successBorder: 'rgba(16, 185, 129, 0.3)',

    warning: '#F59E0B', // Amber 500
    warningBg: 'rgba(245, 158, 11, 0.12)',
    warningBorder: 'rgba(245, 158, 11, 0.3)',

    danger: '#EF4444', // Red 500
    dangerHover: '#DC2626',
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    dangerBorder: 'rgba(239, 68, 68, 0.3)',

    info: '#3B82F6', // Blue 500
    infoBg: 'rgba(59, 130, 246, 0.12)',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  radius: {
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(79, 70, 229, 0.35)',
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    headingFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      hero: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extraBold: 800,
    },
  },
};

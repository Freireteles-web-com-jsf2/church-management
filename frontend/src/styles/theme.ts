// Tema global do sistema com paleta azul claro
export const theme = {
  colors: {
    // Paleta principal azul claro
    primary: '#4A90E2',
    primaryLight: '#5DADE2',
    primaryDark: '#2471A3',
    primaryVeryLight: '#EBF5FB',
    
    // Cores neutras
    white: '#FFFFFF',
    grayLight: '#F5F7FA',
    gray: '#E0E0E0',
    grayDark: '#757575',
    text: '#333333',
    textLight: '#666666',
    
    // Cores de status
    success: '#2ECC71',
    warning: '#F39C12',
    danger: '#E74C3C',
    info: '#3498DB',
    
    // Cores de fundo
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    sidebarBackground: '#FFFFFF',
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0 4px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.15)',
  },
  
  typography: {
    fontFamily: {
      primary: "'Inter', 'Roboto', 'Open Sans', sans-serif",
      secondary: "'Poppins', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
} as const;

export type Theme = typeof theme;
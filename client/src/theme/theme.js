import { createTheme } from '@mui/material/styles';

export function getAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#0284c7', // Sky Blue / Ocean
        light: '#38bdf8',
        dark: '#0369a1',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#10b981', // Emerald
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff'
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706'
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626'
      },
      background: {
        default: isDark ? '#0b1120' : '#f8fafc',
        paper: isDark ? '#1e293b' : '#ffffff'
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b'
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      button: { fontWeight: 600, textTransform: 'none' }
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
            }
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: isDark
              ? '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
              : '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            backgroundImage: 'none'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8
          }
        }
      }
    }
  });
}


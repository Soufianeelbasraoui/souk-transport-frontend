import { createTheme } from '@mui/material/styles';

/**
 * Thème Material UI scoped pour SoukTransport.
 * Ne contient AUCUN CssBaseline pour ne pas écraser les styles de la landing page.
 */
export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#1A3A5C',
      dark: '#10263D',
      light: '#2A5480',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F57C00',
      dark: '#E65100',
      light: '#FFF3E0',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#E8F5E9',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#C62828',
      light: '#FFEBEE',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F9A825',
      light: '#FFFDE7',
      contrastText: '#1A202C',
    },
    info: {
      main: '#0288D1',
      light: '#E1F5FE',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F0F2F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#718096',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        },
      },
    },
  },
});

export default muiTheme;

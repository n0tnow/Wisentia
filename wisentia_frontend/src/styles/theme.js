import { createTheme } from '@mui/material/styles';

// Açık tema
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5', // Mor-mavi
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#7c4dff', // Mor
      light: '#b47cff',
      dark: '#3f1dcb',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

// Koyu tema
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#757de8', // Mor-mavi (açık ton)
      light: '#a4a4eb',
      dark: '#3f51b5',
    },
    secondary: {
      main: '#b47cff', // Mor (açık ton)
      light: '#e2afff',
      dark: '#7c4dff',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
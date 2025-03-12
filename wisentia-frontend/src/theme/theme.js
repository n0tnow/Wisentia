import { createTheme } from '@mui/material/styles';

// More modern color palette for Wisentia
export const theme = createTheme({
  palette: {
    primary: {
      main: '#3a86ff', // Vibrant blue
      light: '#6ba5ff',
      dark: '#0059cb',
    },
    secondary: {
      main: '#8338ec', // Rich purple
      light: '#b168ff',
      dark: '#5412b8',
    },
    success: {
      main: '#06d6a0', // Teal
      light: '#68ffd2',
      dark: '#00a472',
    },
    error: {
      main: '#ef476f', // Coral pink
      light: '#ff7a9d',
      dark: '#b81445',
    },
    warning: {
      main: '#ffd166', // Gold
      light: '#ffff98',
      dark: '#caa034',
    },
    background: {
      default: '#f8fafc', // Light blueish gray
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748', // Dark slate
      secondary: '#718096', // Medium gray
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          padding: '8px 20px',
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #3a86ff 0%, #6ba5ff 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #0059cb 0%, #3a86ff 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #8338ec 0%, #b168ff 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5412b8 0%, #8338ec 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #3a86ff 0%, #8338ec 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
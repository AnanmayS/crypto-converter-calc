import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CryptoConverter } from './features/crypto/CryptoConverter';

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        shape: {
          borderRadius: 16,
        },
        palette: {
          mode,
          primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
          },
          secondary: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#f8fafc',
            paper: mode === 'dark' ? '#1e293b' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
            secondary: mode === 'dark' ? '#cbd5e1' : '#64748b',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow: mode === 'dark' 
                  ? '0 0 0 1px rgba(255, 255, 255, 0.1)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                },
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CryptoConverter />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

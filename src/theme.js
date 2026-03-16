import { createTheme } from '@mui/material/styles';
/**
 * Theme palette mapped from legacy App.css:
 * - secondary = selected
 * - success = correct
 * - error = incorrect
 * - info = active / hover
 * - warning = active-primary (yellow)
 */
export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    dark: true,
  },
  palette: {
    mode: 'light',
    background: {
      light: '#fafafa',
      lightPaper: '#fff',
      dark: '#303030',
      darkPaper: '#424242',
    },
    primary: {
      main: '#8bcaea',
      light: '#A2D4EE',
      dark: '#618DA3',
      contrastText: '#fff',
    },
    secondary: {
      main: '#cc79a7',
      light: '#D693B8',
      dark: '#ae658d',
      contrastText: '#fff',
    },
    success: {
      main: '#009e73',
      light: '#33B18F',
      dark: '#007200',
      contrastText: '#fff',
    },
    error: {
      main: '#d55e00',
      light: '#DD7E33',
      dark: '#b24500',
      contrastText: '#fff',
    },
    info: {
      main: '#ab47bc',
      light: '#BB6BC9',
      dark: '#773183',
      contrastText: '#fff',
    },
    warning: {
      main: '#f0e442',
      dark: '#d4c73b',
      light: '#F3E967',
      contrastText: '#00000',
    },
    type: 'light',
  },
});

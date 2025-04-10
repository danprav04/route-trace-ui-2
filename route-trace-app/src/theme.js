// ----- File: src/theme.js -----

import { createTheme } from '@mui/material/styles';
import { amber, grey, deepOrange } from '@mui/material/colors';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // palette values for light mode
          primary: { // Example: Blueish primary
              main: '#1976d2',
          },
          secondary: { // Example: Purpleish secondary
              main: '#9c27b0',
          },
          divider: grey[300], // Lighter divider
          background: {
            default: '#f4f6f8', // Light grey background
            paper: '#ffffff', // White paper background
          },
          text: {
            primary: grey[900],
            secondary: grey[700],
          },
        }
      : {
          // palette values for dark mode
          primary: { // Example: A lighter blue for dark mode
            main: '#90caf9',
          },
          secondary: { // Example: A lighter purple
            main: '#ce93d8',
          },
          divider: grey[700], // Darker divider
          background: {
            default: '#121212', // Standard dark background
            paper: '#1e1e1e', // Slightly lighter paper
          },
          text: {
            primary: '#ffffff',
            secondary: grey[400],
          },
        }),
  },
  // You can customize typography, components defaults etc. here
  typography: {
      fontFamily: 'Roboto, sans-serif',
  },
  components: {
      // Example: Default props for MuiAppBar
      MuiAppBar: {
          defaultProps: {
              elevation: 1, // Subtle shadow
          }
      },
      // Example: Default props for MuiDrawer
      MuiDrawer: {
          styleOverrides: {
              paper: {
                  // Add styles if needed, e.g., borderRight for permanent drawer
                  // borderRight: `1px solid ${mode === 'light' ? grey[300] : grey[700]}`,
              }
          }
      }
  }
});

export default getDesignTokens;

// ----- End File: src/theme.js -----
// ----- File: src\theme.js -----
import { createTheme, alpha } from '@mui/material/styles';
import { grey, blue, purple, pink, green, orange, red } from '@mui/material/colors';

// Define base colors for reuse
const primaryLight = blue[300];
const primaryMain = blue[600];
const primaryDark = blue[800];

const secondaryLight = purple[300];
const secondaryMain = purple[500];
const secondaryDark = purple[700];

const errorLight = red[300];
const errorMain = red[600];
const errorDark = red[800];

const warningLight = orange[300];
const warningMain = orange[500];
const warningDark = orange[700];

const successLight = green[300];
const successMain = green[600];
const successDark = green[800];


const getDesignTokens = (mode) => ({
  palette: {
    mode, // 'light' or 'dark'
    primary: {
      light: mode === 'light' ? primaryLight : blue[400], // Lighter shade for dark mode contrast
      main: mode === 'light' ? primaryMain : blue[300],
      dark: mode === 'light' ? primaryDark : blue[200],
      contrastText: mode === 'light' ? grey[50] : grey[900],
    },
    secondary: {
      light: mode === 'light' ? secondaryLight : pink[300], // Using Pink for secondary in dark mode example
      main: mode === 'light' ? secondaryMain : pink[400],
      dark: mode === 'light' ? secondaryDark : pink[500],
      contrastText: mode === 'light' ? grey[50] : grey[900],
    },
    error: {
      light: mode === 'light' ? alpha(errorLight, 0.3) : alpha(errorLight, 0.2), // Lighter bg for alert
      main: mode === 'light' ? errorMain : errorLight,
      dark: mode === 'light' ? errorDark : errorMain,
      contrastText: mode === 'light' ? grey[900] : grey[50],
    },
     warning: {
      light: mode === 'light' ? alpha(warningLight, 0.3) : alpha(warningLight, 0.2),
      main: mode === 'light' ? warningMain : warningLight,
      dark: mode === 'light' ? warningDark : warningMain,
      contrastText: mode === 'light' ? grey[900] : grey[900], // Dark text usually better on orange
    },
     success: {
      light: mode === 'light' ? alpha(successLight, 0.3) : alpha(successLight, 0.2),
      main: mode === 'light' ? successMain : successLight,
      dark: mode === 'light' ? successDark : successMain,
      contrastText: mode === 'light' ? grey[900] : grey[900], // Dark text on green
    },
    grey: grey, // Expose grey palette
    ...(mode === 'light'
      ? {
          // --- Light Mode Specifics ---
          divider: alpha(grey[500], 0.2), // Lighter divider
          text: {
            primary: grey[900],
            secondary: grey[700],
            disabled: grey[500],
          },
          background: {
            default: grey[100], // Very light grey background
            paper: '#ffffff', // White paper
          },
          action: {
            active: grey[700],
            hover: alpha(grey[500], 0.08),
            selected: alpha(grey[500], 0.16),
            disabled: alpha(grey[500], 0.3),
            disabledBackground: alpha(grey[500], 0.12),
            focus: alpha(grey[500], 0.12),
          },
        }
      : {
          // --- Dark Mode Specifics ---
          divider: alpha(grey[500], 0.25), // Slightly more visible divider
          text: {
            primary: grey[50], // Almost white
            secondary: grey[400], // Lighter grey
            disabled: grey[600],
          },
          background: {
            default: '#121212', // Standard dark background
            paper: '#1e1e1e', // Slightly lighter paper/cards
            // paper: grey[900], // Alternative darker paper
          },
          action: {
            active: grey[300],
            hover: alpha(grey[500], 0.1), // Subtle hover
            selected: alpha(grey[500], 0.2), // Visible selection
            disabled: alpha(grey[500], 0.3),
            disabledBackground: alpha(grey[500], 0.12),
            focus: alpha(grey[500], 0.12),
          },
        }),
  },
  // --- Typography ---
  typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      // Define font sizes, weights etc. if needed
      h4: {
          fontWeight: 500,
      },
      h5: {
          fontWeight: 500,
      },
      h6: {
           fontWeight: 500,
      },
      button: {
          textTransform: 'none', // Keep button text case as defined
          fontWeight: 500,
      }
  },
  // --- Shape ---
  shape: {
      borderRadius: 8, // Slightly more rounded corners globally
  },
  // --- Component Overrides ---
  components: {
      // Example: Default Paper elevation and variant
      MuiPaper: {
          defaultProps: {
              // elevation: 1, // Set default elevation if desired
          },
          styleOverrides: {
              // Example: Apply outline variant globally if preferred
              // root: ({ ownerState, theme }) => ({
              //   ...(ownerState.variant === 'outlined' && {
              //      borderColor: theme.palette.divider,
              //   }),
              // }),
          }
      },
       MuiAlert: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    // Use standard alert styling provided by MUI based on severity
                    // Add custom border/background based on severity
                    ...(ownerState.severity === 'error' && {
                        backgroundColor: theme.palette.error.light, // Use light background from palette
                        color: theme.palette.getContrastText(theme.palette.error.light), // Ensure text contrast
                        border: `1px solid ${alpha(theme.palette.error.main, 0.5)}`,
                    }),
                     ...(ownerState.severity === 'warning' && {
                        backgroundColor: theme.palette.warning.light,
                        color: theme.palette.getContrastText(theme.palette.warning.light),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.5)}`,
                    }),
                     ...(ownerState.severity === 'info' && {
                        backgroundColor: theme.palette.info?.light || alpha(theme.palette.primary.light, 0.1), // Fallback if info not fully defined
                        color: theme.palette.info?.contrastText || theme.palette.text.primary,
                        border: `1px solid ${alpha(theme.palette.info?.main || theme.palette.primary.main, 0.5)}`,
                    }),
                     ...(ownerState.severity === 'success' && {
                        backgroundColor: theme.palette.success.light,
                        color: theme.palette.getContrastText(theme.palette.success.light),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.5)}`,
                    }),
                }),
                standardError: { // Specific overrides for standard variant if needed
                    // backgroundColor: errorLight, ...
                },
                 standardWarning: {},
                 standardInfo: {},
                 standardSuccess: {},
            }
       },
      MuiButton: {
          defaultProps: {
              // disableElevation: true, // Flat buttons by default?
          },
          styleOverrides: {
               root: {
                   // Example: Slightly larger default padding
                   // padding: '8px 16px',
               }
          }
      },
      MuiTextField: {
            defaultProps: {
                variant: 'outlined', // Default variant
                size: 'small', // Default size
            },
      },
      MuiChip: {
          styleOverrides: {
              root: {
                  // Ensure chips don't get too large
                  // maxWidth: 180,
              }
          }
      },
      MuiTooltip: {
          defaultProps: {
              arrow: true, // Add arrow to tooltips by default
          },
      },
       MuiAccordion: {
            defaultProps: {
                 // disableGutters: true, // Remove default spacing if needed
                 elevation: 0, // Default to no shadow
                 variant: 'outlined' // Use outlined variant by default
            },
             styleOverrides: {
                root: ({theme}) => ({
                    // Control border between accordions
                     '&:not(:last-child)': {
                        borderBottom: 0, // Handled by individual accordion outlines
                     },
                     '&:before': { // Remove the default top border line
                         display: 'none',
                     },
                     '&.Mui-expanded': {
                        // margin: 'auto', // Remove default expansion margin if needed
                     },
                    // Slightly rounder corners if desired, matches global shape
                    // borderRadius: theme.shape.borderRadius,
                    // '&:first-of-type': {
                    //     borderTopLeftRadius: theme.shape.borderRadius,
                    //     borderTopRightRadius: theme.shape.borderRadius,
                    // },
                    // '&:last-of-type': {
                    //      borderBottomLeftRadius: theme.shape.borderRadius,
                    //      borderBottomRightRadius: theme.shape.borderRadius,
                    // }
                 }),
             }
       },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    minHeight: 48, // Consistent height
                     '&.Mui-expanded': {
                         minHeight: 48,
                     },
                },
                 content: {
                    margin: '12px 0', // Default vertical margin
                     '&.Mui-expanded': {
                         margin: '12px 0',
                     },
                 }
            }
        }
  },
});

export default getDesignTokens;
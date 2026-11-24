import { createTheme } from '@mui/material/styles'

/**
 * Taste-compliant MUI theme (see ~/.gemini/config/rules/design-kit-taste.md).
 * MUI ships Roboto + purple secondary (#9c27b0) by default — both are overridden here.
 * Copy this file into every MUI app and change the tokens, never delete the overrides.
 */
export const tokens = {
  fontSans: '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
  fontDisplay: '"Instrument Serif", ui-serif, Georgia, serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',
  paper: '#FAF8F4', // warm paper, light by default
  surface: '#FFFFFF',
  ink: '#1C1B19',
  inkMuted: '#5E5A53',
  line: '#E6E1D8',
  primary: '#0F766E', // teal, hue ~180°
  secondary: '#C2410C', // burnt orange, hue ~30°
} as const

export const muiTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: tokens.primary, contrastText: '#FFFFFF' },
    secondary: { main: tokens.secondary, contrastText: '#FFFFFF' },
    background: { default: tokens.paper, paper: tokens.surface },
    text: { primary: tokens.ink, secondary: tokens.inkMuted },
    divider: tokens.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: tokens.fontSans,
    h1: { fontFamily: tokens.fontDisplay, fontWeight: 400 },
    h2: { fontFamily: tokens.fontDisplay, fontWeight: 400 },
    h3: { fontFamily: tokens.fontDisplay, fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: `1px solid ${tokens.line}` } } },
  },
})

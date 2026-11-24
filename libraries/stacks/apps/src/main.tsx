import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material'
import { muiTheme } from './data/themeData'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* enableCssLayer puts MUI styles in @layer mui so Tailwind utilities can override them */}
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
)

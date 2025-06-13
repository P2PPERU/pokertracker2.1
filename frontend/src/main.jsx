// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.jsx'
import './index.css'
import theme from './theme' // 👈 Importar nuestro tema personalizado

// 🔇 Silenciar warnings específicos de defaultProps en desarrollo
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    // Filtrar warnings de defaultProps de react-beautiful-dnd
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('defaultProps') || 
       args[0].includes('Connect(Droppable)'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}> {/* 👈 Aplicar el tema aquí */}
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
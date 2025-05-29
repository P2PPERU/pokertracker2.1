// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.jsx'
import './index.css'
import theme from './theme' // 👈 Importar nuestro tema personalizado

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}> {/* 👈 Aplicar el tema aquí */}
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
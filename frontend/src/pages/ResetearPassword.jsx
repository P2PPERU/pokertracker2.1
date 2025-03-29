// src/pages/ResetearPassword.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
  Box, Input, Button, FormControl, FormLabel, Heading, useToast, Container, Text
} from '@chakra-ui/react'

const ResetearPassword = () => {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    console.log("TOKEN:", token)
  }, [token])

  const handleReset = async () => {
    if (!token) {
      toast({
        title: 'Enlace inválido ❌',
        description: 'El token no fue proporcionado o ha expirado.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
      return
    }

    try {
      await api.post('/auth/resetear-password', { token, nuevaPassword })
      toast({
        title: 'Contraseña actualizada ✅',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Error al cambiar contraseña',
        description: error.response?.data?.error || 'Enlace inválido o expirado.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="md" mt={10}>
      <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
        <Heading size="lg" mb={4} textAlign="center">Nueva contraseña</Heading>
        <Text mb={6} fontSize="sm" color="gray.500" textAlign="center">
          Por favor ingresa tu nueva contraseña. Este enlace expira en 15 minutos.
        </Text>

        <FormControl mb={4}>
          <FormLabel>Escribe tu nueva contraseña</FormLabel>
          <Input
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
          />
        </FormControl>

        <Button colorScheme="teal" width="100%" onClick={handleReset}>
          Cambiar contraseña
        </Button>
      </Box>
    </Container>
  )
}

export default ResetearPassword

// src/pages/RecuperarPassword.jsx
import { useState } from 'react'
import api from '../services/api'
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, useToast } from '@chakra-ui/react'

const RecuperarPassword = () => {
  const [email, setEmail] = useState('')
  const toast = useToast()

  const handleSubmit = async () => {
    try {
      await api.post('/auth/recuperar-password', { email })
      toast({
        title: 'Revisa tu correo 📬',
        description: 'Te enviamos un enlace para recuperar tu contraseña.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error al enviar el correo',
        description: error.response?.data?.error || 'Intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="md" mt={10}>
      <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
        <Heading size="lg" mb={6} textAlign="center">Recuperar contraseña</Heading>

        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>

        <Button colorScheme="teal" width="100%" onClick={handleSubmit}>
          Enviar enlace
        </Button>
      </Box>
    </Container>
  )
}

export default RecuperarPassword

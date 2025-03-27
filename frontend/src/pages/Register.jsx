import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
  Box, Input, Button, FormControl, FormLabel, Heading, useToast, Container
} from '@chakra-ui/react'

const Register = () => {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const handleRegister = async () => {
    try {
      await api.post('/auth/registro', { nombre, email, password })
      toast({
        title: "Registro exitoso 🎉",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: "Error en registro",
        description: error.response?.data?.message || "Revisa los datos e inténtalo nuevamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="md" mt={10}>
      <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
        <Heading size="lg" mb={6} textAlign="center">Registro</Heading>
        
        <FormControl mb={4}>
          <FormLabel>Nombre de usuario</FormLabel>
          <Input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Contraseña</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </FormControl>

        <Button colorScheme="teal" width="100%" onClick={handleRegister}>
          Registrar cuenta
        </Button>
      </Box>
    </Container>
  )
}

export default Register

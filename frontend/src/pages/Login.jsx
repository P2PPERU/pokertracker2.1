import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  Heading,
  useToast,
  Container
} from '@chakra-ui/react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogin = async () => {
    try {
      await login(email, password)
      toast({
        title: "Login exitoso",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.response?.data?.message || "Credenciales incorrectas.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="md" mt={10}>
      <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
        <Heading size="lg" mb={6} textAlign="center">Iniciar sesión</Heading>
        
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

        <Button colorScheme="teal" width="100%" onClick={handleLogin}>
          Entrar
        </Button>
      </Box>
    </Container>
  )
}

export default Login

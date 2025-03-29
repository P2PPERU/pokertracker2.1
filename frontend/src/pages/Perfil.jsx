import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Divider,
  Spinner,
  VStack,
  Badge,
  Button,
  useColorModeValue
} from '@chakra-ui/react'
import api from '../services/api'

const Perfil = () => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await api.get('/auth/perfil')
        setUsuario(res.data.usuario)
      } catch (err) {
        console.error('Error al obtener perfil:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPerfil()
  }, [])

  const bgColor = useColorModeValue('white', 'gray.800')

  if (loading) {
    return (
      <Container maxW="md" mt={10} textAlign="center">
        <Spinner size="xl" />
      </Container>
    )
  }

  return (
    <Container maxW="md" mt={10}>
      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="xl">
        <Heading size="lg" mb={4} textAlign="center">
          Perfil de Usuario
        </Heading>

        <VStack align="start" spacing={3}>
          <Text><strong>Nombre:</strong> {usuario.nombre}</Text>
          <Text><strong>Email:</strong> {usuario.email}</Text>
          <Text><strong>Suscripción:</strong> <Badge colorScheme={
            usuario.suscripcion === 'oro' ? 'yellow' :
            usuario.suscripcion === 'plata' ? 'gray' : 'bronze'
          }>{usuario.suscripcion}</Badge></Text>
          <Text><strong>Fecha de creación:</strong> {new Date(usuario.fecha_creacion).toLocaleDateString()}</Text>
          {/* Si manejas vencimiento en tu modelo, podrías mostrar: */}
          {/* <Text><strong>Válido hasta:</strong> 12/05/2025</Text> */}
        </VStack>

        <Divider my={4} />

        {/* Recomendaciones / mejoras de suscripción */}
        {usuario.suscripcion !== 'oro' && (
          <Box mt={2}>
            <Text mb={2}><strong>¿Quieres más beneficios?</strong></Text>
            <Button colorScheme="teal" onClick={() => window.location.href = '/suscripciones'}>
              Mejora tu suscripción
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default Perfil

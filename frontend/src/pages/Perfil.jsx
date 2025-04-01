import { useEffect, useState } from 'react';
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
  useColorModeValue,
  Icon,
  Flex
} from '@chakra-ui/react';
import { FaCrown, FaClock, FaArrowUp } from 'react-icons/fa';
import api from '../services/api';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await api.get('/auth/perfil');
        setUsuario(res.data.usuario);
      } catch (err) {
        console.error('Error al obtener perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  const bgColor = useColorModeValue('white', 'gray.800');

  if (loading) {
    return (
      <Container maxW="md" mt={10} textAlign="center">
        <Spinner size="xl" />
      </Container>
    );
  }

  const colorBadge = usuario.suscripcion === 'oro'
    ? 'yellow'
    : usuario.suscripcion === 'plata'
    ? 'gray'
    : 'orange';

  const expiro = usuario?.suscripcion_expira && !isNaN(new Date(usuario.suscripcion_expira)) && new Date(usuario.suscripcion_expira) < new Date();
  const fechaExpiracionValida = usuario?.suscripcion_expira && !isNaN(new Date(usuario.suscripcion_expira));

  return (
    <Container maxW="md" mt={10}>
      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="xl">
        <Heading size="lg" mb={4} textAlign="center">
          Perfil de Usuario
        </Heading>

        <VStack align="start" spacing={4} fontSize="md">
          <Text><strong>Nombre:</strong> {usuario.nombre}</Text>
          <Text><strong>Email:</strong> {usuario.email}</Text>

          <Flex align="center" gap={2}>
            <Icon as={FaCrown} color={colorBadge === 'yellow' ? 'yellow.400' : colorBadge === 'gray' ? 'gray.400' : 'orange.400'} />
            <Text><strong>Suscripción:</strong> <Badge colorScheme={colorBadge}>{usuario.suscripcion}</Badge></Text>
          </Flex>

          <Flex align="center" gap={2}>
            <Icon as={FaClock} color={expiro ? 'red.500' : 'green.400'} />
            <Text>
              <strong>Expira el:</strong>{' '}
              <span style={{ color: expiro ? 'red' : 'inherit' }}>
                {fechaExpiracionValida ? new Date(usuario.suscripcion_expira).toLocaleDateString() : 'Sin fecha registrada'}
              </span>
            </Text>
          </Flex>
        </VStack>

        <Divider my={4} />

        {usuario.suscripcion !== 'oro' && (
          <Box mt={2} textAlign="center">
            <Text mb={2} fontWeight="semibold">¿Quieres más beneficios?</Text>
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={FaArrowUp} />}
              onClick={() => window.location.href = '/suscripciones'}
            >
              Mejora tu suscripción
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Perfil;

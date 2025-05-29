import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Icon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Container,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Progress,
  Tooltip
} from '@chakra-ui/react';
import {
  FaUpload,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaDatabase,
  FaInfoCircle,
  FaStar,
  FaDownload
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { gradients, brand } from '../theme/colors';

const AnalisisManos = () => {
  const { auth } = useAuth();
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [misArchivos, setMisArchivos] = useState([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(true);
  const toast = useToast();

  // Colores del tema
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const mainGradient = gradients.main;

  // Verificar que el usuario tenga suscripción VIP
  const esUsuarioVIP = auth && ["plata", "oro"].includes(auth.suscripcion);

  // Cargar archivos del usuario
  const cargarMisArchivos = useCallback(async () => {
    if (!esUsuarioVIP) return;
    
    try {
      setCargandoArchivos(true);
      const response = await api.get('/manos/mis-archivos');
      setMisArchivos(response.data);
    } catch (error) {
      console.error('Error cargando archivos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus archivos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCargandoArchivos(false);
    }
  }, [esUsuarioVIP, toast]);

  useEffect(() => {
    cargarMisArchivos();
  }, [cargarMisArchivos]);

  // Manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setArchivo(null);
      return;
    }

    // Validar tipo de archivo
    const extensionesPermitidas = ['.txt', '.log', '.hh', '.xml'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!extensionesPermitidas.includes(extension)) {
      toast({
        title: 'Archivo no válido',
        description: 'Solo se permiten archivos .txt, .log, .hh, .xml',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      event.target.value = '';
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El archivo no puede superar los 5MB',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      event.target.value = '';
      return;
    }

    setArchivo(file);
  };

  // Subir archivo
  const subirArchivo = async () => {
    if (!archivo) {
      toast({
        title: 'No hay archivo',
        description: 'Por favor selecciona un archivo primero',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubiendo(true);

    try {
      // Leer archivo como texto
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const contenidoArchivo = e.target.result;
          
          const response = await api.post('/manos/subir', {
            nombreArchivo: archivo.name,
            contenidoArchivo: contenidoArchivo
          });

          toast({
            title: 'Archivo subido exitosamente',
            description: response.data.mensaje,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Limpiar formulario y recargar archivos
          setArchivo(null);
          document.getElementById('file-input').value = '';
          cargarMisArchivos();

        } catch (error) {
          console.error('Error subiendo archivo:', error);
          toast({
            title: 'Error al subir archivo',
            description: error.response?.data?.error || 'Error interno',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        } finally {
          setSubiendo(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: 'Error leyendo archivo',
          description: 'No se pudo leer el contenido del archivo',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        setSubiendo(false);
      };

      reader.readAsText(archivo);

    } catch (error) {
      console.error('Error en subir archivo:', error);
      setSubiendo(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener badge de estado
  const obtenerBadgeEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Badge colorScheme="yellow" leftIcon={<FaClock />}>Pendiente</Badge>;
      case 'analizado':
        return <Badge colorScheme="green" leftIcon={<FaCheckCircle />}>Completado</Badge>;
      default:
        return <Badge colorScheme="gray">{estado}</Badge>;
    }
  };

  if (!auth) {
    return (
      <Container maxW="md" mt={10}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Acceso restringido</AlertTitle>
            <AlertDescription>
              Debes iniciar sesión para acceder al análisis de manos.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  if (!esUsuarioVIP) {
    return (
      <Box minH="100vh" bg={pageBg} p={4}>
        <Container maxW="4xl" mx="auto">
          {/* Header */}
          <Box 
            bgGradient={mainGradient}
            borderRadius="xl" 
            py={4} 
            px={6} 
            mb={6}
            boxShadow="lg"
          >
            <Flex justifyContent="space-between" alignItems="center">
              <HStack>
                <Icon as={FaDatabase} color="white" boxSize={5} />
                <Heading size="lg" color="white" fontWeight="bold">
                  Análisis de Manos
                </Heading>
              </HStack>
              
              <Link to="/">
                <HStack 
                  bg="whiteAlpha.200" 
                  p={2} 
                  borderRadius="md" 
                  spacing={2} 
                  _hover={{ bg: "whiteAlpha.300" }}
                >
                  <Text color="white" fontSize="sm">Volver</Text>
                </HStack>
              </Link>  
            </Flex>
          </Box>

          {/* Mensaje de suscripción requerida */}
          <Card>
            <CardBody textAlign="center" p={8}>
              <VStack spacing={4}>
                <Icon as={FaStar} boxSize={12} color="yellow.400" />
                <Heading size="md" color={textColor}>
                  Función Exclusiva para Usuarios VIP
                </Heading>
                <Text color={subtextColor} maxW="md">
                  El análisis personalizado de manos está disponible solo para usuarios con 
                  suscripción Plata y Oro. Nuestro equipo analizará tus manos manualmente 
                  en PokerTracker y te devolverá un reporte detallado.
                </Text>
                <Link to="/suscripciones">
                  <Button
                    size="lg"
                    variant="primary"
                    leftIcon={<FaStar />}
                  >
                    Actualizar Suscripción
                  </Button>
                </Link>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Container maxW="6xl" mx="auto">
        {/* Header */}
        <Box 
          bgGradient={mainGradient}
          borderRadius="xl" 
          py={4} 
          px={6} 
          mb={6}
          boxShadow="lg"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <HStack>
              <Icon as={FaDatabase} color="white" boxSize={5} />
              <Heading size="lg" color="white" fontWeight="bold">
                Análisis de Manos
              </Heading>
              <Badge bg="whiteAlpha.200" color="white">VIP</Badge>
            </HStack>
            
            <Link to="/">
              <HStack 
                bg="whiteAlpha.200" 
                p={2} 
                borderRadius="md" 
                spacing={2} 
                _hover={{ bg: "whiteAlpha.300" }}
              >
                <Text color="white" fontSize="sm">Volver</Text>
              </HStack>
            </Link>
          </Flex>
          
          <Text 
            mt={2}
            color="whiteAlpha.800" 
            fontSize="sm"
          >
            Sube tus archivos de manos y recibe análisis profesional personalizado
          </Text>
        </Box>

        <Flex direction={{ base: "column", lg: "row" }} gap={6}>
          {/* Panel izquierdo - Subir archivo */}
          <Box flex="1">
            <Card>
              <CardHeader>
                <Heading size="md" color={textColor}>
                  <Icon as={FaUpload} mr={2} />
                  Subir Nuevo Archivo
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box fontSize="sm">
                      <Text fontWeight="bold">Formatos aceptados:</Text>
                      <Text>.txt, .log, .hh, .xml (máximo 5MB)</Text>
                    </Box>
                  </Alert>
                  
                  <Input
                    id="file-input"
                    type="file"
                    accept=".txt,.log,.hh,.xml"
                    onChange={handleFileSelect}
                    disabled={subiendo}
                  />
                  
                  {archivo && (
                    <Box 
                      p={3} 
                      bg={useColorModeValue("gray.50", "gray.700")} 
                      borderRadius="md"
                    >
                      <HStack>
                        <Icon as={FaFileAlt} color={brand.primary} />
                        <VStack align="start" spacing={0} flex="1">
                          <Text fontSize="sm" fontWeight="bold">
                            {archivo.name}
                          </Text>
                          <Text fontSize="xs" color={subtextColor}>
                            {(archivo.size / 1024).toFixed(1)} KB
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}
                  
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={subirArchivo}
                    isLoading={subiendo}
                    loadingText="Subiendo..."
                    disabled={!archivo || subiendo}
                    leftIcon={<FaUpload />}
                  >
                    Subir para Análisis
                  </Button>
                  
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box fontSize="sm">
                      <AlertTitle fontSize="sm">Proceso de análisis:</AlertTitle>
                      <AlertDescription>
                        Tu archivo será analizado manualmente por nuestro equipo en PokerTracker. 
                        El tiempo estimado es de 24-48 horas.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Panel derecho - Mis archivos */}
          <Box flex="2">
            <Card>
              <CardHeader>
                <Heading size="md" color={textColor}>
                  <Icon as={FaFileAlt} mr={2} />
                  Mis Archivos Subidos
                </Heading>
              </CardHeader>
              <CardBody>
                {cargandoArchivos ? (
                  <Flex justify="center" p={6}>
                    <Spinner size="lg" color={brand.primary} />
                  </Flex>
                ) : misArchivos.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Icon as={FaFileAlt} boxSize={10} color="gray.400" mb={3} />
                    <Text color={subtextColor}>
                      Aún no has subido ningún archivo
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {misArchivos.map((archivo) => (
                      <Box
                        key={archivo.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                        transition="all 0.2s"
                      >
                        <Flex justify="space-between" align="start" mb={2}>
                          <VStack align="start" spacing={1} flex="1">
                            <Text fontWeight="bold" color={textColor}>
                              {archivo.nombre_archivo}
                            </Text>
                            <HStack spacing={4}>
                              <Text fontSize="sm" color={subtextColor}>
                                Subido: {formatearFecha(archivo.fecha_subida)}
                              </Text>
                              {archivo.fecha_analisis && (
                                <Text fontSize="sm" color={subtextColor}>
                                  Analizado: {formatearFecha(archivo.fecha_analisis)}
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                          {obtenerBadgeEstado(archivo.estado)}
                        </Flex>
                        
                        {archivo.analisis_admin && (
                          <>
                            <Divider my={3} />
                            <Box 
                              p={3} 
                              bg={useColorModeValue("green.50", "green.900")} 
                              borderRadius="md"
                              border="1px solid"
                              borderColor={useColorModeValue("green.200", "green.700")}
                            >
                              <Text fontSize="sm" fontWeight="bold" color="green.600" mb={2}>
                                📊 Análisis Completado:
                              </Text>
                              <Text fontSize="sm" whiteSpace="pre-line">
                                {archivo.analisis_admin}
                              </Text>
                            </Box>
                          </>
                        )}
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default AnalisisManos;
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
  Tooltip,
  Image,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import {
  FaUpload,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaDatabase,
  FaInfoCircle,
  FaStar,
  FaDownload,
  FaWhatsapp,
  FaMoneyBillWave,
  FaTrophy,
  FaUsers,
  FaHandshake,
  FaArrowRight,
  FaPhoneAlt,
  FaGift,
  FaFire,
  FaChartLine,
  FaRocket,
  FaLock,
  FaCrown
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
  const whatsappGreen = "#25D366";
  const goldAccent = "#FFD700";

  // URLs de WhatsApp optimizadas para conversión
  const whatsappUrls = {
    analisis: "https://wa.me/51991351213?text=🎯%20Hola!%20Quiero%20análisis%20profesional%20de%20mis%20manos%20de%20poker",
    clubs: "https://wa.me/51991351213?text=🃏%20Hola!%20Quiero%20info%20sobre%20clubs%20VIP%20con%20rakeback%20alto",
    premium: "https://wa.me/51991351213?text=💎%20Hola!%20Quiero%20suscripción%20Premium%20con%20descuento%20especial",
    apps: "https://wa.me/51991351213?text=📱%20Hola!%20Necesito%20acceso%20a%20las%20mejores%20apps%20de%20poker",
    combo: "https://wa.me/51991351213?text=🔥%20Hola!%20Quiero%20el%20combo%20completo:%20Premium%20+%20Clubs%20+%20Rakeback"
  };

  // Verificar que el usuario tenga suscripción VIP (solo para subir archivos)
  const esUsuarioVIP = auth && ["plata", "oro"].includes(auth.suscripcion);

  // Cargar archivos del usuario (solo si está autenticado y es VIP)
  const cargarMisArchivos = useCallback(async () => {
    if (!esUsuarioVIP) {
      setCargandoArchivos(false);
      return;
    }
    
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
              {esUsuarioVIP && (
                <Badge bg="whiteAlpha.200" color="white">VIP ACTIVO</Badge>
              )}
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
            {esUsuarioVIP 
              ? "Sube tus archivos de manos y recibe análisis profesional personalizado"
              : "Descubre nuestro servicio de análisis profesional de manos"
            }
          </Text>
        </Box>

        {/* Mostrar contenido según el estado del usuario */}
        {!auth ? (
          // Usuario no autenticado - mostrar página promocional
          <VStack spacing={8}>
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>¡Bienvenido al Análisis de Manos!</AlertTitle>
                <AlertDescription>
                  Para subir archivos y acceder a tus análisis personalizados, necesitas una cuenta VIP.
                </AlertDescription>
              </Box>
            </Alert>

            {/* CTA para registro */}
            <Card textAlign="center" p={8} boxShadow="xl">
              <CardBody>
                <VStack spacing={6}>
                  <Icon as={FaRocket} boxSize={20} color={brand.primary} />
                  
                  <Heading size="xl" color={textColor}>
                    ¿Listo para mejorar tu juego?
                  </Heading>
                  
                  <Text color={subtextColor} maxW="lg" mx="auto" fontSize="lg">
                    Regístrate y accede a análisis profesionales que han ayudado a 
                    <Text as="span" color="green.500" fontWeight="bold"> cientos de jugadores a mejorar su winrate</Text>.
                  </Text>

                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => {
                      const event = new CustomEvent("abrir-modal-login");
                      window.dispatchEvent(event);
                    }}
                    rightIcon={<FaArrowRight />}
                  >
                    Registrarse Ahora
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        ) : (
          // Usuarios autenticados (TODOS pueden ver la interfaz, pero solo VIP pueden subir)
          <Flex direction={{ base: "column", lg: "row" }} gap={6}>
            {/* Panel izquierdo - Subir archivo */}
            <Box flex="1">
              <Card>
                <CardHeader>
                  <Heading size="md" color={textColor}>
                    <Icon as={FaUpload} mr={2} />
                    Subir Nuevo Archivo
                    {!esUsuarioVIP && (
                      <Badge ml={2} colorScheme="red" fontSize="xs">
                        REQUIERE VIP
                      </Badge>
                    )}
                  </Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Mostrar alerta para usuarios bronce */}
                    {!esUsuarioVIP && (
                      <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <Box fontSize="sm">
                          <AlertTitle fontSize="sm">Suscripción VIP requerida</AlertTitle>
                          <AlertDescription>
                            Para subir archivos y recibir análisis profesionales, necesitas una suscripción Plata u Oro.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}
                    
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
                      disabled={subiendo || !esUsuarioVIP}
                      opacity={!esUsuarioVIP ? 0.6 : 1}
                    />
                    
                    {archivo && esUsuarioVIP && (
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
                    
                    {esUsuarioVIP ? (
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
                    ) : (
                      <Button
                        size="lg"
                        colorScheme="blue"
                        disabled
                        leftIcon={<FaLock />}
                        opacity={0.6}
                      >
                        Subir para Análisis (VIP)
                      </Button>
                    )}
                    
                    <Alert status={esUsuarioVIP ? "warning" : "info"} borderRadius="md">
                      <AlertIcon />
                      <Box fontSize="sm">
                        <AlertTitle fontSize="sm">
                          {esUsuarioVIP ? "Proceso de análisis:" : "¿Cómo funciona?"}
                        </AlertTitle>
                        <AlertDescription>
                          {esUsuarioVIP 
                            ? "Tu archivo será analizado manualmente por nuestro equipo en PokerTracker. El tiempo estimado es de 24-48 horas."
                            : "Con una suscripción VIP, nuestro equipo analizará tus manos manualmente y te dará recomendaciones específicas para mejorar."
                          }
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    {/* CTA para upgrade si es bronce */}
                    {!esUsuarioVIP && (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <Button
                          as={Link}
                          to="/suscripciones"
                          colorScheme="blue"
                          leftIcon={<FaCrown />}
                          size="sm"
                        >
                          Ver Planes VIP
                        </Button>
                        
                        <Button
                          as="a"
                          href={whatsappUrls.premium}
                          target="_blank"
                          colorScheme="green"
                          leftIcon={<FaWhatsapp />}
                          size="sm"
                        >
                          Contactar por WhatsApp
                        </Button>
                      </SimpleGrid>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* CTA para más servicios */}
              <Card mt={6} bg="linear-gradient(135deg, #FF6B35, #F7931E)" color="white">
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <Icon as={FaGift} boxSize={8} />
                    <Heading size="md" textAlign="center">
                      {esUsuarioVIP 
                        ? "¿Quieres maximizar tus ganancias aún más?"
                        : "¡Aprovecha nuestra oferta completa!"
                      }
                    </Heading>
                    <Text textAlign="center" fontSize="sm">
                      {esUsuarioVIP
                        ? "Accede a clubs VIP con rakeback hasta 55% y paga tu premium con las comisiones."
                        : "Suscripción VIP + Clubs VIP + Rakeback hasta 55%. ¡Se paga solo!"
                      }
                    </Text>
                    <Button
                      as="a"
                      href={esUsuarioVIP ? whatsappUrls.clubs : whatsappUrls.combo}
                      target="_blank"
                      bg="white"
                      color="orange.500"
                      leftIcon={<FaWhatsapp />}
                      _hover={{ bg: "whiteAlpha.900" }}
                    >
                      {esUsuarioVIP ? "Ver Clubs Disponibles" : "Ver Oferta Completa"}
                    </Button>
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
                    {!esUsuarioVIP && (
                      <Badge ml={2} colorScheme="orange" fontSize="xs">
                        DISPONIBLE CON VIP
                      </Badge>
                    )}
                  </Heading>
                </CardHeader>
                <CardBody>
                  {!esUsuarioVIP ? (
                    // Vista para usuarios bronce
                    <Box textAlign="center" py={8}>
                      <Icon as={FaLock} boxSize={16} color="gray.400" mb={4} />
                      <Heading size="md" color={textColor} mb={4}>
                        Funcionalidad VIP
                      </Heading>
                      <Text color={subtextColor} mb={6} maxW="md" mx="auto">
                        Con una suscripción VIP podrás subir archivos, ver tu historial de análisis 
                        y acceder a recomendaciones profesionales personalizadas.
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} maxW="sm" mx="auto">
                        <Button
                          as={Link}
                          to="/suscripciones"
                          colorScheme="blue"
                          leftIcon={<FaCrown />}
                        >
                          Upgrade a VIP
                        </Button>
                        
                        <Button
                          as="a"
                          href={whatsappUrls.premium}
                          target="_blank"
                          colorScheme="green"
                          leftIcon={<FaWhatsapp />}
                        >
                          Contactar
                        </Button>
                      </SimpleGrid>
                    </Box>
                  ) : cargandoArchivos ? (
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
        )}

        {/* Sección promocional para todos (al final) */}
        <Box mt={12}>
          <Card textAlign="center" p={8} boxShadow="xl" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
            <CardBody>
              <VStack spacing={6}>
                <Icon as={FaWhatsapp} boxSize={20} color={whatsappGreen} />
                
                <Heading size="xl">
                  ¿Quieres análisis profesional inmediato?
                </Heading>
                
                <Text maxW="lg" mx="auto" fontSize="lg" opacity={0.9}>
                  Contacta con nuestro equipo de expertos para análisis personalizado y 
                  acceso a clubs VIP con rakeback hasta 55%.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full" maxW="4xl">
                  <Button
                    as="a"
                    href={whatsappUrls.analisis}
                    target="_blank"
                    size="lg"
                    bg="white"
                    color="gray.800"
                    leftIcon={<FaWhatsapp />}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  >
                    Análisis de Manos
                  </Button>
                  
                  <Button
                    as="a"
                    href={whatsappUrls.clubs}
                    target="_blank"
                    size="lg"
                    bg="white"
                    color="gray.800"
                    leftIcon={<FaWhatsapp />}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  >
                    Clubs VIP
                  </Button>
                  
                  <Button
                    as="a"
                    href={whatsappUrls.combo}
                    target="_blank"
                    size="lg"
                    bg={goldAccent}
                    color="black"
                    leftIcon={<FaWhatsapp />}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  >
                    Combo Completo 🔥
                  </Button>
                </SimpleGrid>

                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" color={whatsappGreen}>
                    📱 +51 991 351 213
                  </Text>
                  <Text fontSize="sm" opacity={0.8}>
                    ✅ Respuesta en menos de 5 minutos • 🎯 Atención personalizada
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default AnalisisManos;
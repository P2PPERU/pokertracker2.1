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
  FaRocket
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

  // PÁGINA PARA USUARIOS NO VIP - OPTIMIZADA PARA CONVERSIÓN
  if (!esUsuarioVIP) {
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
                <Icon as={FaRocket} color="white" boxSize={5} />
                <Heading size="lg" color="white" fontWeight="bold">
                  Análisis Profesional de Manos
                </Heading>
                <Badge bg="red.500" color="white" px={2} py={1} borderRadius="full">
                  🔥 HOT
                </Badge>
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

          {/* Hero Section Principal */}
          <Card mb={8} overflow="hidden" position="relative" boxShadow="2xl">
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              right="0" 
              height="6px" 
              bgGradient="linear(to-r, #FFD700, #FF6B35, #FF0080)"
            />
            <CardBody p={8}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="center">
                <VStack align="start" spacing={6}>
                  <HStack>
                    <Badge 
                      bg={goldAccent} 
                      color="black" 
                      px={4} 
                      py={2} 
                      borderRadius="full"
                      fontSize="md"
                      fontWeight="bold"
                    >
                      🏆 SERVICIO PREMIUM EXCLUSIVO
                    </Badge>
                    <Badge bg="red.500" color="white" px={3} py={1} borderRadius="full">
                      LIMITADO
                    </Badge>
                  </HStack>
                  
                  <Heading size="2xl" color={textColor} lineHeight="1.1">
                    Análisis Profesional
                    <Text as="span" bgGradient="linear(to-r, #FF6B35, #F7931E)" bgClip="text"> 
                      {" "}de Manos por Expertos
                    </Text>
                  </Heading>
                  
                  <Text fontSize="xl" color={subtextColor} lineHeight="1.6" fontWeight="medium">
                    Nuestro equipo de profesionales <strong>analizará tus manos manualmente</strong> 
                    en PokerTracker y te dará recomendaciones específicas para 
                    <Text as="span" color="green.500" fontWeight="bold"> maximizar tus ganancias</Text>.
                  </Text>

                  {/* Stats impactantes */}
                  <SimpleGrid columns={3} spacing={4} w="full">
                    <Stat 
                      textAlign="center" 
                      p={4} 
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                      borderRadius="xl"
                      color="white"
                      boxShadow="lg"
                    >
                      <StatNumber fontSize="2xl">+47%</StatNumber>
                      <StatLabel fontSize="xs">Mejora winrate</StatLabel>
                    </Stat>
                    <Stat 
                      textAlign="center" 
                      p={4} 
                      bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" 
                      borderRadius="xl"
                      color="white"
                      boxShadow="lg"
                    >
                      <StatNumber fontSize="2xl">24h</StatNumber>
                      <StatLabel fontSize="xs">Tiempo entrega</StatLabel>
                    </Stat>
                    <Stat 
                      textAlign="center" 
                      p={4} 
                      bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" 
                      borderRadius="xl"
                      color="white"
                      boxShadow="lg"
                    >
                      <StatNumber fontSize="2xl">500+</StatNumber>
                      <StatLabel fontSize="xs">Clientes felices</StatLabel>
                    </Stat>
                  </SimpleGrid>

                  {/* CTA Principal WhatsApp - MÁS LLAMATIVO */}
                  <VStack spacing={4} w="full">
                    <Button
                      as="a"
                      href={whatsappUrls.analisis}
                      target="_blank"
                      size="xl"
                      bg={whatsappGreen}
                      color="white"
                      leftIcon={<FaWhatsapp size="24px" />}
                      rightIcon={<FaArrowRight />}
                      _hover={{
                        bg: "#1DA851",
                        transform: "translateY(-3px)",
                        boxShadow: "2xl"
                      }}
                      w="full"
                      py={8}
                      fontSize="xl"
                      fontWeight="bold"
                      borderRadius="full"
                      boxShadow="xl"
                      _active={{
                        transform: "translateY(-1px)"
                      }}
                      transition="all 0.2s"
                    >
                      💬 Solicitar Análisis AHORA
                    </Button>
                    
                    <HStack spacing={4} fontSize="sm" color={subtextColor}>
                      <Text>✅ Respuesta en 5 min</Text>
                      <Text>✅ Análisis en 24h</Text>
                      <Text>✅ Desde $19.99</Text>
                    </HStack>
                  </VStack>
                </VStack>

                {/* Imagen/Testimonio */}
                <Box position="relative">
                  <Box 
                    h="400px" 
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                    borderRadius="2xl" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    position="relative"
                    overflow="hidden"
                    boxShadow="2xl"
                  >
                    <Icon as={FaTrophy} boxSize={24} color="white" opacity={0.3} />
                    
                    {/* Testimonio flotante */}
                    <Box 
                      position="absolute"
                      bottom="20px"
                      left="20px"
                      right="20px"
                      bg="white"
                      p={4}
                      borderRadius="xl"
                      boxShadow="2xl"
                      border="2px solid"
                      borderColor="yellow.400"
                    >
                      <HStack mb={2}>
                        {[1,2,3,4,5].map(i => (
                          <Icon key={i} as={FaStar} color="yellow.400" boxSize={4} />
                        ))}
                      </HStack>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        "Mi winrate subió de 2bb/100 a 8bb/100 en NL50 después del análisis"
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" color={brand.primary}>
                        - Carlos M., NL50 Regular
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Sección Clubs y Apps VIP - MEJORADA */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
            {/* Clubs VIP */}
            <Card overflow="hidden" position="relative" boxShadow="xl" _hover={{ transform: "translateY(-5px)" }} transition="all 0.3s">
              <Box 
                position="absolute" 
                top="0" 
                left="0" 
                right="0" 
                height="5px" 
                bg="linear-gradient(90deg, #FF6B35, #F7931E)"
              />
              <CardHeader pb={2}>
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FaUsers} color="orange.500" boxSize={6} />
                    <Heading size="md">Clubs VIP Exclusivos</Heading>
                  </HStack>
                  <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                    🔥 HOT
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="start" spacing={4}>
                  <Text color={subtextColor} fontWeight="medium">
                    Accede a los clubs más <strong>soft</strong> con <Text as="span" color="green.500" fontWeight="bold">rakeback hasta 65%</Text> 
                    {" "}y mesas llenas de recreacionales.
                  </Text>
                  
                  <SimpleGrid columns={2} spacing={3} w="full">
                    <HStack>
                      <Icon as={FaMoneyBillWave} color="green.500" />
                      <Text fontSize="sm">Rakeback 45-65%</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaTrophy} color="gold" />
                      <Text fontSize="sm">Freerolls VIP</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaHandshake} color="blue.500" />
                      <Text fontSize="sm">Soporte 24/7</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaChartLine} color="purple.500" />
                      <Text fontSize="sm">Mesas soft</Text>
                    </HStack>
                  </SimpleGrid>

                  <Button
                    as="a"
                    href={whatsappUrls.clubs}
                    target="_blank"
                    colorScheme="orange"
                    leftIcon={<FaWhatsapp />}
                    rightIcon={<FaArrowRight />}
                    w="full"
                    py={6}
                    fontWeight="bold"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  >
                    Ver Clubs Disponibles
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Apps Premium */}
            <Card overflow="hidden" position="relative" boxShadow="xl" _hover={{ transform: "translateY(-5px)" }} transition="all 0.3s">
              <Box 
                position="absolute" 
                top="0" 
                left="0" 
                right="0" 
                height="5px" 
                bg="linear-gradient(90deg, #667eea, #764ba2)"
              />
              <CardHeader pb={2}>
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FaPhoneAlt} color="purple.500" boxSize={6} />
                    <Heading size="md">Apps Premium</Heading>
                  </HStack>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                    💎 VIP
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="start" spacing={4}>
                  <Text color={subtextColor} fontWeight="medium">
                    Las mejores apps de poker con <strong>acción garantizada 24/7</strong> 
                    {" "}y el rake más bajo del mercado.
                  </Text>
                  
                  <SimpleGrid columns={2} spacing={3} w="full">
                    <HStack>
                      <Icon as={FaStar} color="yellow.400" />
                      <Text fontSize="sm">Mesas activas</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaGift} color="pink.500" />
                      <Text fontSize="sm">Bonos VIP</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaCheckCircle} color="green.500" />
                      <Text fontSize="sm">Retiros rápidos</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaFire} color="red.500" />
                      <Text fontSize="sm">Rake bajo</Text>
                    </HStack>
                  </SimpleGrid>

                  <Button
                    as="a"
                    href={whatsappUrls.apps}
                    target="_blank"
                    colorScheme="purple"
                    leftIcon={<FaWhatsapp />}
                    rightIcon={<FaArrowRight />}
                    w="full"
                    py={6}
                    fontWeight="bold"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  >
                    Solicitar Acceso VIP
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* MEGA OFERTA COMBO - NUEVA SECCIÓN */}
          <Card 
            bg="linear-gradient(135deg, #FF0080 0%, #FF8C42 50%, #FFD700 100%)" 
            color="white" 
            mb={8}
            overflow="hidden"
            position="relative"
            boxShadow="2xl"
          >
            <Box 
              position="absolute"
              top="-50%"
              right="-20%"
              width="300px"
              height="300px"
              borderRadius="full"
              bg="whiteAlpha.100"
            />
            <Box 
              position="absolute"
              bottom="-30%"
              left="-15%"
              width="200px"
              height="200px"
              borderRadius="full"
              bg="whiteAlpha.100"
            />
            <CardBody p={8} position="relative">
              <VStack spacing={6} textAlign="center">
                <HStack justify="center" spacing={4}>
                  <Badge bg="white" color="red.500" px={4} py={2} borderRadius="full" fontSize="lg" fontWeight="bold">
                    🔥 OFERTA LIMITADA
                  </Badge>
                  <Badge bg="yellow.400" color="black" px={4} py={2} borderRadius="full" fontSize="lg" fontWeight="bold">
                    70% DESC
                  </Badge>
                </HStack>
                
                <Heading size="2xl" textAlign="center">
                  COMBO COMPLETO
                  <Text>Premium + Clubs + Rakeback</Text>
                </Heading>
                
                <Text fontSize="xl" opacity={0.95} maxW="2xl" mx="auto">
                  🎯 La oferta más completa del mercado: Suscripción Premium + Acceso a Clubs VIP + Rakeback hasta 65%
                  <Text as="span" fontWeight="bold"> ¡Y pagas solo con las ganancias del rakeback!</Text>
                </Text>

                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
                  <VStack>
                    <Icon as={FaRocket} boxSize={8} />
                    <Text fontWeight="bold">Análisis IA Ilimitado</Text>
                  </VStack>
                  <VStack>
                    <Icon as={FaMoneyBillWave} boxSize={8} />
                    <Text fontWeight="bold">Rakeback 65%</Text>
                  </VStack>
                  <VStack>
                    <Icon as={FaUsers} boxSize={8} />
                    <Text fontWeight="bold">Clubs Exclusivos</Text>
                  </VStack>
                  <VStack>
                    <Icon as={FaHandshake} boxSize={8} />
                    <Text fontWeight="bold">Soporte VIP</Text>
                  </VStack>
                </SimpleGrid>

                <Box textAlign="center">
                  <Text fontSize="xl" textDecoration="line-through" opacity={0.7}>
                    Valor normal: $99.97/mes
                  </Text>
                  <Text fontSize="5xl" fontWeight="bold" lineHeight="1">
                    $29.99/mes
                  </Text>
                  <Text fontSize="lg" opacity={0.9}>
                    🎁 Se paga solo con rakeback - ¡GANANCIA NETA!
                  </Text>
                </Box>

                <Button
                  as="a"
                  href={whatsappUrls.combo}
                  target="_blank"
                  size="xl"
                  bg="white"
                  color="red.500"
                  leftIcon={<FaWhatsapp size="24px" />}
                  rightIcon={<FaArrowRight />}
                  _hover={{
                    bg: "whiteAlpha.900",
                    transform: "translateY(-3px)",
                    boxShadow: "2xl"
                  }}
                  py={8}
                  px={12}
                  fontSize="xl"
                  fontWeight="bold"
                  borderRadius="full"
                >
                  🔥 ACTIVAR COMBO AHORA
                </Button>

                <Text fontSize="sm" opacity={0.8}>
                  ⏰ Oferta válida solo por tiempo limitado - Solo 20 cupos disponibles
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Call to Action Final */}
          <Card textAlign="center" p={8} boxShadow="xl">
            <CardBody>
              <VStack spacing={6}>
                <Icon as={FaWhatsapp} boxSize={20} color={whatsappGreen} />
                
                <Heading size="xl" color={textColor}>
                  ¿Listo para ser un jugador EV+?
                </Heading>
                
                <Text color={subtextColor} maxW="lg" mx="auto" fontSize="lg">
                  Únete a <strong>cientos de jugadores</strong> que ya están ganando más con nuestro sistema completo.
                  <Text color="green.500" fontWeight="bold">¡El 87% de nuestros clientes mejora su winrate en 30 días!</Text>
                </Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full" maxW="4xl">
                  <Button
                    as="a"
                    href={whatsappUrls.analisis}
                    target="_blank"
                    size="lg"
                    colorScheme="green"
                    leftIcon={<FaWhatsapp />}
                    py={6}
                  >
                    Análisis de Manos
                  </Button>
                  
                  <Button
                    as="a"
                    href={whatsappUrls.clubs}
                    target="_blank"
                    size="lg"
                    colorScheme="orange"
                    leftIcon={<FaWhatsapp />}
                    py={6}
                  >
                    Clubs VIP
                  </Button>
                  
                  <Button
                    as="a"
                    href={whatsappUrls.combo}
                    target="_blank"
                    size="lg"
                    bg="linear-gradient(135deg, #FF0080, #FF8C42)"
                    color="white"
                    leftIcon={<FaWhatsapp />}
                    py={6}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "xl"
                    }}
                  >
                    Combo Completo 🔥
                  </Button>
                </SimpleGrid>

                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" color={whatsappGreen}>
                    📱 +51 991 351 213
                  </Text>
                  <Text fontSize="sm" color={subtextColor}>
                    ✅ Respuesta en menos de 5 minutos • 🎯 Atención personalizada
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  // RESTO DEL CÓDIGO PARA USUARIOS VIP (sin cambios mayores)
  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Container maxW="6xl" mx="auto">
        {/* Header para usuarios VIP */}
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
              <Badge bg="whiteAlpha.200" color="white">VIP ACTIVO</Badge>
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

            {/* CTA para más servicios - Solo para usuarios VIP */}
            <Card mt={6} bg="linear-gradient(135deg, #FF6B35, #F7931E)" color="white">
              <CardBody p={6}>
                <VStack spacing={4}>
                  <Icon as={FaGift} boxSize={8} />
                  <Heading size="md" textAlign="center">
                    ¿Quieres maximizar tus ganancias aún más?
                  </Heading>
                  <Text textAlign="center" fontSize="sm">
                    Accede a clubs VIP con rakeback hasta 65% y paga tu premium con las comisiones.
                  </Text>
                  <Button
                    as="a"
                    href={whatsappUrls.clubs}
                    target="_blank"
                    bg="white"
                    color="orange.500"
                    leftIcon={<FaWhatsapp />}
                    _hover={{ bg: "whiteAlpha.900" }}
                  >
                    Ver Clubs Disponibles
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
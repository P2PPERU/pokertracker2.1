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
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  FormErrorMessage

} from '@chakra-ui/react';
import {
  FaUpload,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaDatabase,
  FaWhatsapp,
  FaGift,
  FaRocket,
  FaLock,
  FaCrown,
  FaEye,
  FaRobot,
  FaUser,
  FaEnvelope,
  FaGamepad,
  FaStar,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { gradients, brand } from '../theme/colors';
import { keyframes } from '@emotion/react';

// Componente Banner Marquee Animado
const MarqueeBanner = () => {
  const messages = [
    {
      icon: FaWhatsapp,
      text: "¿Quieres análisis profesional inmediato? Contacta con nuestro equipo",
      color: "#25D366"
    },
    {
      icon: FaChartLine,
      text: "Análisis personalizado de tus manos",
      color: "#4066ED"
    },
    {
      icon: FaUsers,
      text: "Clubs VIP con rakeback 55%",
      color: "#FFD700"
    },
    {
      icon: FaStar,
      text: "¡Mejora tu juego con estadísticas avanzadas!",
      color: "#FF6B6B"
    }
  ];

  const whatsappUrl = "https://wa.me/51991351213?text=🔥%20Hola!%20Quiero%20el%20combo%20completo:%20Premium%20+%20Clubs%20+%20Rakeback";

  return (
    <Box
      as="a"
      href={whatsappUrl}
      target="_blank"
      bg="linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)"
      color="white"
      py={3}
      overflow="hidden"
      position="relative"
      boxShadow="0 4px 15px rgba(0,0,0,0.1)"
      borderRadius="lg"
      mb={6}
      cursor="pointer"
      _hover={{ 
        transform: "scale(1.02)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
      }}
      transition="all 0.3s ease"
      textDecoration="none"
      display="block"
    >
      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          
          .marquee-content {
            animation: marquee 15s linear infinite;
            white-space: nowrap;
            display: flex;
            align-items: center;
          }
          
          .pulse-icon {
            animation: pulse 2s ease-in-out infinite;
          }
        `}
      </style>
      
      {/* Efecto shimmer de fondo */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        background="linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
        sx={{
          animation: 'shimmer 2s infinite linear'
        }}
      />
      
      <Box className="marquee-content" position="relative" zIndex="1">
        <HStack spacing={8} align="center" minW="max-content">
          {messages.map((message, index) => (
            <HStack key={index} spacing={3} minW="fit-content">
              <Icon 
                as={message.icon} 
                boxSize={5} 
                color={message.color}
                className="pulse-icon"
                filter="drop-shadow(0 0 5px rgba(255,255,255,0.3))"
              />
              <Text 
                fontSize="md" 
                fontWeight="600"
                textShadow="0 1px 3px rgba(0,0,0,0.3)"
                minW="fit-content"
              >
                {message.text}
              </Text>
              <Box 
                w="2px" 
                h="20px" 
                bg="whiteAlpha.600" 
                borderRadius="full"
                mx={4}
              />
            </HStack>
          ))}
          
          {/* Texto de acción destacado */}
          <HStack spacing={3} minW="fit-content" px={4}>
            <Icon as={FaWhatsapp} boxSize={6} color="#25D366" className="pulse-icon" />
            <Text fontSize="lg" fontWeight="bold" color="#FFD700" minW="fit-content">
              🔥 CLICK AQUÍ para COMBO COMPLETO 🔥
            </Text>
          </HStack>

          <Text fontSize="sm" fontWeight="bold" color="#25D366" minW="fit-content" px={4}>
            📱 +51 991 351 213 • ✅ Respuesta en 5 min
          </Text>
          
          {/* Repetimos los mensajes para que no haya espacios vacíos */}
          {messages.map((message, index) => (
            <HStack key={`repeat-${index}`} spacing={3} minW="fit-content">
              <Box 
                w="2px" 
                h="20px" 
                bg="whiteAlpha.600" 
                borderRadius="full"
                mx={4}
              />
              <Icon 
                as={message.icon} 
                boxSize={5} 
                color={message.color}
                className="pulse-icon"
                filter="drop-shadow(0 0 5px rgba(255,255,255,0.3))"
              />
              <Text 
                fontSize="md" 
                fontWeight="600"
                textShadow="0 1px 3px rgba(0,0,0,0.3)"
                minW="fit-content"
              >
                {message.text}
              </Text>
            </HStack>
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

const AnalisisManos = () => {
  // ✅ TODOS LOS HOOKS AL PRINCIPIO - ORDEN FIJO Y SIEMPRE LOS MISMOS
  const { auth } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Estados del componente - TODOS declarados siempre
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [misArchivos, setMisArchivos] = useState([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  
  // Estados del formulario - TODOS declarados siempre
  const [formData, setFormData] = useState({
    email: '',
    sala: '',
    nick: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // TODOS los hooks de color - SIEMPRE en el mismo orden
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  
  // ✅ HOOKS PARA EL MODAL - Declarados aquí para evitar orden condicional
  const modalBg = useColorModeValue("blue.50", "blue.900");
  const modalBorderColor = useColorModeValue("blue.200", "blue.700");
  const modalTextColor = useColorModeValue("gray.700", "gray.300");
  
  // ✅ HOOKS ADICIONALES para evitar ejecución condicional
  const grayBg = useColorModeValue("gray.50", "gray.700");
  const grayBorderColor = useColorModeValue("gray.200", "gray.600");
  const grayHoverBg = useColorModeValue("gray.50", "gray.700");

  // Variables calculadas DESPUÉS de todos los hooks
  const esUsuarioVIP = auth && ["plata", "oro"].includes(auth?.suscripcion);
  const mainGradient = gradients.main;
  const whatsappGreen = "#25D366";
  const goldAccent = "#FFD700";

  // URLs de WhatsApp
  const whatsappUrls = {
    analisis: "https://wa.me/51991351213?text=🎯%20Hola!%20Quiero%20análisis%20profesional%20de%20mis%20manos%20de%20poker",
    clubs: "https://wa.me/51991351213?text=🃏%20Hola!%20Quiero%20info%20sobre%20clubs%20VIP%20con%20rakeback%20alto",
    premium: "https://wa.me/51991351213?text=💎%20Hola!%20Quiero%20suscripción%20Premium%20con%20descuento%20especial",
    apps: "https://wa.me/51991351213?text=📱%20Hola!%20Necesito%20acceso%20a%20las%20mejores%20apps%20de%20poker",
    combo: "https://wa.me/51991351213?text=🔥%20Hola!%20Quiero%20el%20combo%20completo:%20Premium%20+%20Clubs%20+%20Rakeback"
  };

  // Función para cargar archivos - useCallback SIEMPRE se ejecuta
  const cargarMisArchivos = useCallback(async () => {
    // La lógica condicional va DENTRO de la función
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
  }, [esUsuarioVIP, toast]); // Dependencias correctas

  // Effect para cargar archivos - SIEMPRE se ejecuta
  useEffect(() => {
    cargarMisArchivos();
  }, [cargarMisArchivos]);

  // TODAS las funciones después de todos los hooks
  const openAnalysisModal = (analisis) => {
    setSelectedAnalysis(analisis);
    onOpen();
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }
    
    if (!formData.sala.trim()) {
      errors.sala = 'La sala es obligatoria';
    }
    
    if (!formData.nick.trim()) {
      errors.nick = 'El nick del jugador es obligatorio';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const subirArchivoConFormulario = async () => {
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

    if (!validateForm()) {
      toast({
        title: 'Formulario incompleto',
        description: 'Por favor completa todos los campos obligatorios',
        status: 'error',
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
            contenidoArchivo: contenidoArchivo,
            email: formData.email,
            sala: formData.sala,
            nick: formData.nick
          });

          toast({
            title: 'Archivo subido exitosamente',
            description: `${response.data.mensaje} Se enviará el análisis a ${formData.email}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Limpiar formulario y archivo
          setArchivo(null);
          setFormData({ email: '', sala: '', nick: '' });
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

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerBadgeEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return (
          <HStack spacing={1}>
            <Icon as={FaClock} boxSize={3} />
            <Badge colorScheme="yellow" px={2} py={1}>Pendiente</Badge>
          </HStack>
        );
      case 'analizado':
        return (
          <HStack spacing={1}>
            <Icon as={FaCheckCircle} boxSize={3} />
            <Badge colorScheme="green" px={2} py={1}>Completado</Badge>
          </HStack>
        );
      default:
        return <Badge colorScheme="gray" px={2} py={1}>{estado}</Badge>;
    }
  };

  const getAnalysisPreview = (analisis) => {
    if (!analisis) return "Análisis no disponible";
    
    const lines = analisis.split('\n').filter(line => line.trim());
    if (lines.length === 0) return "Análisis completado";
    
    const meaningfulLine = lines.find(line => 
      line.length > 20 && 
      !line.includes('🎯') && 
      !line.includes('Informe sobre')
    );
    
    if (meaningfulLine) {
      return meaningfulLine.length > 80 ? 
        meaningfulLine.substring(0, 80) + "..." : 
        meaningfulLine;
    }
    
    return "Análisis de poker completado - Click para ver detalles";
  };

  // TODOS los renders condicionales VAN AL FINAL, después de todos los hooks
  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Container maxW="6xl" mx="auto">
        {/* Header */}
        <Box 
          bgGradient={mainGradient}
          borderRadius="xl" 
          py={4} 
          px={6} 
          mb={4}
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

        {/* Banner promocional animado horizontal - REEMPLAZADO */}
        <MarqueeBanner />

        {/* Modal para análisis completo */}
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
          <ModalOverlay bg="blackAlpha.800" />
          <ModalContent maxH="90vh">
            <ModalHeader>
              <HStack spacing={3}>
                <Icon as={FaEye} color="blue.500" />
                <Text>Análisis Detallado</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box 
                bg={modalBg} 
                p={6} 
                borderRadius="lg"
                border="1px solid"
                borderColor={modalBorderColor}
              >
                <VStack align="start" spacing={4}>
                  <HStack spacing={2}>
                    <Icon as={FaRobot} color="blue.600" />
                    <Text fontWeight="bold" color="blue.600" fontSize="lg">
                      Análisis Profesional de Manos
                    </Text>
                  </HStack>
                  
                  <Divider />
                  
                  <Text 
                    fontSize="md" 
                    lineHeight="1.8" 
                    whiteSpace="pre-wrap"
                    color={modalTextColor}
                  >
                    {selectedAnalysis}
                  </Text>
                </VStack>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Contenido principal */}
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
                    rightIcon={<FaRocket />}
                  >
                    Registrarse Ahora
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        ) : (
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

                    {/* Formulario obligatorio */}
                    {esUsuarioVIP && (
                      <Box bg={sectionBg} p={4} borderRadius="md">
                        <Text fontWeight="bold" mb={3} color={textColor}>
                          📋 Información del Jugador (Obligatorio)
                        </Text>
                        
                        <VStack spacing={3}>
                          <FormControl isInvalid={!!formErrors.email}>
                            <FormLabel>
                              <Icon as={FaEnvelope} mr={1} />
                              Correo Electrónico
                            </FormLabel>
                            <Input
                              type="email"
                              placeholder="tu@email.com"
                              value={formData.email}
                              onChange={(e) => handleFormChange('email', e.target.value)}
                            />
                            <FormErrorMessage>{formErrors.email}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!formErrors.sala}>
                            <FormLabel>
                              <Icon as={FaGamepad} mr={1} />
                              Sala de Poker
                            </FormLabel>
                            <Select
                              placeholder="Selecciona tu sala"
                              value={formData.sala}
                              onChange={(e) => handleFormChange('sala', e.target.value)}
                            >
                              <option value="pokerstars">PokerStars</option>
                              <option value="X-Poker">X-Poker</option>
                              <option value="ggpoker">GGPoker</option>
                              <option value="partypoker">PartyPoker</option>
                              <option value="888poker">888poker</option>
                              <option value="winamax">Winamax</option>
                              <option value="ignition">Ignition</option>
                              <option value="bovada">Bovada</option>
                              <option value="acr">Americas Cardroom</option>
                              <option value="PPPoker">PPPoker</option>
                              <option value="Suprema">Suprema</option>
                              <option value="otros">Otros</option>
                            </Select>
                            <FormErrorMessage>{formErrors.sala}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!formErrors.nick}>
                            <FormLabel>
                              <Icon as={FaUser} mr={1} />
                              Nick del Jugador
                            </FormLabel>
                            <Input
                              placeholder="Tu nickname en la sala"
                              value={formData.nick}
                              onChange={(e) => handleFormChange('nick', e.target.value)}
                            />
                            <FormErrorMessage>{formErrors.nick}</FormErrorMessage>
                          </FormControl>
                        </VStack>
                      </Box>
                    )}
                    
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
                        bg={grayBg} 
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

                    {/* Formatos aceptados */}
                    {esUsuarioVIP && (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box fontSize="sm">
                          <Text fontWeight="bold">Formatos aceptados:</Text>
                          <Text>.txt, .log, .hh, .xml (máximo 5MB)</Text>
                        </Box>
                      </Alert>
                    )}
                    
                    {esUsuarioVIP ? (
                      <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={subirArchivoConFormulario}
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
                            ? "Tu archivo será analizado manualmente por nuestro equipo en PokerTracker. El análisis se enviará a tu correo en 24-48 horas."
                            : "Con una suscripción VIP, nuestro equipo analizará tus manos manualmente y te dará recomendaciones específicas para mejorar."
                          }
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
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
                          borderColor={grayBorderColor}
                          _hover={{ bg: grayHoverBg }}
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
                              <Box bg={sectionBg} p={4} borderRadius="md">
                                <HStack spacing={2} mb={2}>
                                  <Icon as={FaRobot} color="green.500" boxSize={4} />
                                  <Text fontWeight="semibold" color="green.600">
                                    Análisis Completado:
                                  </Text>
                                </HStack>
                                
                                <Text fontSize="sm" color="gray.600" mb={3}>
                                  {getAnalysisPreview(archivo.analisis_admin)}
                                </Text>
                                
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => openAnalysisModal(archivo.analisis_admin)}
                                  leftIcon={<FaEye />}
                                >
                                  Ver análisis completo
                                </Button>
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

        {/* Sección promocional */}
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
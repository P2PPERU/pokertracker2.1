import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Button,
  Badge,
  useColorModeValue,
  Icon,
  useToast,
  Flex,
  HStack,
  VStack,
  Divider
} from "@chakra-ui/react";
import { FaGem, FaMedal, FaStar, FaCheckCircle, FaDatabase, FaChartLine, FaRobot, FaUserTie, FaPercent, FaBrain } from "react-icons/fa";
import { Link } from "react-router-dom";

// Lista de planes actualizada con información específica de poker
const planes = [
  {
    nombre: "Bronce",
    precio: "Gratis",
    icono: FaStar,
    beneficios: [
      "Stats básicas: VPIP, PFR y 3BET",
      "1 evaluación de tus stats al mes",
      "Sin análisis IA",
      "Ideal para conocer la plataforma",
      "Soporte básico por email"
    ],
    limitaciones: [
      "Sin acceso a stats avanzadas",
      "Sin herramientas profesionales"
    ],
    destacado: false,
    color: "orange.400"
  },
  {
    nombre: "Plata",
    precio: "$11.99 / mes",
    precioAnterior: "$24",
    descuento: "50% OFF",
    icono: FaMedal,
    beneficios: [
      "Todas las stats profesionales",
      "250 análisis IA por mes",
      "Evaluación constante de tus stats",
      "Gráficos de evolución y tendencias",
      "Soporte personalizado por WhatsApp",
      "Recomendaciones personalizadas"
    ],
    limitaciones: [],
    destacado: true,
    color: "gray.500"
  },
  {
    nombre: "Oro",
    precio: "$19.99 / mes",
    precioAnterior: "$35",
    descuento: "43% OFF",
    icono: FaGem,
    beneficios: [
      "Stats completas profesionales ilimitadas",
      "Análisis IA sin límites + prioridad",
      "Los mejores deals de rakeback del mercado",
      "Análisis MDA de salas de poker",
      "Asesorías personalizadas 1 a 1",
      "Recomendaciones de mesas rentables",
      "Acceso anticipado a nuevas herramientas"
    ],
    limitaciones: [],
    destacado: false,
    color: "yellow.500",
    premium: true
  }
];

const Suscripciones = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const limitationColor = useColorModeValue("gray.500", "gray.500");
  const toast = useToast();
  
  const mainGradient = useColorModeValue(
    "linear(to-r, #6CB5FE, #4066ED)", 
    "linear(to-r, #6CB5FE, #4066ED)"
  );

  const generarLinkWhatsApp = (plan) => {
    const mensaje = encodeURIComponent(`Hola, quiero ser \"${plan}\"`);
    return `https://wa.me/51991351213?text=${mensaje}`;
  };

  const handleElegirPlan = (plan) => {
    toast({
      title: `Plan ${plan} seleccionado`,
      description: "Te redirigiremos a WhatsApp para confirmar tu elección.",
      status: "info",
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Box maxW="1400px" mx="auto">
        {/* Header mejorado */}
        <Box 
          bgGradient={mainGradient}
          borderRadius="xl" 
          py={6} 
          px={8} 
          mb={8}
          boxShadow="lg"
          maxW="1000px"
          mx="auto"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <HStack spacing={3}>
              <Icon as={FaDatabase} color="white" boxSize={6} />
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="white" fontWeight="bold">
                  Planes de Suscripción
                </Heading>
                <Text color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                  Conviértete en un jugador ganador
                </Text>
              </VStack>
            </HStack>
            
            <Link to="/">
              <HStack 
                bg="whiteAlpha.200" 
                p={2} 
                px={4}
                borderRadius="md" 
                spacing={2} 
                _hover={{ bg: "whiteAlpha.300" }}
                transition="all 0.2s"
              >
                <Text color="white" fontSize="sm" fontWeight="medium">Volver</Text>
              </HStack>
            </Link>
          </Flex>
          
          <Text 
            mt={4}
            color="whiteAlpha.900" 
            fontSize="md"
            maxW="800px"
          >
            Accede a herramientas profesionales de análisis, estadísticas avanzadas, 
            inteligencia artificial y asesoría personalizada para mejorar tu juego.
          </Text>
        </Box>

        {/* Planes de suscripción mejorados */}
        <SimpleGrid columns={[1, 1, 3]} spacing={8} alignItems="stretch" px={[2, 4]} py={[4, 8]}>
          {planes.map((plan) => (
            <Box
              key={plan.nombre}
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow={plan.destacado ? "2xl" : "lg"}
              border={plan.destacado ? "3px solid" : "1px solid"}
              borderColor={plan.destacado ? "#4066ED" : useColorModeValue("gray.200", "gray.600")}
              transition="all 0.3s"
              _hover={{ 
                transform: "translateY(-8px)",
                boxShadow: "2xl"
              }}
              display="flex"
              flexDirection="column"
              position="relative"
              overflow="hidden"
            >
              {/* Decoración de fondo para plan destacado */}
              {plan.destacado && (
                <>
                  <Box 
                    position="absolute" 
                    top="-10%" 
                    right="-5%" 
                    w="200px" 
                    h="200px" 
                    bgGradient={mainGradient}
                    opacity="0.08"
                    borderRadius="full"
                    zIndex={0}
                  />
                  <Badge 
                    position="absolute"
                    top={4}
                    right={4}
                    bg="#4066ED"
                    color="white" 
                    fontSize="0.8em" 
                    px={3} 
                    py={1} 
                    borderRadius="md"
                    boxShadow="sm"
                    fontWeight="bold"
                  >
                    MÁS POPULAR
                  </Badge>
                </>
              )}

              {/* Badge premium para oro */}
              {plan.premium && (
                <Badge 
                  position="absolute"
                  top={4}
                  right={4}
                  bg="yellow.500"
                  color="gray.800" 
                  fontSize="0.8em" 
                  px={3} 
                  py={1} 
                  borderRadius="md"
                  boxShadow="sm"
                  fontWeight="bold"
                >
                  PREMIUM
                </Badge>
              )}
              
              <Stack spacing={5} align="center" position="relative" zIndex={1} flex={1}>
                {/* Icono y nombre */}
                <VStack spacing={3}>
                  <Box 
                    bg={useColorModeValue(`${plan.color.split('.')[0]}.50`, `${plan.color.split('.')[0]}.900`)}
                    p={4}
                    borderRadius="full"
                    boxShadow="md"
                  >
                    <Icon 
                      as={plan.icono} 
                      boxSize={12} 
                      color={plan.color} 
                    />
                  </Box>
                  
                  <Heading size="lg">{plan.nombre}</Heading>
                </VStack>
                
                {/* Sección de precios mejorada */}
                <Box textAlign="center" mb={2}>
                  {plan.precioAnterior && (
                    <VStack spacing={1}>
                      <Text fontSize="sm" color={subtextColor}>
                        Antes: <span style={{ textDecoration: "line-through", opacity: 0.7 }}>{plan.precioAnterior}</span>
                      </Text>
                      {plan.descuento && (
                        <Badge 
                          colorScheme="red" 
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {plan.descuento}
                        </Badge>
                      )}
                    </VStack>
                  )}
                  <Text 
                    fontSize={["2xl", "3xl"]} 
                    fontWeight="bold"
                    bgGradient={plan.destacado ? mainGradient : "none"}
                    bgClip={plan.destacado ? "text" : "none"}
                    mt={2}
                  >
                    {plan.precio}
                  </Text>
                </Box>

                <Divider />
                
                {/* Beneficios con iconos específicos */}
                <VStack w="100%" align="start" spacing={3} flex={1}>
                  {plan.beneficios.map((b, idx) => {
                    // Asignar iconos según el tipo de beneficio
                    let icono = FaCheckCircle;
                    if (b.includes("IA") || b.includes("análisis")) icono = FaRobot;
                    if (b.includes("stats") || b.includes("Stats")) icono = FaChartLine;
                    if (b.includes("rakeback") || b.includes("deals")) icono = FaPercent;
                    if (b.includes("Asesorías") || b.includes("personalizado")) icono = FaUserTie;
                    if (b.includes("MDA") || b.includes("mesas")) icono = FaBrain;
                    
                    return (
                      <HStack key={idx} align="start" spacing={3}>
                        <Icon 
                          as={icono} 
                          color={plan.destacado ? "#4066ED" : plan.color} 
                          boxSize={4}
                          mt={0.5}
                          flexShrink={0}
                        />
                        <Text 
                          color={textColor} 
                          fontSize="sm" 
                          lineHeight="short"
                        >
                          {b}
                        </Text>
                      </HStack>
                    );
                  })}
                  
                  {/* Limitaciones para plan Bronce */}
                  {plan.limitaciones && plan.limitaciones.length > 0 && (
                    <>
                      <Divider my={2} />
                      {plan.limitaciones.map((l, idx) => (
                        <HStack key={idx} align="start" spacing={3}>
                          <Text color={limitationColor} fontSize="xl">×</Text>
                          <Text 
                            color={limitationColor} 
                            fontSize="sm" 
                            lineHeight="short"
                            opacity={0.8}
                          >
                            {l}
                          </Text>
                        </HStack>
                      ))}
                    </>
                  )}
                </VStack>
                
                {/* Botón de acción mejorado */}
                <Button
                  as={plan.nombre !== "Bronce" ? "a" : "button"}
                  href={plan.nombre !== "Bronce" ? generarLinkWhatsApp(plan.nombre) : undefined}
                  target={plan.nombre !== "Bronce" ? "_blank" : undefined}
                  rel={plan.nombre !== "Bronce" ? "noopener noreferrer" : undefined}
                  bg={plan.destacado ? "#4066ED" : plan.nombre === "Oro" ? "yellow.500" : plan.nombre === "Bronce" ? "gray.400" : "blue.400"}
                  color={plan.nombre === "Oro" ? "gray.800" : "white"}
                  size="lg"
                  px={8}
                  py={6}
                  mt={4}
                  width="100%"
                  fontWeight="bold"
                  fontSize="md"
                  _hover={plan.nombre !== "Bronce" ? {
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                    opacity: 0.9
                  } : {
                    cursor: "not-allowed"
                  }}
                  onClick={plan.nombre !== "Bronce" ? () => handleElegirPlan(plan.nombre) : undefined}
                  isDisabled={plan.nombre === "Bronce"}
                  opacity={plan.nombre === "Bronce" ? 0.6 : 1}
                >
                  {plan.nombre === "Bronce" ? "Plan Actual" : "¡Elegir este plan!"}
                </Button>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>

        {/* Sección adicional de información */}
        <Box 
          mt={12} 
          p={6} 
          bg={cardBg} 
          borderRadius="xl" 
          boxShadow="md"
          maxW="800px"
          mx="auto"
          textAlign="center"
        >
          <Icon as={FaBrain} boxSize={8} color="#4066ED" mb={3} />
          <Heading size="md" mb={3}>¿Por qué elegirnos?</Heading>
          <Text color={subtextColor} fontSize="sm" lineHeight="tall">
            Somos la única plataforma que combina análisis estadístico profesional con 
            inteligencia artificial especializada en poker. Nuestros algoritmos analizan 
            millones de manos para darte las mejores recomendaciones y ayudarte a 
            maximizar tu winrate.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Suscripciones;
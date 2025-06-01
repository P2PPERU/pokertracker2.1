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
  HStack
} from "@chakra-ui/react";
import { FaGem, FaMedal, FaStar, FaCheckCircle, FaDatabase } from "react-icons/fa";
import { Link } from "react-router-dom";

// Lista de planes
const planes = [
  {
    nombre: "Bronce",
    precio: "Gratis",
    icono: FaStar,
    beneficios: [
      "Acceso limitado a estadísticas",
      "100 búsquedas de jugador por día",
      "Sin informes IA",
      "Soporte básico por email",
      "Ideal para principiantes"
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
      "Acceso completo a estadísticas",
      "Búsquedas ilimitadas",
      "100 análisis IA por mes",
      "Acceso a gráfico de ganancias",
      "Asistencia por WhatsApp"
    ],
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
      "Estadísticas avanzadas y desglosadas",
      "Análisis IA ilimitado + acceso prioritario",
      "Soporte premium personalizado",
      "Sugerencias de acción en tiempo real",
      "Acceso anticipado a nuevas funciones"
    ],
    destacado: false,
    color: "yellow.500"
  }
];

const Suscripciones = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const toast = useToast();
  
  // Actualizar a la paleta azul
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
        {/* Header en estilo consistente */}
        <Box 
          bgGradient={mainGradient}
          borderRadius="xl" 
          py={4} 
          px={6} 
          mb={6}
          boxShadow="lg"
          maxW="900px"
          mx="auto"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <HStack>
              <Icon as={FaDatabase} color="white" boxSize={5} />
              <Heading size="lg" color="white" fontWeight="bold">
                Planes de Suscripción
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
          
          <Text 
            mt={2}
            color="whiteAlpha.800" 
            fontSize="sm"
            maxW="700px"
          >
            Conviértete en un jugador EV+ accediendo a herramientas exclusivas de análisis, gráficas avanzadas y sugerencias en tiempo real.
          </Text>
        </Box>

        {/* Planes de suscripción */}
        <SimpleGrid columns={[1, 1, 3]} spacing={8} alignItems="stretch" px={[2, 4]} py={[4, 8]}>
          {planes.map((plan) => (
            <Box
              key={plan.nombre}
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow={plan.destacado ? "xl" : "base"}
              border={plan.destacado ? "2px solid" : "1px solid"}
              borderColor={plan.destacado ? "#4066ED" : useColorModeValue("gray.200", "gray.600")}
              transition="all 0.3s"
              _hover={{ 
                transform: "translateY(-8px)",
                boxShadow: "xl"
              }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              position="relative"
              overflow="hidden"
            >
              {/* Decoración de fondo */}
              {plan.destacado && (
                <Box 
                  position="absolute" 
                  top="-10%" 
                  right="-5%" 
                  w="200px" 
                  h="200px" 
                  bgGradient={mainGradient}
                  opacity="0.05"
                  borderRadius="full"
                  zIndex={0}
                />
              )}
              
              <Stack spacing={5} align="center" position="relative" zIndex={1}>
                {/* Icono */}
                <Box 
                  bg={useColorModeValue(`${plan.color.split('.')[0]}.50`, `${plan.color.split('.')[0]}.900`)}
                  p={4}
                  borderRadius="full"
                  boxShadow="sm"
                >
                  <Icon 
                    as={plan.icono} 
                    boxSize={12} 
                    color={plan.color} 
                  />
                </Box>
                
                {/* Nombre del plan */}
                <Heading size="lg">{plan.nombre}</Heading>
                
                {/* Badge de recomendado */}
                {plan.destacado && (
                  <Badge 
                    bg="#4066ED"
                    color="white" 
                    fontSize="0.9em" 
                    px={3} 
                    py={1} 
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    RECOMENDADO
                  </Badge>
                )}
                
                {/* Sección de precios */}
                <Box textAlign="center">
                  {plan.precioAnterior && (
                    <>
                      <Text fontSize="lg" color="red.500" fontWeight="bold">
                        Antes: <span style={{ textDecoration: "line-through", opacity: 0.8 }}>{plan.precioAnterior}</span>
                      </Text>
                      {plan.descuento && (
                        <Badge 
                          colorScheme="red" 
                          mt={1}
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          fontSize="sm"
                        >
                          {plan.descuento}
                        </Badge>
                      )}
                    </>
                  )}
                  <Text 
                    fontSize={["xl", "2xl"]} 
                    fontWeight="bold"
                    bgGradient={plan.destacado ? mainGradient : "none"}
                    bgClip={plan.destacado ? "text" : "none"}
                    mt={1}
                  >
                    {plan.precio}
                  </Text>
                </Box>
                
                {/* Beneficios */}
                <Box w="100%" mt={2}>
                  {plan.beneficios.map((b, idx) => (
                    <Text 
                      key={idx} 
                      color={textColor} 
                      fontSize="md" 
                      mb={3} 
                      display="flex" 
                      alignItems="center"
                    >
                      <Icon 
                        as={FaCheckCircle} 
                        mr={3} 
                        color={plan.destacado ? "#4066ED" : plan.color} 
                        boxSize={4}
                      /> 
                      {b}
                    </Text>
                  ))}
                </Box>
                
                {/* Botón mejorado */}
                {plan.nombre !== "Bronce" && (
                  <Button
                    as="a"
                    href={generarLinkWhatsApp(plan.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    bg={plan.destacado ? "#4066ED" : plan.nombre === "Oro" ? "yellow.500" : "blue.400"}
                    color="white"
                    size="md"
                    px={6}
                    py={6}
                    mt={4}
                    width="100%"
                    fontWeight="bold"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                      opacity: 0.9
                    }}
                    onClick={() => handleElegirPlan(plan.nombre)}
                  >
                    ¡Elegir plan!
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Suscripciones;
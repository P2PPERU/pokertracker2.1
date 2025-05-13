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
  useToast
} from "@chakra-ui/react";
import { FaGem, FaMedal, FaStar, FaCheckCircle } from "react-icons/fa";

// Lista de planes - exactamente como en el original
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
    precio: "$9.99 / mes",
    precioAnterior: "$20",
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
  const toast = useToast();
  const headerColor = useColorModeValue("teal.600", "teal.300");
  const headerBgGradient = useColorModeValue(
    "linear(to-r, teal.400, teal.600)", 
    "linear(to-r, teal.500, teal.300)"
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
    <Box px={[4, 8]} py={[10, 16]} maxW="1200px" mx="auto">
      {/* Encabezado mejorado pero conservando estructura */}
      <Heading 
        textAlign="center" 
        mb={4} 
        bgGradient={headerBgGradient}
        bgClip="text"
        fontSize={["3xl", "4xl"]}
        fontWeight="bold"
        letterSpacing="tight"
      >
        Planes de Suscripción
      </Heading>
      <Text 
        textAlign="center" 
        mb={10} 
        fontSize={["md", "lg"]} 
        color={textColor} 
        maxW="800px" 
        mx="auto"
        lineHeight="tall"
      >
        Conviértete en un jugador EV+ accediendo a herramientas exclusivas de análisis, gráficas avanzadas y sugerencias en tiempo real. ¡Elige el plan que potencia tu rendimiento!
      </Text>

      {/* Estructura de Grid exactamente igual al original */}
      <SimpleGrid columns={[1, 1, 3]} spacing={10} alignItems="stretch">
        {planes.map((plan) => (
          <Box
            key={plan.nombre}
            p={8}
            bg={cardBg}
            borderRadius="2xl"
            boxShadow={plan.destacado ? "xl" : "lg"}
            border={plan.destacado ? "2px solid" : "1px solid"}
            borderColor={plan.destacado ? "teal.500" : useColorModeValue("gray.200", "gray.600")}
            transition="all 0.3s"
            _hover={{ 
              transform: "scale(1.03)",
              boxShadow: "2xl"
            }}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            position="relative"
          >
            {/* Mantenemos exactamente la misma estructura */}
            <Stack spacing={5} align="center">
              {/* Icono mejorado */}
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
                  filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.1))"
                />
              </Box>
              
              {/* Nombre del plan */}
              <Heading size="lg">{plan.nombre}</Heading>
              
              {/* Badge de recomendado mejorado */}
              {plan.destacado && (
                <Badge 
                  colorScheme="teal" 
                  fontSize="0.9em" 
                  px={3} 
                  py={1} 
                  borderRadius="md"
                  boxShadow="sm"
                >
                  RECOMENDADO
                </Badge>
              )}
              
              {/* Sección de precios (misma estructura) */}
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
                  bgGradient={plan.destacado ? headerBgGradient : "none"}
                  bgClip={plan.destacado ? "text" : "none"}
                  mt={1}
                >
                  {plan.precio}
                </Text>
              </Box>
              
              {/* Beneficios (misma estructura) */}
              <Box w="100%">
                {plan.beneficios.map((b, idx) => (
                  <Text 
                    key={idx} 
                    color={textColor} 
                    fontSize="md" 
                    mb={2} 
                    display="flex" 
                    alignItems="center"
                  >
                    <Icon 
                      as={FaCheckCircle} 
                      mr={3} 
                      color={plan.destacado ? "teal.500" : plan.color} 
                      boxSize={5}
                    /> 
                    {b}
                  </Text>
                ))}
              </Box>
              
              {/* Botón mejorado pero manteniendo comportamiento */}
              {plan.nombre !== "Bronce" && (
                <Button
                  as="a"
                  href={generarLinkWhatsApp(plan.nombre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorScheme={plan.nombre === "Plata" ? "teal" : "yellow"}
                  size="md"
                  px={6}
                  py={6}
                  mt={2}
                  width="100%"
                  fontWeight="bold"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md"
                  }}
                  onClick={() => handleElegirPlan(plan.nombre)}
                >
                  ¡Elegir plan!
                </Button>
              )}
            </Stack>
            
            {/* Si es un plan destacado, añadimos un efecto decorativo sutil */}
            {plan.destacado && (
              <Box
                position="absolute"
                top="-10px"
                right="-10px"
                w="80px"
                h="80px"
                bg="teal.500"
                opacity="0.1"
                borderRadius="full"
                zIndex={0}
              />
            )}
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Suscripciones;
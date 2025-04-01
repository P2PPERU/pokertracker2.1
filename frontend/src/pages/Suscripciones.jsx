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
      <Heading textAlign="center" mb={4} color="teal.500" fontSize="4xl">
        Planes de Suscripción
      </Heading>
      <Text textAlign="center" mb={10} fontSize="lg" color={textColor} maxW="800px" mx="auto">
        Conviértete en un jugador EV+ accediendo a herramientas exclusivas de análisis, gráficas avanzadas y sugerencias en tiempo real. ¡Elige el plan que potencia tu rendimiento!
      </Text>

      <SimpleGrid columns={[1, 1, 3]} spacing={10} alignItems="stretch">
        {planes.map((plan) => (
          <Box
            key={plan.nombre}
            p={8}
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="lg"
            border={plan.destacado ? "2px solid teal" : "1px solid"}
            borderColor={plan.destacado ? "teal.500" : useColorModeValue("gray.200", "gray.600")}
            transition="all 0.3s"
            _hover={{ transform: "scale(1.03)" }}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Stack spacing={5} align="center">
              <Icon as={plan.icono} boxSize={12} color={plan.color} />
              <Heading size="lg"> {plan.nombre} </Heading>
              {plan.destacado && (
                <Badge colorScheme="teal" fontSize="0.9em" px={3} py={1} borderRadius="md">
                  RECOMENDADO
                </Badge>
              )}
              <Box textAlign="center">
                {plan.precioAnterior && (
                  <>
                    <Text fontSize="lg" color="red.500" fontWeight="bold">
                      Antes: <span style={{ textDecoration: "line-through", opacity: 0.8 }}>{plan.precioAnterior}</span>
                    </Text>
                    {plan.descuento && (
                      <Badge colorScheme="red" mt={1}>{plan.descuento}</Badge>
                    )}
                  </>
                )}
                <Text fontSize="2xl" fontWeight="bold">
                  {plan.precio}
                </Text>
              </Box>
              <Box>
                {plan.beneficios.map((b, idx) => (
                  <Text key={idx} color={textColor} fontSize="md" mb={1} display="flex" alignItems="center">
                    <Icon as={FaCheckCircle} mr={2} color="teal.400" /> {b}
                  </Text>
                ))}
              </Box>
              {plan.nombre !== "Bronce" && (
                <Button
                  as="a"
                  href={generarLinkWhatsApp(plan.nombre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorScheme="teal"
                  size="md"
                  px={6}
                  mt={2}
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
  );
};

export default Suscripciones;

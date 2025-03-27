import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Stack,
    Button,
    Badge,
    useColorModeValue,
  } from "@chakra-ui/react";
  import { FaGem, FaMedal, FaStar } from "react-icons/fa";
  
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
    },
    {
      nombre: "Plata",
      precio: "$9.99 / mes",
      icono: FaMedal,
      beneficios: [
        "Acceso completo a estadísticas",
        "Búsquedas ilimitadas",
        "100 análisis IA por mes",
        "Acceso a gráfico de ganancias",
        "Asistencia por WhatsApp"
      ],
      destacado: true,
    },
    {
      nombre: "Oro",
      precio: "$19.99 / mes",
      icono: FaGem,
      beneficios: [
        "Estadísticas avanzadas y desglosadas",
        "Análisis IA ilimitado + acceso prioritario",
        "Soporte premium personalizado",
        "Sugerencias de acción en tiempo real",
        "Acceso anticipado a nuevas funciones"
      ],
      destacado: false,
    },
  ];
  
  const Suscripciones = () => {
    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
  
    const generarLinkWhatsApp = (plan) => {
      const mensaje = encodeURIComponent(`Hola, quiero ser \"${plan}\"`);
      return `https://wa.me/51991351213?text=${mensaje}`;
    };
  
    return (
      <Box px={[4, 8]} py={[10, 16]} maxW="1200px" mx="auto">
        <Heading textAlign="center" mb={4} color="teal.500" fontSize="4xl">
          Planes de Suscripción
        </Heading>
        <Text textAlign="center" mb={10} fontSize="lg" color={textColor} maxW="800px" mx="auto">
          Conviértete en un jugador EV+ accediendo a herramientas exclusivas de análisis, gráficas avanzadas y sugerencias en tiempo real. ¡Elige el plan que potencia tu rendimiento!
        </Text>
  
        <SimpleGrid columns={[1, 1, 3]} spacing={10}>
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
            >
              <Stack spacing={5} align="center">
                <Box
                  as={plan.icono}
                  boxSize={12}
                  color={plan.destacado ? "teal.500" : "gray.400"}
                />
                <Heading size="lg">{plan.nombre}</Heading>
                {plan.destacado && (
                  <Badge colorScheme="teal" fontSize="0.9em" px={3} py={1} borderRadius="md">
                    Recomendado
                  </Badge>
                )}
                <Text fontSize="2xl" fontWeight="bold">
                  {plan.precio}
                </Text>
                <Box>
                  {plan.beneficios.map((b, idx) => (
                    <Text key={idx} color={textColor} fontSize="md" mb={1}>
                      • {b}
                    </Text>
                  ))}
                </Box>
                <Button
                  as="a"
                  href={generarLinkWhatsApp(plan.nombre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorScheme="teal"
                  size="md"
                  px={6}
                  mt={2}
                >
                  ¡Elegir plan!
                </Button>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    );
  };
  
  export default Suscripciones;
  
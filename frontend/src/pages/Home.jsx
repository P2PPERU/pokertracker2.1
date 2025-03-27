import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Image,
  Icon,
  SimpleGrid,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaSearch, FaChartBar, FaRobot, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Home = () => {
  const bg = useColorModeValue("#f7f9fc", "#0a0f1a");
  const cardBg = useColorModeValue("white", "#202738");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const headingColor = useColorModeValue("gray.900", "teal.200");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  // Nuevo gradiente para tarjetas y botón
  const cardGradient = useColorModeValue(
    "linear(to-r, #2BB5E0, #8266D4)",
    "gray.700"
  );

  return (
    <>
      {/* LÍNEA SUPERIOR */}
      <Box height="2px" bg="teal.400" w="100%" boxShadow="0 0 10px #14f1c6" />

      {/* HERO CON FONDO CLARO */}
      <Box
        as="section"
        bg={bg}
        py={[12, 20]}
        px={[4, 8]}
        borderBottom="2px solid"
        borderColor="teal.200"
      >
        <Flex
          direction={["column", "column", "row"]}
          align="center"
          justify="space-between"
          maxW="1200px"
          mx="auto"
          gap={10}
        >
          {/* TEXTO IZQUIERDA */}
          <MotionBox
            flex="1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Flex align="center" gap={3} mb={2}>
            <Heading fontSize={["3xl", "4xl", "5xl"]} color={headingColor} lineHeight="short">
  Bienvenido a{" "}
  <Text
    as="span"
    bgGradient="linear(to-r, teal.400, purple.500)"
    bgClip="text"
    fontWeight="extrabold"
  >
    Luciana EV
  </Text>
</Heading>

<Badge
  bgGradient="linear(to-r, teal.400, purple.500)"
  color="white"
  fontSize="0.8em"
  px={3}
  py={1}
  borderRadius="md"
  boxShadow="md"
>
  v2.1 BETA
</Badge>
            </Flex>

            <Text fontSize={["md", "lg", "xl"]} color={subTextColor} mb={6} maxW="500px">
              Tu asistente profesional para el análisis explotativo de jugadores de cash.
              Accede a estadísticas reales, informes de IA y toma decisiones precisas en tus sesiones.
            </Text>

            <Link to="/dashboard">
            <Button
  size="lg"
  px={10}
  py={6}
  fontSize="xl"
  fontWeight="bold"
  bgGradient="linear(to-r, teal.300, blue.400, purple.500)"
  color="white"
  _hover={{
    bgGradient: "linear(to-r, teal.400, blue.500, purple.600)",
    transform: "scale(1.05)",
  }}
  boxShadow="lg"
>
  Generador de EV 🚀
</Button>
            </Link>
          </MotionBox>

          {/* IMAGEN */}
          <MotionBox
  flex="1"
  position="relative"
  p="3px" // para mostrar el borde degradado
  borderRadius="xl"
  maxW="500px"
  bgGradient="linear(to-r, teal.300, blue.400, purple.500)"
>
  <Box
    borderRadius="lg"
    overflow="hidden"
    bg="white"
    p={0}
  >
    <Image
      src="/images/hero-pokertracker.png"
      alt="Poker futurista con estadísticas"
      objectFit="cover"
      w="100%"
    />
  </Box>
</MotionBox>
        </Flex>
      </Box>

      {/* FEATURES */}
      <Box as="main" bg={bg} py={[10, 16]} px={[4, 8]}>
        <SimpleGrid columns={[1, 2, 3]} spacing={8} maxW="1200px" mx="auto" mb={12}>
          {/* CARD 1 */}
          <Box
            p={6}
            bgGradient={cardGradient}
            borderRadius="2xl"
            color="white"
            boxShadow="xl"
            textAlign="center"
          >
            <Icon as={FaSearch} w={12} h={12} color="white" mb={4} />
            <Heading size="md" mb={2}>Búsqueda Inteligente</Heading>
            <Text fontSize="lg">
              Encuentra jugadores por nombre o alias en segundos.
            </Text>
          </Box>

          {/* CARD 2 */}
          <Box
            p={6}
            bgGradient={cardGradient}
            borderRadius="2xl"
            color="white"
            boxShadow="xl"
            textAlign="center"
          >
            <Icon as={FaChartBar} w={12} h={12} color="white" mb={4} />
            <Heading size="md" mb={2}>Estadísticas Avanzadas</Heading>
            <Text fontSize="lg">
              Consulta stats clave como VPIP, PFR, 3Bet, WTSD, WWSF y más.
            </Text>
          </Box>

          {/* CARD 3 */}
          <Box
            p={6}
            bgGradient={cardGradient}
            borderRadius="2xl"
            color="white"
            boxShadow="xl"
            textAlign="center"
          >
            <Icon as={FaRobot} w={12} h={12} color="white" mb={4} />
            <Heading size="md" mb={2}>Análisis con IA</Heading>
            <Text fontSize="lg">
              Recibe informes explotativos listos para tomar acción en la mesa.
            </Text>
          </Box>
        </SimpleGrid>

        {/* TESTIMONIO */}
        <Box textAlign="center" maxW="900px" mx="auto">
          <Divider mb={6} />
          <Flex align="center" justify="center" gap={2} mb={2}>
            <Icon as={FaStar} color="yellow.400" boxSize={6} />
            <Text fontWeight="bold" fontSize="2xl" color={headingColor}>
              Top regs nos recomiendan
            </Text>
          </Flex>
          <Text fontSize="lg" color={subTextColor}>
            Hemos sido validados por jugadores ganadores en NL100 y NL200.  
            Luciana EV 2.1 forma parte de su arsenal para explotar leaks y tomar decisiones más EV+ en tiempo real.
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default Home;

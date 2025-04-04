import { useAuth } from "../context/AuthContext";
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
import { FaSearch, FaChartBar, FaRobot, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MotionBox = motion(Box);

const Home = () => {
  const authContext = useAuth();
  const auth = authContext?.auth;
    const navigate = useNavigate();

    console.log("AuthContext en Home:", authContext);


  const abrirModalLogin = () => {
    const event = new CustomEvent("abrir-modal-login");
    window.dispatchEvent(event);
  };

  const handleRedirect = () => {
    if (auth) {
      navigate("/dashboard");
    } else {
      abrirModalLogin();
    }
  };

  const bg = useColorModeValue("#f7f9fc", "#0a0f1a");
  const cardBg = useColorModeValue("white", "#202738");
  const headingColor = useColorModeValue("gray.900", "teal.200");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const cardGradient = useColorModeValue(
    "linear(to-r, #2BB5E0, #8266D4)",
    "linear(to-r, #2BB5E0, #8266D4)"
  );
  const analysisBg = useColorModeValue("gray.50", "gray.800");
  const analysisTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const imageFilter = useColorModeValue("none", "brightness(0.85)");

  return (
    <>
      {/* Simulación de menú hover-only (debe estar realmente en Navbar.jsx para mejor control) */}
      <Box
        display={["none", "flex"]}
        _hover={{ display: "flex" }}
        position="absolute"
        top="0"
        left="0"
        w="100%"
        zIndex="100"
        bgGradient="linear(to-r, #2BB5E0, #8266D4)"
        p={4}
        justifyContent="center"
        fontWeight="bold"
        fontSize="md"
        color="white"
      >
        {/* Aquí irían los enlaces reales del navbar si quieres que sea fijo */}
        Menú superior (simulado)
      </Box>

      {/* Línea superior decorativa */}
      <Box
        height="3px"
        bg="teal.400"
        w="100%"
        boxShadow="0 0 15px rgba(20, 241, 198, 0.7)"
      />

      {/* Hero principal */}
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
          <MotionBox
            flex="1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Flex align="center" gap={3} mb={3} justify={["center", "flex-start"]}>
              <Heading
                fontSize={["3xl", "4xl", "5xl"]}
                color={headingColor}
                lineHeight="shorter"
                textAlign={["center", "left"]}
              >
                Bienvenido a{" "}
                <Text
                  as="span"
                  bgGradient="linear(to-r, teal.400, purple.500)"
                  bgClip="text"
                  fontWeight="extrabold"
                >
                  POKER PRO TRACK 2.1
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

            <Text
              fontSize={["md", "lg", "xl"]}
              color={subTextColor}
              mb={8}
              maxW="500px"
              textAlign={["center", "left"]}
              mx={["auto", "0"]}
            >
              Tu asistente profesional para el análisis explotativo de jugadores
              de cash. Accede a estadísticas reales, informes de IA y toma
              decisiones precisas en tus sesiones.
            </Text>

            <Button
              onClick={handleRedirect}
              size={["md", "lg"]}
              fontSize={["md", "xl"]}
              fontWeight="bold"
              bgGradient="linear(to-r, teal.300, blue.400, purple.500)"
              color="white"
              _hover={{
                bgGradient: "linear(to-r, teal.400, blue.500, purple.600)",
                transform: "scale(1.05)",
              }}
              boxShadow="lg"
              borderRadius="xl"
              px={[6, 10]}
              py={[4, 6]}
              w={["80%", "auto"]}
              mx={["auto", "0"]}
            >
              Generador de EV 🚀
            </Button>
          </MotionBox>

          <MotionBox
            flex="1"
            position="relative"
            p="3px"
            borderRadius="xl"
            maxW="500px"
            bgGradient="linear(to-r, teal.300, blue.400, purple.500)"
            mx={["auto", "0"]}
          >
            <Box borderRadius="lg" overflow="hidden" bg="white">
              <Image
                src="/images/hero-pokertracker.png"
                alt="Poker futurista con estadísticas"
                objectFit="cover"
                w="100%"
                filter={imageFilter}
              />
            </Box>
          </MotionBox>
        </Flex>
      </Box>

      {/* Sección de caso de éxito */}
      <Box
        maxW="1200px"
        mx="auto"
        mt={20}
        p={10}
        bg={cardBg}
        rounded="2xl"
        boxShadow="2xl"
      >
        <Heading
          size="lg"
          mb={8}
          color={headingColor}
          textAlign="center"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
        >
          <Icon as={FaChartBar} /> ¿Qué puedes lograr con POKER PRO TRACK?
        </Heading>

        <Flex
          direction="column"
          gap={8}
          align="center"
          justify="center"
          w="full"
          maxW="700px"
          mx="auto"
        >
          <Box w="full" textAlign="center">
            <Image
              src="/images/graficoweb.png"
              alt="Gráfico de ganancias"
              rounded="lg"
              w="100%"
              maxH="450px"
              objectFit="contain"
              mt={4}
              filter={imageFilter}
            />
          </Box>

          <Box w="full" textAlign="center">
            <Image
              src="/images/statweb.png"
              alt="Estadísticas del jugador"
              rounded="lg"
              mb={6}
              filter={imageFilter}
              w="100%"
            />
            <Box
              bg={analysisBg}
              p={6}
              rounded="md"
              fontSize="md"
              color={analysisTextColor}
              boxShadow="sm"
              textAlign="left"
            >
              <Text fontWeight="bold" mb={2}>
                🧠 Análisis IA:
              </Text>
              <Text mb={1}>
                <strong>Estilo:</strong> TAG con tendencia a la pasividad preflop...
              </Text>
              <Text mb={1}>
                <strong>Errores:</strong> VPIP alto, PFR bajo...
              </Text>
              <Text>
                <strong>Explotación:</strong> Flotar más en flop y atacar en turn...
              </Text>
            </Box>

            <Button
              mt={6}
              colorScheme="teal"
              size={["sm", "md"]}
              onClick={handleRedirect}
              borderRadius="xl"
              px={[5, 6]}
              py={[3, 4]}
              w={["80%", "auto"]}
              mx="auto"
              display="block"
            >
              🚀 Analiza a tus oponentes ahora
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* Sección de servicios */}
      <Box as="main" bg={bg} py={[10, 16]} px={[4, 8]}>
        <SimpleGrid
          columns={[1, 2, 3]}
          spacing={8}
          maxW="1200px"
          mx="auto"
          mb={12}
        >
          {[
            { icon: FaSearch, title: "Búsqueda Inteligente", desc: "Encuentra jugadores por nombre o alias en segundos." },
            { icon: FaChartBar, title: "Estadísticas Avanzadas", desc: "Consulta stats clave como VPIP, PFR, 3Bet, WTSD, WWSF y más." },
            { icon: FaRobot, title: "Análisis con IA", desc: "Recibe informes explotativos listos para tomar acción en la mesa." },
          ].map((feature, i) => (
            <Box
              key={i}
              p={6}
              bgGradient={cardGradient}
              borderRadius="2xl"
              color="white"
              boxShadow="xl"
              textAlign="center"
              _hover={{ transform: "scale(1.03)" }}
              transition="all 0.3s"
            >
              <Icon as={feature.icon} w={12} h={12} color="white" mb={4} />
              <Heading size="md" mb={2}>{feature.title}</Heading>
              <Text fontSize="lg">{feature.desc}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Box textAlign="center" maxW="900px" mx="auto">
          <Divider mb={6} />
          <Flex align="center" justify="center" gap={2} mb={2}>
            <Icon as={FaStar} color="yellow.400" boxSize={6} />
            <Text fontWeight="bold" fontSize="2xl" color={headingColor}>
              Top regs nos recomiendan
            </Text>
          </Flex>
          <Text fontSize="lg" color={subTextColor}>
            Validado por jugadores ganadores en NL100 y NL200...
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default Home;

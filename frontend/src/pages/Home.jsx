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
  Badge,
  VStack,
  HStack,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import { 
  FaSearch, 
  FaChartBar, 
  FaRobot, 
  FaStar, 
  FaArrowRight, 
  FaUserAlt, 
  FaDatabase, 
  FaBrain,
  FaFileAlt,
  FaWhatsapp,
  FaFire,
  FaCrown
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { css } from "@emotion/react";
import { gradients, brand } from '../theme/colors';

// Definimos los estilos de animación con emotion
const animationStyles = css`
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }

  @keyframes pulse {
    0% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0.7; transform: scale(1); }
  }

  .floating-animation {
    animation: float 6s ease-in-out infinite;
  }

  .pulse-animation {
    animation: pulse 4s ease-in-out infinite;
  }
  
  .service-icon {
    transition: transform 0.3s ease;
  }
  
  *:hover > .service-icon {
    transform: translateY(-5px);
  }
`;

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Home = () => {
  const authContext = useAuth();
  const auth = authContext ? authContext.auth : null;
  const navigate = useNavigate();

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

  // Colores mejorados
  const bg = useColorModeValue("#f7f9fc", "#0a0f1a");
  const cardBg = useColorModeValue("white", "#202738");
  const headingColor = useColorModeValue("gray.900", "teal.200");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const cardGradient = gradients.main;
  const analysisBg = useColorModeValue("gray.50", "gray.800");
  const analysisTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const imageFilter = useColorModeValue("none", "brightness(0.9)");

  return (
    <>
      {/* Añadimos los estilos de animación */}
      <Box css={animationStyles}>
        {/* 🔥 NUEVO: Banner destacado para Análisis de Manos - ARRIBA DE TODO */}
        <Box
          bg="linear-gradient(135deg, #FF0080, #FF8C42, #FFD700)"
          color="white"
          py={4}
          position="relative"
          overflow="hidden"
          boxShadow="xl"
        >
          <Container maxW="container.xl">
            <Flex 
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
              gap={4}
            >
              <HStack spacing={4}>
                <Icon as={FaFire} boxSize={8} className="pulse-animation" />
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Badge bg="white" color="red.500" px={3} py={1} borderRadius="full" fontWeight="bold">
                      🔥 NUEVO SERVICIO
                    </Badge>
                    <Badge bg="yellow.400" color="black" px={3} py={1} borderRadius="full" fontWeight="bold">
                      70% DESC
                    </Badge>
                  </HStack>
                  <Heading size={{ base: "md", md: "lg" }}>
                    ¡Análisis Profesional de Manos por Expertos!
                  </Heading>
                  <Text fontSize={{ base: "sm", md: "md" }} opacity={0.9}>
                    Mejora tu winrate +47% con análisis personalizados desde $19.99
                  </Text>
                </VStack>
              </HStack>
              
              <VStack spacing={2}>
                <Button
                  as={Link}
                  to="/landing-analisis"
                  size="lg"
                  bg="white"
                  color="red.500"
                  leftIcon={<FaFileAlt />}
                  rightIcon={<FaArrowRight />}
                  _hover={{
                    transform: "translateY(-3px)",
                    boxShadow: "2xl",
                    bg: "whiteAlpha.900"
                  }}
                  fontWeight="bold"
                  px={8}
                  borderRadius="full"
                  transition="all 0.3s"
                >
                  Ver Análisis de Manos
                </Button>
                <Text fontSize="xs" textAlign="center" opacity={0.8}>
                  ⏰ Oferta limitada - Solo 20 cupos
                </Text>
              </VStack>
            </Flex>
          </Container>
        </Box>

        {/* Hero principal mejorado */}
        <Box
          position="relative"
          minH="90vh"
          bgImage="url('./images/hero-poker-bg.jpg')"
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
          _before={{
            content: '""',
            position: "absolute",
            top: 0, 
            right: 0,
            bottom: 0,
            left: 0,
            background: "linear-gradient(135deg, rgba(4, 9, 30, 0.85), rgba(17, 22, 56, 0.8))",
            zIndex: 1
          }}
        >
          <Container maxW="container.xl" position="relative" zIndex="2" py={[12, 20]}>
            <Flex
              direction={["column", "column", "row"]}
              align="center"
              justify="space-between"
              mx="auto"
              gap={10}
              pt={{ base: 10, md: 0 }}
              h={{ md: "80vh" }}
            >
              <MotionBox
                flex="1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Flex align="center" gap={3} mb={3} justify={["center", "flex-start"]}>
                  <Badge
                    px={4}
                    py={2}
                    bgGradient={gradients.main}
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    borderRadius="full"
                    letterSpacing="wider"
                    boxShadow="md"
                    mb={4}
                  >
                    VERSIÓN 2.1 - POTENCIADA CON IA
                  </Badge>
                </Flex>

                <Heading
                  fontSize={["3xl", "4xl", "5xl", "6xl"]}
                  color="white"
                  lineHeight="1.1"
                  fontWeight="bold"
                  textAlign={["center", "left"]}
                  mb={6}
                >
                  Domina el Póker con{" "}
                  <Box
                    as="span"
                    position="relative"
                    bgGradient={gradients.main}
                    bgClip="text"
                    sx={{
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "-5px",
                        left: 0,
                        width: "100%",
                        height: "2px",
                        bgGradient: gradients.main
                      }
                    }}
                  >
                    Inteligencia Artificial
                  </Box>
                </Heading>

                <Text
                  fontSize={["lg", "xl", "2xl"]}
                  color="whiteAlpha.900"
                  mb={8}
                  maxW="600px"
                  textAlign={["center", "left"]}
                  mx={["auto", "0"]}
                  lineHeight="1.6"
                  fontWeight="medium"
                >
                  Tu asistente profesional para el análisis explotativo de jugadores
                  de cash. Accede a estadísticas reales, informes de IA y transforma tu juego.
                </Text>

                <Flex 
                  gap={4} 
                  flexWrap={{ base: "wrap", md: "nowrap" }}
                  justify={["center", "flex-start"]}
                >
                  <Button
                    onClick={handleRedirect}
                    size="lg"
                    py={7}
                    px={8}
                    fontSize="md"
                    fontWeight="bold"
                    variant="primary"
                    rightIcon={<Icon as={FaArrowRight} ml={1} />}
                  >
                    Comenzar Ahora
                  </Button>

                  <Button
                    onClick={() => window.open('#demo', '_self')}
                    size="lg"
                    py={7}
                    px={8}
                    fontSize="md"
                    color="white"
                    bg="whiteAlpha.200"
                    _hover={{
                      bg: "whiteAlpha.300",
                      transform: "translateY(-5px)",
                      boxShadow: "md"
                    }}
                    _active={{
                      bg: "whiteAlpha.400",
                      transform: "translateY(-2px)"
                    }}
                    borderRadius="full"
                    leftIcon={<Icon as={FaSearch} mr={1} />}
                    transition="all 0.3s ease"
                    backdropFilter="blur(8px)"
                  >
                    Ver Demo
                  </Button>
                </Flex>
              </MotionBox>

              <MotionBox
                flex="1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                position="relative"
                maxW="600px"
                className="floating-animation"
              >
                <Box
                  position="relative"
                  borderRadius="2xl"
                  overflow="hidden"
                  boxShadow="0 20px 40px rgba(0,0,0,0.3)"
                  bg="rgba(0,0,0,0.2)"
                  backdropFilter="blur(10px)"
                  p={1}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <Image
                    src="./images/hero-pokertracker.png"
                    alt="PokerProTrack Dashboard"
                    borderRadius="xl"
                    width="full"
                  />

                  {/* Elementos decorativos alrededor de la imagen */}
                  <Box
                    position="absolute"
                    top="-30px"
                    right="-20px"
                    boxSize="80px"
                    borderRadius="full"
                    bgGradient="linear(to-r, purple.500, blue.500)"
                    filter="blur(20px)"
                    opacity="0.8"
                    className="pulse-animation"
                  />
                  <Box
                    position="absolute"
                    bottom="-20px"
                    left="-30px"
                    boxSize="60px"
                    borderRadius="full"
                    bgGradient="linear(to-r, teal.400, cyan.300)"
                    filter="blur(25px)"
                    opacity="0.7"
                    className="pulse-animation"
                  />
                </Box>

                {/* Etiqueta de IA */}
                <Badge
                  position="absolute"
                  top="5%"
                  right="5%"
                  py={2}
                  px={4}
                  borderRadius="full"
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                  bgGradient={gradients.main}
                  boxShadow="0 0 15px rgba(72, 187, 120, 0.5)"
                >
                  <HStack spacing={2}>
                    <Icon as={FaBrain} />
                    <Text>Potenciado por IA</Text>
                  </HStack>
                </Badge>
              </MotionBox>
            </Flex>
          </Container>

          {/* Estadísticas flotantes */}
          <Container maxW="container.xl" position="relative" zIndex="2">
            <Box 
              position={{ base: "relative", lg: "absolute" }} 
              bottom={{ lg: "10%" }} 
              left="0" 
              right="0" 
              mb={{ base: 8, lg: 0 }}
            >
              <SimpleGrid 
                columns={{ base: 1, md: 3 }} 
                spacing={8} 
                maxW={{ base: "100%", lg: "90%" }} 
                mx="auto"
              >
                {[
                  { 
                    numero: "25K+", 
                    texto: "Jugadores Analizados", 
                    desc: "Actualizado diariamente",
                    icono: FaUserAlt,
                    color: brand.primary
                  },
                  { 
                    numero: "5M+", 
                    texto: "Manos Procesadas", 
                    desc: "En bases de datos activas",
                    icono: FaDatabase,
                    color: brand.primary
                  },
                  { 
                    numero: "97.3%", 
                    texto: "Precisión de IA", 
                    desc: "En predicciones de estilo",
                    icono: FaBrain,
                    color: brand.primary
                  }
                ].map((stat, idx) => (
                  <Stat 
                    key={idx} 
                    bg="rgba(0,0,0,0.2)"
                    backdropFilter="blur(10px)"
                    color="white"
                    p={6} 
                    borderRadius="xl" 
                    boxShadow="0 15px 30px rgba(0,0,0,0.2)"
                    border="1px solid rgba(255,255,255,0.1)"
                    _hover={{
                      transform: "translateY(-5px)",
                      transition: "transform 0.3s ease"
                    }}
                    transition="transform 0.3s ease"
                  >
                    <HStack spacing={4} mb={2}>
                      <Icon as={stat.icono} color={stat.color} boxSize={6} />
                      <StatLabel fontSize="lg">{stat.texto}</StatLabel>
                    </HStack>
                    <StatNumber 
                      fontSize={{ base: "3xl", md: "4xl" }} 
                      bgGradient={`linear(to-r, ${stat.color}, ${brand.secondary})`}
                      bgClip="text"
                      fontWeight="extrabold"
                    >
                      {stat.numero}
                    </StatNumber>
                    <StatHelpText color="whiteAlpha.800" fontSize="md">
                      {stat.desc}
                    </StatHelpText>
                  </Stat>
                ))}
              </SimpleGrid>
            </Box>
          </Container>
        </Box>

        {/* SECCIÓN "¿QUÉ PUEDES LOGRAR CON POKER PRO TRACK?" MEJORADA */}
        <Box id="demo" pt="80px" mt="-80px">
          <Box
            maxW="container.xl"
            mx="auto"
            mt={{ base: 12, lg: 20 }}
            px={{ base: 4, md: 8 }}
          >
            <VStack spacing={8} mb={16}>
              <Badge 
                colorScheme="teal" 
                p={2} 
                borderRadius="full" 
                fontSize="sm"
                fontWeight="bold"
              >
                CARACTERÍSTICAS PRINCIPALES
              </Badge>
              
              <Heading
                as="h2"
                fontSize={{ base: "3xl", md: "4xl" }}
                textAlign="center"
                mb={2}
                maxW="800px"
                bgGradient={gradients.main}
                bgClip="text"
              >
                ¿Qué puedes lograr con POKER PRO TRACK?
              </Heading>
              
              <Text
                fontSize={{ base: "md", md: "lg" }}
                textAlign="center"
                color={subTextColor}
                maxW="800px"
              >
                Herramientas avanzadas diseñadas por profesionales para maximizar tus ganancias
                y darte ventaja contra tus oponentes en cada mano.
              </Text>
            </VStack>

            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="2xl"
              bg={cardBg}
              mb={16}
              className="feature-card"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "2xl",
                transition: "all 0.3s ease",
              }}
              transition="all 0.3s ease"
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={0}>
                <Box p={{ base: 6, md: 10 }} position="relative">
                  <VStack align="flex-start" spacing={6} h="full" justify="center">
                    <Heading
                      as="h3"
                      fontSize={{ base: "2xl", md: "3xl" }}
                      bgGradient={gradients.main}
                      bgClip="text"
                      mb={4}
                    >
                      Visualización de datos avanzada
                    </Heading>
                    
                    <Text fontSize={{ base: "md", md: "lg" }} color={subTextColor}>
                      Gráficos interactivos que te permiten visualizar tendencias, patrones y debilidades 
                      de tus oponentes con precisión milimétrica.
                    </Text>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                      {[
                        "Evolución de ganancias",
                        "Análisis por posición",
                        "Filtros personalizables",
                        "Exportación de datos"
                      ].map((feature, idx) => (
                        <HStack 
                          key={idx}
                          className="feature-item"
                          _hover={{
                            transform: "translateX(5px)",
                            transition: "transform 0.3s ease",
                          }}
                          transition="transform 0.3s ease"
                        >
                          <Icon as={FaChartBar} color={brand.primary} />
                          <Text fontWeight="medium">{feature}</Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </Box>
                
                <Box position="relative" bg={useColorModeValue("gray.50", "gray.900")}>
                  <Image
                    src="./images/graficoweb.png"
                    alt="Gráfico de ganancias"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    filter={imageFilter}
                  />
                </Box>
              </SimpleGrid>
            </Box>

            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="2xl"
              bg={cardBg}
              mb={16}
              className="feature-card"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "2xl",
                transition: "all 0.3s ease",
              }}
              transition="all 0.3s ease"
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={0}>
                <Box 
                  order={{ base: 2, lg: 1 }}
                  position="relative" 
                  bg={useColorModeValue("gray.50", "gray.900")}
                >
                  <Image
                    src="./images/statweb.png"
                    alt="Estadísticas del jugador"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    filter={imageFilter}
                  />
                </Box>
                
                <Box 
                  p={{ base: 6, md: 10 }} 
                  position="relative"
                  order={{ base: 1, lg: 2 }}
                >
                  <VStack align="flex-start" spacing={6} h="full" justify="center">
                    <Heading
                      as="h3"
                      fontSize={{ base: "2xl", md: "3xl" }}
                      bgGradient={gradients.main}
                      bgClip="text"
                      mb={4}
                    >
                      Estadísticas detalladas e IA
                    </Heading>
                    
                    <Text fontSize={{ base: "md", md: "lg" }} color={subTextColor}>
                      Métricas avanzadas e interpretación de IA que revela debilidades explotables 
                      que los otros softwares no pueden detectar.
                    </Text>
                    
                    <Box
                      bg={analysisBg}
                      p={6}
                      borderRadius="lg"
                      w="full"
                      boxShadow="md"
                      border="1px solid"
                      borderColor={useColorModeValue("gray.200", "gray.700")}
                      position="relative"
                      className="analysis-box"
                      _hover={{
                        boxShadow: "lg",
                        transform: "scale(1.01)",
                        transition: "all 0.3s ease",
                      }}
                      transition="all 0.3s ease"
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        bgGradient: gradients.main,
                        opacity: 0.05,
                        borderRadius: "lg",
                        zIndex: 0
                      }}
                    >
                      <Heading size="md" mb={3} color={brand.primary}>
                        🧠 Análisis IA:
                      </Heading>
                      <Text mb={2} position="relative" zIndex={1}>
                        <strong>Estilo:</strong> TAG con tendencia a la pasividad preflop. Frecuente limper y caller pasivo.
                      </Text>
                      <Text mb={2} position="relative" zIndex={1}>
                        <strong>Errores:</strong> LIMP alto (10%), PFR bajo (11%), fold to c-bet elevado (78%).
                      </Text>
                      <Text position="relative" zIndex={1}>
                        <strong>Explotación:</strong> Flotar más en flop y atacar en turn. 3-bet ligero en posición.
                      </Text>
                    </Box>
                    
                    <Button
                      mt={4}
                      size="lg"
                      variant="primary"
                      onClick={handleRedirect}
                      rightIcon={<FaArrowRight />}
                    >
                      Analiza a tus oponentes ahora
                    </Button>
                  </VStack>
                </Box>
              </SimpleGrid>
            </Box>
            
            {/* Nueva sección de análisis de manos */}
            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="2xl"
              bg={cardBg}
              mb={16}
              className="feature-card"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "2xl",
                transition: "all 0.3s ease",
              }}
              transition="all 0.3s ease"
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={0}>
                <Box p={{ base: 6, md: 10 }} position="relative">
                  <VStack align="flex-start" spacing={6} h="full" justify="center">
                    <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                      NUEVA FUNCIÓN
                    </Badge>
                    
                    <Heading
                      as="h3"
                      fontSize={{ base: "2xl", md: "3xl" }}
                      bgGradient="linear(to-r, purple.400, pink.500)"
                      bgClip="text"
                      mb={4}
                    >
                      Análisis de manos con IA
                    </Heading>
                    
                    <Text fontSize={{ base: "md", md: "lg" }} color={subTextColor}>
                      Sube tus historiales de manos y recibe un análisis detallado con recomendaciones
                      personalizadas para mejorar tu juego.
                    </Text>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                      {[
                        "Identificación de errores",
                        "Oportunidades de mejora",
                        "Recomendaciones tácticas",
                        "Análisis de patrones"
                      ].map((feature, idx) => (
                        <HStack 
                          key={idx}
                          className="feature-item"
                          _hover={{
                            transform: "translateX(5px)",
                            transition: "transform 0.3s ease",
                          }}
                          transition="transform 0.3s ease"
                        >
                          <Icon as={FaRobot} color="purple.500" />
                          <Text fontWeight="medium">{feature}</Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                    
                    <Button
                      as={Link}
                      to="/landing-analisis"
                      mt={4}
                      size="lg"
                      bgGradient="linear(to-r, purple.400, pink.500)"
                      color="white"
                      _hover={{
                        bgGradient: "linear(to-r, purple.500, pink.600)",
                        transform: "translateY(-5px)",
                        boxShadow: "xl"
                      }}
                      _active={{
                        bgGradient: "linear(to-r, purple.600, pink.700)",
                        transform: "translateY(-2px)"
                      }}
                      borderRadius="full"
                      px={8}
                      py={6}
                      rightIcon={<FaArrowRight />}
                      transition="all 0.3s ease"
                    >
                      Ver Análisis de Manos
                    </Button>
                  </VStack>
                </Box>
                
                <Box position="relative" bg={useColorModeValue("gray.50", "gray.900")}>
                  <Image
                    src="./images/GPTia.png"
                    alt="Análisis de manos con IA"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    filter={imageFilter}
                    fallbackSrc="https://via.placeholder.com/600x400?text=Análisis+de+manos+IA"
                  />
                </Box>
              </SimpleGrid>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN DE SERVICIOS Y TESTIMONIOS SIMPLIFICADA */}
        <Box as="main" py={[10, 16]} px={[4, 8]} bg={bg}>
          <Container maxW="container.xl" mx="auto">
            {/* Encabezado de la sección */}
            <Box textAlign="center" mb={10}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                mb={4}
                color={headingColor}
              >
                Herramientas que hacen la diferencia
              </Heading>
              <Text color={subTextColor} fontSize={{ base: "md", md: "lg" }} maxW="800px" mx="auto">
                Nuestras funciones principales están diseñadas para darte ventaja competitiva real
              </Text>
            </Box>

            {/* Tarjetas de servicios */}
            <SimpleGrid
              columns={[1, 2, 4]}
              spacing={8}
              mb={16}
            >
              {[
                { 
                  icon: FaSearch, 
                  title: "Búsqueda Inteligente", 
                  desc: "Encuentra jugadores por nombre o alias en segundos con búsqueda avanzada y autocompletado."
                },
                { 
                  icon: FaChartBar, 
                  title: "Estadísticas Avanzadas", 
                  desc: "Consulta stats clave como VPIP, PFR, 3Bet, WTSD, WWSF y más métricas detalladas."
                },
                { 
                  icon: FaRobot, 
                  title: "Análisis con IA", 
                  desc: "Recibe informes de IA personalizados para identificar y explotar debilidades."
                },
                { 
                  icon: FaFileAlt, 
                  title: "Análisis de Manos", 
                  desc: "Sube tus historiales y recibe análisis profesional para mejorar tu juego.",
                  isNew: true
                },
              ].map((feature, i) => (
                <Box
                  key={i}
                  p={6}
                  bgGradient={cardGradient}
                  borderRadius="2xl"
                  color="white"
                  boxShadow="xl"
                  textAlign="center"
                  _hover={{ 
                    transform: "scale(1.03)",
                    boxShadow: "2xl"
                  }}
                  transition="all 0.3s ease"
                  h="100%"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                >
                  {feature.isNew && (
                    <Badge
                      position="absolute"
                      top="10px"
                      right="10px"
                      bg="yellow.400"
                      color="black"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      NUEVO
                    </Badge>
                  )}
                  <Icon 
                    as={feature.icon} 
                    w={14} 
                    h={14} 
                    color="white" 
                    mb={5}
                    className="service-icon"
                    style={{
                      filter: "drop-shadow(0px 2px 5px rgba(0,0,0,0.3))"
                    }}
                  />
                  <Heading size="md" mb={3} fontWeight="bold">
                    {feature.title}
                  </Heading>
                  <Text fontSize="md" lineHeight="1.7">
                    {feature.desc}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>

            {/* Sección de Testimonios */}
            <Box mb={10}>
              <Flex align="center" justify="center" gap={2} mb={8}>
                <Icon as={FaStar} color="yellow.400" boxSize={6} />
                <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} color={headingColor}>
                  Testimonios de jugadores reales
                </Heading>
              </Flex>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                {[
                  {
                    name: "crazymoney.",
                    title: "Jugador NL100 soles",
                    quote: "Nunca había tenido datos tan precisos en tiempo real. Mejoré mi winrate de 2bb/100 a 6bb/100 en solo un mes, deje de jugar en sofwares dificiles y boom ya tengo caja para nl200",
                    stars: 5
                  },
                  {
                    name: "FrancoRC.",
                    title: "Jugador nl25$",
                    quote: "El análisis de IA me ayudó a descubrir patrones y tendencias que habría tardado meses en encontrar por mi cuenta.",
                    stars: 5
                  },
                  {
                    name: "Miguel R.",
                    title: "JUgador Regular de Apps",
                    quote: "Recomiendo PokerProTrack a todos los que juegan NLH Texas en apps, nos ayuda a vencer a esos jugadores dificiles .",
                    stars: 5
                  }
                ].map((testimonial, idx) => (
                  <Box 
                    key={idx}
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    boxShadow="md"
                    _hover={{ 
                      transform: "translateY(-5px)",
                      boxShadow: "lg"
                    }}
                    transition="all 0.3s ease"
                    border="1px solid"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    position="relative"
                    overflow="hidden"
                  >
                    {/* Decoración superior */}
                    <Box 
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      height="5px"
                      bgGradient={cardGradient}
                    />
                    
                    <VStack spacing={4} align="center" pt={2}>
                      <Text fontSize="xl" fontWeight="bold">{testimonial.name}</Text>
                      <Badge bg={brand.primary} color="white">{testimonial.title}</Badge>
                      
                      <Text 
                        fontSize="md"
                        textAlign="center"
                        color={subTextColor}
                        fontStyle="italic"
                        position="relative"
                      >
                        "{testimonial.quote}"
                      </Text>
                      
                      <Flex>
                        {Array(testimonial.stars)
                          .fill("")
                          .map((_, i) => (
                            <Icon
                              key={i}
                              as={FaStar}
                              color="yellow.400"
                              boxSize={4}
                              mr={1}
                            />
                          ))}
                      </Flex>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* CTA Final */}
            <Box 
              bg={cardBg} 
              py={10} 
              px={8} 
              textAlign="center" 
              borderRadius="xl" 
              boxShadow="md"
              mt={16}
              borderTop="4px solid"
              borderColor={brand.primary}
            >
              <Heading size="lg" mb={5} color={headingColor}>
                Potencia tu juego con PokerProTrack, vuelvete un ganador y encuentra las mejores mesas del mercado.
              </Heading>
              <Text fontSize="lg" mb={6} color={subTextColor} maxW="800px" mx="auto">
                Deja de perder dinero y empieza a ganar. Únete a nuestra comunidad de jugadores
              </Text>
              <Button
                onClick={handleRedirect}
                size="lg"
                fontSize="md"
                fontWeight="bold"
                variant="primary"
                px={8}
                py={6}
                borderRadius="full"
                transition="all 0.3s ease"
              >
                Comenzar a ganar
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Home;
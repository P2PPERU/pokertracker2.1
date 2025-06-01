// LandingAnalisisManos.jsx - Página dedicada para conversión
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Badge,
  Container,
  Card,
  CardBody,
  Flex,
  Image,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import {
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
  FaRocket,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { gradients, brand } from '../theme/colors';

const LandingAnalisisManos = () => {
  // Colores del tema
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const testimonyTextColor = useColorModeValue("gray.700", "gray.200");
  const testimonyNameColor = useColorModeValue(brand.primary, "blue.300");
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

        {/* MEGA OFERTA COMBO - MOVIDO A LA PARTE SUPERIOR */}
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
              
              <VStack spacing={2}>
                <Text fontSize="xl" opacity={0.95} maxW="2xl" mx="auto">
                  🎯 La oferta más completa del mercado: Suscripción Premium + Acceso a Clubs VIP + Rakeback hasta 55%
                </Text>
                <Text fontSize="xl" fontWeight="bold" opacity={0.95}>
                  ¡Y pagas solo con las ganancias del rakeback!
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
                <VStack>
                  <Icon as={FaRocket} boxSize={8} />
                  <Text fontWeight="bold">Análisis IA Ilimitado</Text>
                </VStack>
                <VStack>
                  <Icon as={FaMoneyBillWave} boxSize={8} />
                  <Text fontWeight="bold">Rakeback 55%</Text>
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
                  Valor normal: $39.99/mes
                </Text>
                <Text fontSize="5xl" fontWeight="bold" lineHeight="1">
                  $19.99/mes
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
                  Análisis Profesional de
                  <Text as="span" bgGradient="linear(to-r, #FF6B35, #F7931E)" bgClip="text"> 
                    {" "} Stats por Expertos
                  </Text>
                </Heading>
                
                {/* ✅ CORREGIDO: Separé el texto para evitar nesting de elementos */}
                <VStack align="start" spacing={2}>
                  <Text fontSize="xl" color={subtextColor} lineHeight="1.6" fontWeight="medium">
                    Nuestro IA entrenada en Stats analizará tus manos intensamente 
                    buscara leaks y te dará recomendaciones específicas para
                  </Text>
                  <Text fontSize="xl" color="green.500" fontWeight="bold">
                    maximizar tus ganancias.
                  </Text>
                </VStack>

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

              {/* Imagen/Testimonio - ✅ CORREGIDO: Colores para modo oscuro */}
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
                  
                  {/* Testimonio flotante - ✅ CORREGIDO: Colores para modo oscuro */}
                  <Box 
                    position="absolute"
                    bottom="20px"
                    left="20px"
                    right="20px"
                    bg={cardBg}
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
                    <Text fontSize="sm" fontWeight="medium" mb={2} color={testimonyTextColor}>
                      "Mi winrate subió de 2bb/100 a 8bb/100 en NL50 después del análisis"
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color={testimonyNameColor}>
                      - Carlos M., NL50 Regular
                    </Text>
                  </Box>
                </Box>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Sección Clubs y Apps VIP */}
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
            <CardBody p={6}>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <HStack>
                    <Icon as={FaUsers} color="orange.500" boxSize={6} />
                    <Heading size="md" color={textColor}>Clubs VIP Exclusivos</Heading>
                  </HStack>
                  <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                    🔥 HOT
                  </Badge>
                </HStack>
                
                {/* ✅ CORREGIDO: Separé el texto para evitar nesting */}
                <VStack align="start" spacing={1}>
                  <Text color={subtextColor} fontWeight="medium">
                    Accede a los clubs más soft con rakeback hasta 55%
                  </Text>
                  <Text color="green.500" fontWeight="bold">
                    y mesas llenas de recreacionales.
                  </Text>
                </VStack>
                
                <SimpleGrid columns={2} spacing={3} w="full">
                  <HStack>
                    <Icon as={FaMoneyBillWave} color="green.500" />
                    <Text fontSize="sm" color={textColor}>Rakeback 45-55%</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaTrophy} color="gold" />
                    <Text fontSize="sm" color={textColor}>Freerolls VIP</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaHandshake} color="blue.500" />
                    <Text fontSize="sm" color={textColor}>Soporte 24/7</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaChartLine} color="purple.500" />
                    <Text fontSize="sm" color={textColor}>Mesas soft</Text>
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
            <CardBody p={6}>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <HStack>
                    <Icon as={FaPhoneAlt} color="purple.500" boxSize={6} />
                    <Heading size="md" color={textColor}>Apps Premium</Heading>
                  </HStack>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                    💎 VIP
                  </Badge>
                </HStack>
                
                {/* ✅ CORREGIDO: Separé el texto para evitar nesting */}
                <VStack align="start" spacing={1}>
                  <Text color={subtextColor} fontWeight="medium">
                    Las mejores apps de poker con acción garantizada 24/7
                  </Text>
                  <Text color={subtextColor} fontWeight="medium">
                    y el rake más bajo del mercado.
                  </Text>
                </VStack>
                
                <SimpleGrid columns={2} spacing={3} w="full">
                  <HStack>
                    <Icon as={FaStar} color="yellow.400" />
                    <Text fontSize="sm" color={textColor}>Mesas activas</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaGift} color="pink.500" />
                    <Text fontSize="sm" color={textColor}>Bonos VIP</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm" color={textColor}>Retiros rápidos</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaFire} color="red.500" />
                    <Text fontSize="sm" color={textColor}>Rake bajo</Text>
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

        {/* Call to Action Final */}
        <Card textAlign="center" p={8} boxShadow="xl">
          <CardBody>
            <VStack spacing={6}>
              <Icon as={FaWhatsapp} boxSize={20} color={whatsappGreen} />
              
              <Heading size="xl" color={textColor}>
                ¿Listo para ser un jugador EV+?
              </Heading>
              
              {/* ✅ CORREGIDO: Separé el texto para evitar nesting */}
              <VStack spacing={2}>
                <Text color={subtextColor} maxW="lg" mx="auto" fontSize="lg">
                  Únete a cientos de jugadores que ya están ganando más con nuestro sistema completo.
                </Text>
                <Text color="green.500" fontWeight="bold" fontSize="lg">
                  ¡El 87% de nuestros clientes mejora su winrate en 30 días!
                </Text>
              </VStack>

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
};

export default LandingAnalisisManos;
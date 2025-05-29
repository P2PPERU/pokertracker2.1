import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Heading, Grid, Flex, Badge, useColorModeValue, Spinner,
  VStack, HStack, Text, Divider, IconButton, Icon
} from "@chakra-ui/react";
import {
  FaStar, FaTrash, FaHandPaper, FaDollarSign, FaChartLine,
  FaChartPie, FaArrowUp, FaArrowDown, FaSyncAlt, FaWalking,
  FaHandPointUp, FaPercentage, FaWater, FaExclamationTriangle,
  FaMedal, FaChevronDown, FaChevronUp, FaDatabase
} from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const StatBoxEnhanced = React.memo(({ 
  icon: Icon, 
  title, 
  value, 
  color = "blue.500", 
  warning = false,
  isSpecial = false
}) => {
  const defaultBorderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const iconDefaultColor = useColorModeValue("gray.500", "gray.200");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const valueColor = warning 
    ? useColorModeValue("orange.500", "orange.300") 
    : isSpecial 
      ? useColorModeValue("green.500", "green.300") 
      : textColor;

  let numericValue = value;
  const parsedValue = parseFloat(value);
  if (!isNaN(parsedValue)) {
    numericValue = Math.round(parsedValue);
  } else {
    numericValue = value.includes("%") || value.includes("$") ? value : "—";
  }

  return (
    <Box
      p={3}
      border="1px solid"
      borderColor={defaultBorderColor}
      borderRadius="lg"
      bg={bgColor}
      boxShadow="md"
      textAlign="center"
      transition="all 0.2s"
      _hover={{ 
        transform: "translateY(-2px)", 
        boxShadow: "lg",
        borderColor: color
      }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      position="relative"
      overflow="hidden"
    >
      {Icon && (
        <Box color={iconDefaultColor} mb={2}>
          <Icon size="20px" />
        </Box>
      )}
      
      <Text 
        fontWeight="bold" 
        fontSize="xs" 
        color={textColor}
        mb={1}
      >
        {title.toUpperCase()}
      </Text>
      
      <Text 
        fontSize="lg" 
        fontWeight="semibold" 
        color={valueColor}
      >
        {numericValue}
      </Text>
      
      {warning && (
        <Box 
          position="absolute" 
          bottom={1} 
          right={1} 
          color="orange.500"
          fontSize="10px"
        >
          <FaExclamationTriangle />
        </Box>
      )}
    </Box>
  );
});

const Favoritos = () => {
  // Paleta de colores del encabezado que se muestra en la imagen
  const mainGradient = useColorModeValue(
    "linear(to-r, #6CB5FE, #4066ED)", 
    "linear(to-r, #6CB5FE, #4066ED)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  
  const [favoritos, setFavoritos] = useState([]);
  const [datos, setDatos] = useState({});
  const [mostrarStats, setMostrarStats] = useState({});
  const [refreshFavorites, setRefreshFavorites] = useState(0);
  const [loading, setLoading] = useState(true);

  const auth = useAuth()?.auth;
  const tieneSuscripcionAvanzada = ["plata", "oro"].includes(auth?.suscripcion);

  useEffect(() => {
    const fetchFavoritos = async () => {
      setLoading(true);
      try {
        const res = await api.get("/favoritos", {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setFavoritos(res.data);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchFavoritos();
    }
  }, [auth?.token, refreshFavorites]);

  const eliminarFavorito = async (nombre, sala) => {
    try {
      await api.delete(`/favoritos/${sala}/${encodeURIComponent(nombre)}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setRefreshFavorites((prev) => prev + 1);
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
    }
  };

  const cargarDatos = useCallback(async () => {
    const resultados = {};
    for (const favorito of favoritos) {
      try {
        const res = await api.get(
          `/jugador/${favorito.sala}/${encodeURIComponent(favorito.player_name)}`
        );
        resultados[favorito.player_name] = res.data;
      } catch (error) {
        console.error(`Error cargando datos de ${favorito.player_name}:`, error);
      }
    }
    setDatos(resultados);
  }, [favoritos]);

  useEffect(() => {
    if (favoritos.length > 0) {
      cargarDatos();
    }
  }, [favoritos, cargarDatos]);

  const toggleStats = (nombre) => {
    setMostrarStats((prev) => ({
      ...prev,
      [nombre]: !prev[nombre],
    }));
  };

  if (!auth?.token) return (
    <Flex justify="center" align="center" height="100vh">
      <Spinner size="xl" thickness="4px" color="#4066ED" /> 
    </Flex>
  );

  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
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
                Jugadores Favoritos
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
        </Box>

        {loading ? (
          <Flex justify="center" my={10}>
            <Spinner size="xl" thickness="4px" color="#4066ED" />
          </Flex>
        ) : favoritos.length === 0 ? (
          <Box 
            p={8} 
            bg={cardBg} 
            borderRadius="xl" 
            textAlign="center"
            boxShadow="base"
          >
            <VStack spacing={3}>
              <Icon as={FaStar} boxSize={10} color="gray.400" />
              <Text fontSize="xl" color={textColor}>No tienes jugadores favoritos aún</Text>
              <Text color={subtextColor}>Guarda jugadores para acceder rápidamente a sus estadísticas</Text>
            </VStack>
          </Box>
        ) : (
          <Box>
            {favoritos.map((jugador, idx) => {
              const data = datos[jugador.player_name];

              return (
                <Box 
                  key={idx} 
                  mb={6} 
                  bg={cardBg} 
                  borderRadius="xl" 
                  boxShadow="base"
                  overflow="hidden"
                  position="relative"
                >
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
                
                  <Flex 
                    align="center" 
                    justify="space-between" 
                    p={4} 
                    borderBottom={mostrarStats[jugador.player_name] ? "1px solid" : "none"}
                    borderColor="gray.200"
                    position="relative"
                    zIndex={1}
                  >
                    <HStack spacing={3}>
                      <Badge 
                        colorScheme="blue" 
                        fontSize="xl" 
                        p={2} 
                        borderRadius="md"
                      >
                        {jugador.player_name}
                      </Badge>
                      <Badge colorScheme="blue" fontSize="sm">
                        {jugador.sala}
                      </Badge>
                      <Icon as={FaStar} color="yellow.400" boxSize={4} />
                    </HStack>

                    <HStack>
                      <IconButton
                        aria-label="Ver estadísticas"
                        icon={mostrarStats[jugador.player_name] ? <FaChevronUp /> : <FaChevronDown />}
                        onClick={() => toggleStats(jugador.player_name)}
                        variant="ghost"
                        size="sm"
                      />
                      <IconButton
                        aria-label="Eliminar favorito"
                        icon={<FaTrash />}
                        onClick={() => eliminarFavorito(jugador.player_name, jugador.sala)}
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                      />
                    </HStack>
                  </Flex>

                  {!data && mostrarStats[jugador.player_name] && (
                    <Flex justify="center" p={6}>
                      <Spinner size="md" thickness="3px" color="#4066ED" />
                    </Flex>
                  )}
                  
                  {data && mostrarStats[jugador.player_name] && (
                    <Box p={4} position="relative" zIndex={1}>
                      <Flex mb={4} wrap="wrap" gap={4}>
                        <VStack align="flex-start" spacing={0}>
                          <Text color={subtextColor} fontSize="sm">Manos jugadas</Text>
                          <Text fontSize="xl" fontWeight="bold" color={textColor}>
                            {data.total_manos}
                          </Text>
                        </VStack>
                        
                        <VStack align="flex-start" spacing={0}>
                          <Text color={subtextColor} fontSize="sm">Winrate</Text>
                          <Text 
                            fontSize="xl" 
                            fontWeight="bold" 
                            color={parseFloat(data.bb_100) > 0 ? "green.500" : "red.500"}
                          >
                            {data.bb_100} BB/100
                          </Text>
                        </VStack>
                        
                        <VStack align="flex-start" spacing={0}>
                          <Text color={subtextColor} fontSize="sm">Ganancias</Text>
                          <Text 
                            fontSize="xl" 
                            fontWeight="bold"
                            color={parseFloat(data.win_usd) > 0 ? "green.500" : "red.500"}
                          >
                            ${data.win_usd}
                          </Text>
                        </VStack>
                      </Flex>

                      <Divider mb={4} />

                      <Grid
                        templateColumns={{
                          base: "repeat(auto-fill, minmax(100px, 1fr))",
                          sm: "repeat(auto-fill, minmax(110px, 1fr))",
                          md: "repeat(6, 1fr)"
                        }}
                        gap={3}
                        width="100%"
                      >
                        <StatBoxEnhanced
                          icon={FaHandPaper}
                          title="Manos Jugadas"
                          value={data.total_manos}
                          color="blue.500"
                        />
                        <StatBoxEnhanced
                          icon={FaDollarSign}
                          title="Ganancias USD"
                          value={`$${data.win_usd}`}
                          color="green.500"
                          isSpecial={parseFloat(data.win_usd) > 0}
                        />
                        <StatBoxEnhanced
                          icon={FaChartLine}
                          title="WINRATE"
                          value={`${data.bb_100} BB/100`}
                          color="blue.600"
                          isSpecial={parseFloat(data.bb_100) > 0}
                        />
                        <StatBoxEnhanced
                          icon={FaChartPie}
                          title="VPIP"
                          value={`${data.vpip}%`}
                          color="blue.500"
                          warning={parseFloat(data.vpip) > 30}
                        />
                        <StatBoxEnhanced
                          icon={FaArrowUp}
                          title="PFR"
                          value={`${data.pfr}%`}
                          color="blue.500"
                          warning={parseFloat(data.pfr) > 25}
                        />
                        <StatBoxEnhanced
                          icon={FaSyncAlt}
                          title="3 BET"
                          value={`${data.three_bet}%`}
                          color="blue.400"
                          warning={parseFloat(data.three_bet) > 12}
                        />
                        <StatBoxEnhanced
                          icon={FaArrowDown}
                          title="Fold to 3-BET"
                          value={`${data.fold_to_3bet_pct}%`}
                          color="red.500"
                        />
                        
                        <StatBoxEnhanced
                          icon={FaArrowUp}
                          title="4 Bet Preflop"
                          value={`${data.four_bet_preflop_pct}%`}
                          color="blue.600"
                          warning={parseFloat(data.four_bet_preflop_pct) > 10}
                        />
                        <StatBoxEnhanced
                          icon={FaArrowDown}
                          title="Fold to 4-Bet"
                          value={`${data.fold_to_4bet_pct}%`}
                          color="orange.500"
                        />
                        <StatBoxEnhanced
                          icon={FaChartPie}
                          title="CBet Flop"
                          value={`${data.cbet_flop}%`}
                          color="blue.500"
                        />
                        <StatBoxEnhanced
                          icon={FaChartPie}
                          title="CBet Turn"
                          value={`${data.cbet_turn}%`}
                          color="blue.500"
                        />
                        <StatBoxEnhanced
                          icon={FaPercentage}
                          title="WWSF"
                          value={`${data.wwsf}%`}
                          color="green.500"
                        />
                        <StatBoxEnhanced
                          icon={FaPercentage}
                          title="WTSD"
                          value={`${data.wtsd}%`}
                          color="blue.500"
                        />
                        <StatBoxEnhanced
                          icon={FaPercentage}
                          title="WSD"
                          value={`${data.wsd}%`}
                          color="blue.600"
                          isSpecial={parseFloat(data.wsd) > 55}
                        />
                        <StatBoxEnhanced
                          icon={FaWalking}
                          title="Limp %"
                          value={`${data.limp_pct}%`}
                          color="orange.500"
                          warning={parseFloat(data.limp_pct) > 15}
                        />
                        <StatBoxEnhanced
                          icon={FaHandPointUp}
                          title="Limp-Raise %"
                          value={`${data.limp_raise_pct}%`}
                          color="red.500"
                          warning={parseFloat(data.limp_raise_pct) > 5}
                        />
                        <StatBoxEnhanced
                          icon={FaArrowDown}
                          title="Fold to Flop CBet"
                          value={`${data.fold_to_flop_cbet_pct}%`}
                          color="blue.400"
                        />
                        <StatBoxEnhanced
                          icon={FaArrowDown}
                          title="Fold to Turn CBet"
                          value={`${data.fold_to_turn_cbet_pct}%`}
                          color="blue.500"
                        />
                        <StatBoxEnhanced
                          icon={FaChartPie}
                          title="Probe Bet Turn %"
                          value={`${data.probe_bet_turn_pct}%`}
                          color="blue.600"
                        />
                        <StatBoxEnhanced
                          icon={FaWater}
                          title="Bet River %"
                          value={`${data.bet_river_pct}%`}
                          color="blue.500"
                        />
                        <StatBoxEnhanced
                          icon={FaArrowDown}
                          title="Fold to River Bet"
                          value={`${data.fold_to_river_bet_pct}%`}
                          color="red.500"
                        />
                        <StatBoxEnhanced
                          icon={FaExclamationTriangle}
                          title="Overbet Turn %"
                          value={`${data.overbet_turn_pct}%`}
                          color="orange.500"
                          warning={parseFloat(data.overbet_turn_pct) > 10}
                        />
                        <StatBoxEnhanced
                          icon={FaExclamationTriangle}
                          title="Overbet River %"
                          value={`${data.overbet_river_pct}%`}
                          color="orange.500"
                          warning={parseFloat(data.overbet_river_pct) > 10}
                        />
                        <StatBoxEnhanced
                          icon={FaMedal}
                          title="WSDwBR %"
                          value={`${data.wsdwbr_pct}%`}
                          color="green.500"
                          isSpecial={parseFloat(data.wsdwbr_pct) > 60}
                        />
                      </Grid>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Favoritos;
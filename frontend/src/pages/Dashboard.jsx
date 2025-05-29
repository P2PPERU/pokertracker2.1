import React from 'react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Grid,
  List,
  ListItem,
  Badge,
  Input,
  Button,
  Flex,
  Select,
  useClipboard,
  useToast,
  useColorMode,
  useColorModeValue,
  IconButton,
  VStack,
  HStack,
  Divider,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, SearchIcon } from '@chakra-ui/icons';
import {
  FaHandPaper,
  FaDollarSign,
  FaChartLine,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaWalking,
  FaHandPointUp,
  FaPercentage,
  FaWater,
  FaExclamationTriangle,
  FaMedal,
  FaSearch,
  FaStar,
  FaDatabase,
  FaUsers,
  FaUserTie,
  FaCopyright,
} from "react-icons/fa";
import { Link } from 'react-router-dom';
import api from '../services/api';
import GraficoGanancias from '../components/GraficoGanancias';
import AnalisisJugador from '../components/AnalisisJugador';
import { useAuth } from '../context/AuthContext';
import _ from 'lodash';
import { gradients, brand, stats, money } from '../theme/colors';
import { useStatColor } from '../hooks/useStatColor';
import StatBox from '../components/Statbox';

const Dashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  // Valores de color mejorados
  const mainGradient = gradients.main;
  const cardBg = useColorModeValue("white", "gray.800");
  const suggestionBg = useColorModeValue("white", "gray.700");
  const suggestionBorderColor = useColorModeValue("gray.200", "gray.600");
  const iconButtonColor = brand.primary;
  const selectFocusBorderColor = brand.primary;
  const inputBg = useColorModeValue("white", "gray.700");
  const inputFocusBorderColor = brand.primary;
  const listItemHoverBg = useColorModeValue("gray.100", "gray.600");
  const pageBg = useColorModeValue("#f8fafc", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");

  const authData = useAuth();
  const auth = authData?.auth;
  const [jugador, setJugador] = useState(null);
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const sugerenciasRef = useRef(null);
  const [salaSeleccionada, setSalaSeleccionada] = useState("XPK");

  // Estado para estadísticas y copiado
  const [selectedStats, setSelectedStats] = useState({});
  const { onCopy, setValue } = useClipboard("");
  const [statsText, setStatsText] = useState("");
  const toast = useToast();

  // Estados para favoritos
  const [esFavorito, setEsFavorito] = useState(false);
  const [favoritos, setFavoritos] = useState([]);

  // Función para obtener sugerencias (se memoriza para usar en el debounce)
  const fetchSugerencias = useCallback(async (query) => {
    if (query.length < 3) {
      setSugerencias([]);
      return;
    }
    try {
      const res = await api.get(`/jugador/autocomplete/${salaSeleccionada}/${query}`);
      setSugerencias(res.data);
      setMostrarSugerencias(true);
    } catch (error) {
      console.error("Error al obtener sugerencias:", error);
    }
  }, [salaSeleccionada]);

  // Debounce de la función de sugerencias
  const debouncedFetchSugerencias = useMemo(
    () => _.debounce(fetchSugerencias, 300),
    [fetchSugerencias]
  );

  // Manejo del input con useCallback
  const handleInputChange = useCallback((e) => {
    setNombreBuscado(e.target.value);
    debouncedFetchSugerencias(e.target.value);
  }, [debouncedFetchSugerencias]);

  // Función para buscar jugador
  const buscarJugador = useCallback(async (nombre) => {
    setLoading(true);
    setSugerencias([]);
    setSelectedStats({});
    try {
      const res = await api.get(`/jugador/${salaSeleccionada}/${encodeURIComponent(nombre)}`);
      const jugadorData = res.data;
      setJugador(jugadorData);
  
      // Verificar si es favorito al buscar
      if (auth?.token) {
        try {
          const resFavorito = await api.get(
            `/favoritos/${salaSeleccionada}/${encodeURIComponent(jugadorData.player_name)}`,
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
          setEsFavorito(resFavorito.data.favorito);
        } catch (error) {
          setEsFavorito(false); // si da error, asume que no es favorito
          console.error("Error al verificar favorito (post búsqueda):", error);
        }
      }
  
    } catch (error) {
      console.error("Jugador no encontrado:", error);
      setJugador(null);
      setEsFavorito(false);
    }
    setLoading(false);
  }, [salaSeleccionada, auth?.token]);
  
  // Alternar favorito (agregar o eliminar en el backend)
  const toggleFavorito = async () => {
    if (!jugador) return;
  
    try {
      if (esFavorito) {
        // Eliminar favorito
        await api.delete(`/favoritos/${salaSeleccionada}/${encodeURIComponent(jugador.player_name)}`, {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setEsFavorito(false);
        setFavoritos((prev) => prev.filter((fav) => fav.player_name !== jugador.player_name));
      } else {
        // Agregar favorito
        await api.post(
          "/favoritos",
          { player_name: jugador.player_name, sala: salaSeleccionada },
          { headers: { Authorization: `Bearer ${auth?.token}` } }
        );
        setEsFavorito(true);
        setFavoritos((prev) => [...prev, { player_name: jugador.player_name, sala: salaSeleccionada }]);
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
    }
  };

  // Buscar jugador predeterminado al montar
  useEffect(() => {
    buscarJugador("ABCPK0206");
  }, [buscarJugador]);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const res = await api.get("/favoritos", {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setFavoritos(res.data); // [{ player_name, sala }]
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
      }
    };

    if (auth?.token) {
      fetchFavoritos();
    }
  }, [auth?.token]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sugerenciasRef.current && !sugerenciasRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cancelar el debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedFetchSugerencias.cancel();
    };
  }, [debouncedFetchSugerencias]);

  // Memoriza la función de toggle para estadísticas
  const toggleStatSelection = useCallback((title, value) => {
    setSelectedStats((prev) => ({
      ...prev,
      [title]: prev[title] ? undefined : value,
    }));
  }, []);

  // Actualizar el texto de estadísticas cuando cambian las estadísticas seleccionadas
  useEffect(() => {
    const computedStatsText = Object.entries(selectedStats)
      .filter(([_, value]) => value !== undefined)
      .map(([title, value]) => `${title}: ${value}`)
      .join("\n");
    setStatsText(computedStatsText);
  }, [selectedStats]);

  const statAbbreviations = {
    "VPIP": "VPIP",
    "PFR": "PFR",
    "3 BET": "3B",
    "Fold to 3-BET": "F3B",
    "4 Bet Preflop": "4B",
    "Fold to 4-Bet": "F4B",
    "CBet Flop": "CBFlop",
    "CBet Turn": "CBTurn",
    "WWSF": "WWSF",
    "WTSD": "WTSD",
    "WSD": "WSD",
    "Limp %": "Limp",
    "Limp-Raise %": "LimpR",
    "Fold to Flop CBet": "FoldCBF",
    "Fold to Turn CBet": "FoldCBT",
    "Probe Bet Turn %": "PROBET",
    "Bet River %": "BRiver",
    "Fold to River Bet": "FoldRB",
    "Overbet Turn %": "OBT",
    "Overbet River %": "OBR",
    "WSDwBR %": "WSDwBR",
    "Manos Jugadas": "Hands",
    "Ganancias USD": "Win$",
    "WINRATE": "WR"
  };

  const copyStats = () => {
    const statsText = Object.entries(selectedStats)
      .filter(([_, value]) => value !== undefined)
      .map(([title, value]) => {
        const cleanTitle = title.replace(/\s+/g, " ").trim();
        const abbreviation = statAbbreviations[cleanTitle] || cleanTitle.replace(/\s+/g, "");
  
        let numericValue = value;
        const numberMatch = value.match(/[-]?\d+(\.\d+)?/);
        if (numberMatch) {
          const number = parseFloat(numberMatch[0]);
          const rounded = Math.round(number);
          const hasPercent = value.includes("%");
          const hasDollar = value.includes("$");
          numericValue = `${hasDollar ? "$" : ""}${rounded}`;
        }
  
        return `${abbreviation}:${numericValue}`;
      })
      .join("/");
  
    if (!statsText) {
      toast({
        title: "No hay estadísticas seleccionadas",
        description: "Selecciona al menos una estadística antes de copiar.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
  
    navigator.clipboard.writeText(statsText)
      .then(() => {
        toast({
          title: "Estadísticas copiadas",
          description: "Ahora puedes pegarlas en la app de poker",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar al portapapeles",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  };

  if (auth === undefined) return <Spinner />;

  const tieneSuscripcionAvanzada = ["plata", "oro"].includes(auth.suscripcion);

  // Definición del componente StatBoxEnhanced (reemplaza al anterior StatBox)


  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Box maxW="1400px" mx="auto">
        {/* Header mejorado con degradado */}
        <Box 
          bgGradient={mainGradient}
          borderRadius="xl" 
          py={6} 
          px={8} 
          mb={6}
          boxShadow="lg"
        >
          <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
            <VStack align="flex-start" spacing={1}>
              <HStack>
                <FaDatabase color="white" fontSize="1.25rem" />
                <Heading size="lg" color="white" fontWeight="bold">
                  PokerProStats
                </Heading>
              </HStack>
              <Text color="whiteAlpha.800" fontSize="sm">
                Análisis avanzado de jugadores con IA
              </Text>
            </VStack>
            
            <HStack spacing={4}>
              <Link to="/favoritos">
                <Button 
                  variant="solid" 
                  size="md"
                  colorScheme="whiteAlpha"
                  leftIcon={<FaStar />}
                  _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
                >
                  Favoritos
                </Button>
              </Link>
              
              <IconButton
                aria-label="Toggle Color Mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="solid"
                colorScheme="whiteAlpha"
                size="md"
              />
            </HStack>
          </Flex>
          
          {/* Búsqueda de jugador mejorada */}
          <Box mt={6}>
            <Flex gap={4} align="center" mb={2}>
              <Select
                value={salaSeleccionada}
                onChange={(e) => setSalaSeleccionada(e.target.value)}
                maxW="150px"
                bg="whiteAlpha.200"
                color="white"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "whiteAlpha.400" }}
                _focus={{ borderColor: "white" }}
              >
                <option value="XPK">X-Poker</option>
                <option value="PPP">PPPoker</option>
                <option value="SUP">SupremaPoker</option>
              </Select>
              
              <Box position="relative" flex="1" maxW={{ base: "100%", md: "400px" }}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="whiteAlpha.700" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar jugador por nombre o alias..."
                    value={nombreBuscado}
                    onChange={handleInputChange}
                    onFocus={() => setMostrarSugerencias(true)}
                    bg="whiteAlpha.200"
                    color="white"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "whiteAlpha.400" }}
                    _focus={{ borderColor: "white" }}
                    _placeholder={{ color: "whiteAlpha.700" }}
                  />
                </InputGroup>
                
                {mostrarSugerencias && sugerencias.length > 0 && (
                  <List
                    ref={sugerenciasRef}
                    borderWidth="1px"
                    borderColor={suggestionBorderColor}
                    borderRadius="md"
                    mt={1}
                    bg={suggestionBg}
                    position="absolute"
                    width="100%"
                    maxWidth="100%"
                    boxShadow="xl"
                    zIndex="10"
                    maxH="300px"
                    overflowY="auto"
                  >
                    {sugerencias.map((jug, index) => (
                      <ListItem
                        key={index}
                        p={3}
                        cursor="pointer"
                        _hover={{ background: listItemHoverBg }}
                        onClick={() => {
                          setNombreBuscado(jug.player_name);
                          buscarJugador(jug.player_name);
                          setMostrarSugerencias(false);
                        }}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        transition="all 0.2s"
                      >
                        <Flex align="center">
                          <Icon as={FaUserTie} mr={2} color="gray.500" />
                          {jug.player_name}
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
              
              <Button
                size="lg"
                bg="white"
                color={brand.primary}
                _hover={{ 
                  bg: "gray.50",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                leftIcon={<FaSearch />}
                onClick={() => buscarJugador(nombreBuscado)}
                transition="all 0.2s"
              >
                Buscar
              </Button>
            </Flex>
          </Box>
        </Box>

        {loading && (
          <Flex justify="center" my={10}>
            <Spinner size="xl" thickness="4px" color={brand.primary} />
          </Flex>
        )}
        
        {!loading && !jugador && (
          <Box 
            p={8} 
            bg={cardBg} 
            borderRadius="xl" 
            textAlign="center"
            boxShadow="base"
          >
            <VStack spacing={3}>
              <Icon as={FaSearch} boxSize={10} color="gray.400" />
              <Text fontSize="xl" color={textColor}>No se encontraron datos del jugador</Text>
              <Text color={subtextColor}>Intenta buscar por nombre o alias</Text>
            </VStack>
          </Box>
        )}

        {jugador && (
          <Box>
            {/* Tarjeta de información del jugador */}
            <Flex 
              direction={{ base: "column", md: "row" }} 
              gap={6} 
              mb={6}
            >
              {/* Panel izquierdo - Información y análisis IA */}
              <Box 
                flex={{ base: "1", lg: "3" }} 
                maxW={{ base: "100%", lg: "65%" }}
              >
                <Box 
                  p={6} 
                  bg={cardBg} 
                  borderRadius="xl" 
                  boxShadow="base"
                  mb={6}
                  position="relative"
                  overflow="hidden"
                >
                  {/* Decoración de fondo sutil */}
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
                  
                  <HStack mb={4} position="relative" zIndex={1}>
                    <Heading size="lg" color={textColor}>
                      Información del Jugador
                    </Heading>
                  </HStack>
                  
                  <Flex 
                    mb={4} 
                    direction={{ base: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ base: "flex-start", sm: "center" }}
                    wrap="wrap"
                    gap={3}
                    position="relative"
                    zIndex={1}
                  >
                    <HStack spacing={3}>
                      <VStack align="flex-start" spacing={1}>
                        <Text color={subtextColor} fontSize="sm">Nickname</Text>
                        <HStack>
                          <Badge 
                            bg={brand.primary}
                            color="white" 
                            fontSize="2xl" 
                            p={2} 
                            borderRadius="md"
                          >
                            {jugador.player_name}
                          </Badge>
                          
                          <IconButton
                            aria-label={esFavorito ? "Eliminar de favoritos" : "Agregar a favoritos"}
                            icon={<Icon as={FaStar} color={esFavorito ? "yellow.400" : "gray.400"} />}
                            onClick={toggleFavorito}
                            variant="ghost"
                            size="md"
                            _hover={{ transform: "scale(1.1)" }}
                            transition="all 0.2s"
                          />
                        </HStack>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={6} wrap="wrap">
                      {/* Stats principales */}
                      <VStack align="flex-start" spacing={0}>
                        <Text color={subtextColor} fontSize="sm">Manos jugadas</Text>
                        <Text fontSize="xl" fontWeight="bold" color={textColor}>
                          {jugador.total_manos}
                        </Text>
                      </VStack>
                      
                      <VStack align="flex-start" spacing={0}>
                        <Text color={subtextColor} fontSize="sm">Winrate</Text>
                        <Text 
                          fontSize="xl" 
                          fontWeight="bold" 
                          color={parseFloat(jugador.bb_100) > 0 ? "green.500" : parseFloat(jugador.bb_100) < 0 ? "red.500" : "gray.500"}
                        >
                          {jugador.bb_100} BB/100
                        </Text>
                      </VStack>
                      
                      <VStack align="flex-start" spacing={0}>
                        <Text color={subtextColor} fontSize="sm">Ganancias</Text>
                        <Text 
                          fontSize="xl" 
                          fontWeight="bold"
                          color={parseFloat(jugador.win_usd) > 0 ? "green.500" : parseFloat(jugador.win_usd) < 0 ? "red.500" : "gray.500"}
                        >
                          ${jugador.win_usd}
                        </Text>
                      </VStack>
                    </HStack>
                  </Flex>
                  
                  <Divider mb={4} />
                  
                  <Box position="relative" zIndex={1}>
                    <Flex justifyContent="space-between" alignItems="center" mb={4}>
                      <Heading size="md" color={textColor}>
                        Estadísticas seleccionadas
                      </Heading>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<FaCopyright />}
                        onClick={copyStats}
                        isDisabled={Object.keys(selectedStats).length === 0}
                      >
                        Copiar Estadísticas
                      </Button>
                    </Flex>
                    
                    {Object.keys(selectedStats).length > 0 ? (
                      <Box 
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        bg={useColorModeValue("gray.50", "gray.700")}
                        fontSize="sm"
                      >
                        {Object.entries(selectedStats).map(([title, value]) => (
                          <Text key={title} mb={1}>
                            <b>{title}:</b> {value}
                          </Text>
                        ))}
                      </Box>
                    ) : (
                      <Text fontSize="sm" color={subtextColor} fontStyle="italic">
                        Selecciona estadísticas haciendo clic en ellas en la tabla de abajo
                      </Text>
                    )}
                  </Box>
                </Box>
                
                {/* Panel de análisis IA */}
                <AnalisisJugador
                  nombre={jugador.player_name}
                  salaSeleccionada={salaSeleccionada}
                  suscripcionUsuario={auth.suscripcion}
                />
              </Box>
              
              {/* Panel derecho - Estadísticas detalladas */}
              <Box 
                flex={{ base: "1", lg: "4" }} 
                maxW={{ base: "100%", lg: "70%" }}
              >
                <Box 
                  p={6} 
                  bg={cardBg} 
                  borderRadius="xl" 
                  boxShadow="base"
                  position="relative"
                  overflow="hidden"
                >
                  <Box 
                    position="absolute" 
                    bottom="-10%" 
                    left="-5%" 
                    w="200px" 
                    h="200px" 
                    bgGradient={mainGradient}
                    opacity="0.05"
                    borderRadius="full"
                    zIndex={0}
                  />
                  
                  <HStack mb={6} position="relative" zIndex={1}>
                    <Heading size="md" color={textColor}>
                      Estadísticas Detalladas
                    </Heading>
                    <Badge 
                      bg={brand.primary}
                      color="white" 
                      fontSize="md"
                    >
                      {jugador.player_name}
                    </Badge>
                  </HStack>
                  
                  {/* Grid de estadísticas detalladas */}
                  <Box 
                    overflowX="auto" 
                    pb={2}
                    position="relative"
                    zIndex={1}
                  >
                    <Grid
                      templateColumns={{
                        base: "repeat(auto-fill, minmax(100px, 1fr))",
                        sm: "repeat(auto-fill, minmax(110px, 1fr))",
                        md: "repeat(6, 1fr)"
                      }}
                      gap={3}
                      width="100%"
                    >
                      <StatBox
                        icon={FaHandPaper}
                        title="Manos Jugadas"
                        value={jugador.total_manos}
                        onClick={() => toggleStatSelection("Manos Jugadas", jugador.total_manos)}
                        isSelected={selectedStats["Manos Jugadas"] !== undefined}
                        color={brand.primary}
                      />
                      <StatBox
                        icon={FaDollarSign}
                        title="Ganancias USD"
                        value={`$${jugador.win_usd}`}
                        onClick={() => toggleStatSelection("Ganancias USD", `$${jugador.win_usd}`)}
                        isSelected={selectedStats["Ganancias USD"] !== undefined}
                        color={brand.primary}
                        isSpecial={parseFloat(jugador.win_usd) > 0}
                      />
                      <StatBox
                        icon={FaChartLine}
                        title="WINRATE"
                        value={`${jugador.bb_100} BB/100`}
                        onClick={() => toggleStatSelection("WINRATE", `${jugador.bb_100} BB/100`)}
                        isSelected={selectedStats["WINRATE"] !== undefined}
                        color={brand.primary}
                        isSpecial={parseFloat(jugador.bb_100) > 0}
                      />
                      <StatBox
                        icon={FaChartPie}
                        title="VPIP"
                        value={`${jugador.vpip}%`}
                        onClick={() => toggleStatSelection("VPIP", `${jugador.vpip}%`)}
                        isSelected={selectedStats["VPIP"] !== undefined}
                        color={brand.primary}
                        warning={parseFloat(jugador.vpip) > 30}
                      />
                      <StatBox
                        icon={FaArrowUp}
                        title="PFR"
                        value={`${jugador.pfr}%`}
                        onClick={() => toggleStatSelection("PFR", `${jugador.pfr}%`)}
                        isSelected={selectedStats["PFR"] !== undefined}
                        color={brand.primary}
                        warning={parseFloat(jugador.pfr) > 25}
                      />
                      <StatBox
                        icon={FaSyncAlt}
                        title="3 BET"
                        value={`${jugador.three_bet}%`}
                        onClick={() => toggleStatSelection("3 BET", `${jugador.three_bet}%`)}
                        isSelected={selectedStats["3 BET"] !== undefined}
                        color={brand.primary}
                        warning={parseFloat(jugador.three_bet) > 12}
                      />
                      <StatBox
                        icon={FaArrowDown}
                        title="Fold to 3-BET"
                        value={`${jugador.fold_to_3bet_pct}%`}
                        onClick={() => toggleStatSelection("Fold to 3-BET", `${jugador.fold_to_3bet_pct}%`)}
                        isSelected={selectedStats["Fold to 3-BET"] !== undefined}
                        color={brand.primary}
                      />
                      
                      {tieneSuscripcionAvanzada && (
                        <>
                          <StatBox
                            icon={FaArrowUp}
                            title="4 Bet Preflop"
                            value={`${jugador.four_bet_preflop_pct}%`}
                            onClick={() => toggleStatSelection("4 Bet Preflop", `${jugador.four_bet_preflop_pct}%`)}
                            isSelected={selectedStats["4 Bet Preflop"] !== undefined}
                            color={brand.primary}
                            warning={parseFloat(jugador.four_bet_preflop_pct) > 10}
                          />
                          <StatBox
                            icon={FaArrowDown}
                            title="Fold to 4-Bet"
                            value={`${jugador.fold_to_4bet_pct}%`}
                            onClick={() => toggleStatSelection("Fold to 4-Bet", `${jugador.fold_to_4bet_pct}%`)}
                            isSelected={selectedStats["Fold to 4-Bet"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaChartPie}
                            title="CBet Flop"
                            value={`${jugador.cbet_flop}%`}
                            onClick={() => toggleStatSelection("CBet Flop", `${jugador.cbet_flop}%`)}
                            isSelected={selectedStats["CBet Flop"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaChartPie}
                            title="CBet Turn"
                            value={`${jugador.cbet_turn}%`}
                            onClick={() => toggleStatSelection("CBet Turn", `${jugador.cbet_turn}%`)}
                            isSelected={selectedStats["CBet Turn"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaPercentage}
                            title="WWSF"
                            value={`${jugador.wwsf}%`}
                            onClick={() => toggleStatSelection("WWSF", `${jugador.wwsf}%`)}
                            isSelected={selectedStats["WWSF"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaPercentage}
                            title="WTSD"
                            value={`${jugador.wtsd}%`}
                            onClick={() => toggleStatSelection("WTSD", `${jugador.wtsd}%`)}
                            isSelected={selectedStats["WTSD"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaPercentage}
                            title="WSD"
                            value={`${jugador.wsd}%`}
                            onClick={() => toggleStatSelection("WSD", `${jugador.wsd}%`)}
                            isSelected={selectedStats["WSD"] !== undefined}
                            color={brand.primary}
                            isSpecial={parseFloat(jugador.wsd) > 55}
                          />
                          <StatBox
                            icon={FaWalking}
                            title="Limp %"
                            value={`${jugador.limp_pct}%`}
                            onClick={() => toggleStatSelection("Limp %", `${jugador.limp_pct}%`)}
                            isSelected={selectedStats["Limp %"] !== undefined}
                            color={brand.primary}
                            warning={parseFloat(jugador.limp_pct) > 15}
                          />
                          <StatBox
                            icon={FaHandPointUp}
                            title="Limp-Raise %"
                            value={`${jugador.limp_raise_pct}%`}
                            onClick={() => toggleStatSelection("Limp-Raise %", `${jugador.limp_raise_pct}%`)}
                            isSelected={selectedStats["Limp-Raise %"] !== undefined}
                            color={brand.primary}
                            warning={parseFloat(jugador.limp_raise_pct) > 5}
                          />
                          <StatBox
                            icon={FaArrowDown}
                            title="Fold to Flop CBet"
                            value={`${jugador.fold_to_flop_cbet_pct}%`}
                            onClick={() => toggleStatSelection("Fold to Flop CBet", `${jugador.fold_to_flop_cbet_pct}%`)}
                            isSelected={selectedStats["Fold to Flop CBet"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaArrowDown}
                            title="Fold to Turn CBet"
                            value={`${jugador.fold_to_turn_cbet_pct}%`}
                            onClick={() => toggleStatSelection("Fold to Turn CBet", `${jugador.fold_to_turn_cbet_pct}%`)}
                            isSelected={selectedStats["Fold to Turn CBet"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaChartPie}
                            title="Probe Bet Turn %"
                            value={`${jugador.probe_bet_turn_pct}%`}
                            onClick={() => toggleStatSelection("Probe Bet Turn %", `${jugador.probe_bet_turn_pct}%`)}
                            isSelected={selectedStats["Probe Bet Turn %"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaWater}
                            title="Bet River %"
                            value={`${jugador.bet_river_pct}%`}
                            onClick={() => toggleStatSelection("Bet River %", `${jugador.bet_river_pct}%`)}
                            isSelected={selectedStats["Bet River %"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaArrowDown}
                            title="Fold to River Bet"
                            value={`${jugador.fold_to_river_bet_pct}%`}
                            onClick={() => toggleStatSelection("Fold to River Bet", `${jugador.fold_to_river_bet_pct}%`)}
                            isSelected={selectedStats["Fold to River Bet"] !== undefined}
                            color={brand.primary}
                          />
                          <StatBox
                            icon={FaExclamationTriangle}
                            title="Overbet Turn %"
                            value={`${jugador.overbet_turn_pct}%`}
                            onClick={() => toggleStatSelection("Overbet Turn %", `${jugador.overbet_turn_pct}%`)}
                            isSelected={selectedStats["Overbet Turn %"] !== undefined}
                            color={brand.primary}
                            warning={parseFloat(jugador.overbet_turn_pct) > 10}
                          />
                          <StatBox
                            icon={FaExclamationTriangle}
                            title="Overbet River %"
                            value={`${jugador.overbet_river_pct}%`}
                            onClick={() => toggleStatSelection("Overbet River %", `${jugador.overbet_river_pct}%`)}
                            isSelected={selectedStats["Overbet River %"] !== undefined}
                            color={brand.primary}
                            warning={parseFloat(jugador.overbet_river_pct) > 10}
                          />
                          <StatBox
                            icon={FaMedal}
                            title="WSDwBR %"
                            value={`${jugador.wsdwbr_pct}%`}
                            onClick={() => toggleStatSelection("WSDwBR %", `${jugador.wsdwbr_pct}%`)}
                            isSelected={selectedStats["WSDwBR %"] !== undefined}
                            color={brand.primary}
                            isSpecial={parseFloat(jugador.wsdwbr_pct) > 60}
                          />
                        </>
                      )}
                    </Grid>
                  </Box>
                </Box>
                
                {/* Gráfico de ganancias */}
                {tieneSuscripcionAvanzada && (
                  <Box 
                    mt={6} 
                    p={6} 
                    bg={cardBg} 
                    borderRadius="xl" 
                    boxShadow="base"
                    position="relative"
                    overflow="hidden"
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
                    
                    <HStack mb={4} position="relative" zIndex={1}>
                      <Heading size="md" color={textColor}>
                        Evolución de Ganancias
                      </Heading>
                      <Badge 
                        bg={brand.primary}
                        color="white" 
                        fontSize="md"
                      >
                        {jugador.player_name}
                      </Badge>
                    </HStack>
                    
                    <Box position="relative" zIndex={1} minH="400px" w="100%">
                      <GraficoGanancias 
                        nombre={jugador.player_name} 
                        salaSeleccionada={salaSeleccionada}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
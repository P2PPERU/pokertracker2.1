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
  FormControl,
  FormLabel,
  Tooltip,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, SearchIcon, CalendarIcon } from '@chakra-ui/icons';
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
  FaCalendarAlt,
  FaLayerGroup,
  FaCheckCircle,
  FaExclamationCircle,
  FaHandRock,
  FaHandshake,
  FaTrophy,
  FaChessKnight,
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
  const tabBg = useColorModeValue("gray.50", "gray.700");

  const authData = useAuth();
  const auth = authData?.auth;
  const [jugador, setJugador] = useState(null);
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const sugerenciasRef = useRef(null);
  const [salaSeleccionada, setSalaSeleccionada] = useState("XPK");

  // ✨ Estados para filtros
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [usarFiltroFecha, setUsarFiltroFecha] = useState(false);
  const [tipoPeriodo, setTipoPeriodo] = useState("total");
  const [stakeFilter, setStakeFilter] = useState("all");

  // Estado para estadísticas y copiado
  const [selectedStats, setSelectedStats] = useState({});
  const { onCopy, setValue } = useClipboard("");
  const [statsText, setStatsText] = useState("");
  const toast = useToast();

  // Estados para favoritos
  const [esFavorito, setEsFavorito] = useState(false);
  const [favoritos, setFavoritos] = useState([]);

  // ✨ NUEVO: Estados para multi-stake
  const [stakesDisponibles, setStakesDisponibles] = useState([]);
  const [stakeSeleccionado, setStakeSeleccionado] = useState(null);
  const [loadingStakes, setLoadingStakes] = useState(false);

  // ✨ Función para obtener fechas por defecto (últimos 30 días)
  const obtenerFechasPorDefecto = useCallback(() => {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    return {
      desde: hace30Dias.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0]
    };
  }, []);

  // ✨ Inicializar fechas por defecto
  useEffect(() => {
    const fechas = obtenerFechasPorDefecto();
    setFechaDesde(fechas.desde);
    setFechaHasta(fechas.hasta);
  }, [obtenerFechasPorDefecto]);

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

  // ✨ NUEVO: Función para buscar todos los stakes del jugador
  const buscarStakesJugador = useCallback(async (nombre) => {
    setLoadingStakes(true);
    try {
      // Buscar en todos los stakes posibles
      const stakes = ['microstakes', 'nl100', 'nl200', 'nl400', 'high-stakes'];
      const stakesConDatos = [];
      
      // Buscar en paralelo para mejor rendimiento
      const promises = stakes.map(async (stake) => {
        try {
          // CORREGIDO: No duplicar tipoPeriodo en la URL
          const url = `/jugador/${salaSeleccionada}/${encodeURIComponent(nombre)}?tipoPeriodo=${tipoPeriodo}&stake=${stake}`;
          const res = await api.get(url);
          
          if (res.data && res.data.total_manos > 0) {
            return {
              stake: res.data.stake_category || stake,
              manos: res.data.total_manos,
              data: res.data
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      const validResults = results.filter(r => r !== null);
      
      // Ordenar por cantidad de manos (mayor a menor)
      validResults.sort((a, b) => b.manos - a.manos);
      setStakesDisponibles(validResults);
      
      // Seleccionar el stake con más manos por defecto
      if (validResults.length > 0) {
        setStakeSeleccionado(validResults[0].stake);
        setJugador(validResults[0].data);
      }
      
    } catch (error) {
      console.error("Error buscando stakes:", error);
    } finally {
      setLoadingStakes(false);
    }
  }, [salaSeleccionada, tipoPeriodo]);

  // ✨ Función para buscar jugador ACTUALIZADA con filtros
  const buscarJugador = useCallback(async (nombre) => {
    setLoading(true);
    setSugerencias([]);
    setSelectedStats({});
    setStakesDisponibles([]);
    
    try {
      // Buscar todos los stakes del jugador
      await buscarStakesJugador(nombre);
      
      // Verificar si es favorito al buscar
      if (auth?.token) {
        try {
          const resFavorito = await api.get(
            `/favoritos/${salaSeleccionada}/${encodeURIComponent(nombre)}`,
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
          setEsFavorito(resFavorito.data.favorito);
        } catch (error) {
          setEsFavorito(false);
          console.error("Error al verificar favorito (post búsqueda):", error);
        }
      }
  
    } catch (error) {
      console.error("Jugador no encontrado:", error);
      setJugador(null);
      setEsFavorito(false);
      
      toast({
        title: "Jugador no encontrado",
        description: usarFiltroFecha 
          ? "No se encontraron datos para este jugador en el rango de fechas seleccionado"
          : "Verifica el nombre del jugador e inténtalo nuevamente",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
    setLoading(false);
  }, [salaSeleccionada, auth?.token, usarFiltroFecha, fechaDesde, fechaHasta, tipoPeriodo, toast, buscarStakesJugador]);

  // ✨ NUEVO: Función para cambiar stake seleccionado
  const cambiarStake = useCallback((nuevoStake) => {
    const stakeData = stakesDisponibles.find(s => s.stake === nuevoStake);
    if (stakeData) {
      setStakeSeleccionado(nuevoStake);
      setJugador(stakeData.data);
      setSelectedStats({}); // Limpiar estadísticas seleccionadas al cambiar stake
    }
  }, [stakesDisponibles]);
  
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

  // ✨ Función para activar/desactivar filtro de fecha
  const toggleFiltroFecha = () => {
    setUsarFiltroFecha(!usarFiltroFecha);
    if (!usarFiltroFecha) {
      // Al activar, usar fechas por defecto
      const fechas = obtenerFechasPorDefecto();
      setFechaDesde(fechas.desde);
      setFechaHasta(fechas.hasta);
    }
  };

  // ✨ Función para establecer rangos predefinidos
  const establecerRangoPredefinido = (dias) => {
    const hoy = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(hoy.getDate() - dias);
    
    setFechaDesde(fechaInicio.toISOString().split('T')[0]);
    setFechaHasta(hoy.toISOString().split('T')[0]);
    setUsarFiltroFecha(true);
  };

  // Buscar jugador predeterminado al montar
  useEffect(() => {
    buscarJugador("LALIGAMANAGER"); // Cambiar a un jugador que sepas que existe
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

  // ✨ CORREGIDO: Memoriza la función de toggle para estadísticas
  const toggleStatSelection = useCallback((title, value) => {
    setSelectedStats((prev) => {
      if (prev[title] !== undefined) {
        // Si ya existe, eliminar completamente
        const newStats = { ...prev };
        delete newStats[title];
        return newStats;
      } else {
        // Si no existe, agregar
        return {
          ...prev,
          [title]: value
        };
      }
    });
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
    "Squeeze": "SQZ",
    "CBet Flop": "CBF",
    "CBet Turn": "CBT",
    "CBet River": "CBR",
    "WWSF": "WWSF",
    "WTSD": "WTSD",
    "WSD": "WSD",
    "Limp %": "LIMP",
    "Limp-Raise %": "LR",
    "Fold to Flop CBet": "FCBF",
    "Fold to Turn CBet": "FCBT",
    "Fold to River Bet": "FRB",
    "Probe Bet Turn %": "PROBE",
    "Bet River %": "BR",
    "Overbet Turn %": "OBT",
    "Overbet River %": "OBR",
    "WSDwBR %": "WSDBR",
    "Manos Jugadas": "HANDS",
    "Ganancias USD": "WIN$",
    "WINRATE": "WR",
    "Check/Raise Flop": "XRF",
    "Check/Raise Turn": "XRT",
    "Donk Flop": "DONK",
    "Float Flop": "FLOAT",
    "Steal Turn": "STEAL",
    "Bet River Small": "BRS",
    "Bet River Big": "BRB"
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

  // ✨ Función helper para obtener color del stake
  const getStakeColor = (stake) => {
    switch (stake) {
      case 'microstakes': return 'green';
      case 'nl100': return 'blue';
      case 'nl200': return 'purple';
      case 'nl400': return 'orange';
      case 'high-stakes': return 'red';
      default: return 'gray';
    }
  };

  // ✨ Función helper para obtener label del stake
  const getStakeLabel = (stake) => {
    switch (stake) {
      case 'microstakes': return 'Micro';
      case 'nl100': return 'NL100';
      case 'nl200': return 'NL200';
      case 'nl400': return 'NL400';
      case 'high-stakes': return 'High Stakes';
      default: return stake?.toUpperCase() || 'N/A';
    }
  };

  if (auth === undefined) return <Spinner />;

  const tieneSuscripcionAvanzada = ["plata", "oro"].includes(auth.suscripcion);

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
          
          {/* ✨ Búsqueda de jugador mejorada con filtros */}
          <Box mt={6}>
            <Flex gap={4} align="center" mb={4} wrap="wrap">
              {/* ✨ Selector de sala */}
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
                <option value="XPK" style={{ background: 'black' }}>X-Poker</option>
                <option value="PPP" style={{ background: 'black' }}>PPPoker</option>
                <option value="PM" style={{ background: 'black' }}>ClubGG</option>
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

            {/* ✨ NUEVO: Controles de filtros mejorados */}
            <Box 
              p={4} 
              bg="whiteAlpha.100" 
              borderRadius="md" 
              border="1px solid" 
              borderColor="whiteAlpha.300"
            >
              <VStack spacing={3} align="stretch">
                {/* Primera fila: Período y Fecha */}
                <HStack spacing={4} wrap="wrap">
                  {/* Selector de período */}
                  <FormControl maxW="200px">
                    <FormLabel color="whiteAlpha.800" fontSize="sm">
                      <Icon as={FaChartLine} mr={1} />
                      Período
                    </FormLabel>
                    <Select
                      value={tipoPeriodo}
                      onChange={(e) => setTipoPeriodo(e.target.value)}
                      bg="whiteAlpha.200"
                      color="white"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "whiteAlpha.400" }}
                      _focus={{ borderColor: "white" }}
                      size="sm"
                    >
                      <option value="total" style={{ background: 'black' }}>Total (Histórico)</option>
                      <option value="semana" style={{ background: 'black' }}>Última Semana</option>
                      <option value="mes" style={{ background: 'black' }}>Último Mes</option>
                    </Select>
                  </FormControl>

                  {/* Toggle de filtro de fecha */}
                  <FormControl>
                    <FormLabel color="whiteAlpha.800" fontSize="sm">
                      <Icon as={FaCalendarAlt} mr={1} />
                      Filtro de Fecha Personalizado
                    </FormLabel>
                    <Button
                      size="sm"
                      variant={usarFiltroFecha ? "solid" : "outline"}
                      colorScheme={usarFiltroFecha ? "green" : "gray"}
                      onClick={toggleFiltroFecha}
                      leftIcon={<Icon as={usarFiltroFecha ? FaCheckCircle : FaExclamationCircle} />}
                    >
                      {usarFiltroFecha ? "Activado" : "Desactivado"}
                    </Button>
                  </FormControl>
                </HStack>

                {/* Fechas personalizadas si está activado */}
                {usarFiltroFecha && (
                  <>
                    <HStack spacing={4} wrap="wrap">
                      <FormControl maxW="200px">
                        <FormLabel color="whiteAlpha.800" fontSize="sm">
                          Desde
                        </FormLabel>
                        <Input
                          type="date"
                          value={fechaDesde}
                          onChange={(e) => setFechaDesde(e.target.value)}
                          bg="whiteAlpha.200"
                          color="white"
                          borderColor="whiteAlpha.300"
                          _hover={{ borderColor: "whiteAlpha.400" }}
                          _focus={{ borderColor: "white" }}
                          size="sm"
                        />
                      </FormControl>

                      <FormControl maxW="200px">
                        <FormLabel color="whiteAlpha.800" fontSize="sm">
                          Hasta
                        </FormLabel>
                        <Input
                          type="date"
                          value={fechaHasta}
                          onChange={(e) => setFechaHasta(e.target.value)}
                          bg="whiteAlpha.200"
                          color="white"
                          borderColor="whiteAlpha.300"
                          _hover={{ borderColor: "whiteAlpha.400" }}
                          _focus={{ borderColor: "white" }}
                          size="sm"
                        />
                      </FormControl>
                    </HStack>

                    {/* Rangos rápidos */}
                    <HStack spacing={2} wrap="wrap">
                      <Text color="whiteAlpha.800" fontSize="sm">
                        Rangos rápidos:
                      </Text>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="whiteAlpha"
                        onClick={() => establecerRangoPredefinido(7)}
                      >
                        7 días
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="whiteAlpha"
                        onClick={() => establecerRangoPredefinido(30)}
                      >
                        30 días
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="whiteAlpha"
                        onClick={() => establecerRangoPredefinido(90)}
                      >
                        90 días
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="whiteAlpha"
                        onClick={() => establecerRangoPredefinido(365)}
                      >
                        1 año
                      </Button>
                    </HStack>
                  </>
                )}

                {/* Información de filtros activos */}
                <HStack spacing={3} wrap="wrap">
                  <Badge colorScheme="blue" p={2}>
                    <Icon as={FaDatabase} mr={1} />
                    Fuente: CSV
                  </Badge>
                  <Badge colorScheme="purple" p={2}>
                    <Icon as={FaChartLine} mr={1} />
                    Período: {tipoPeriodo === 'total' ? 'Histórico Total' : tipoPeriodo === 'semana' ? 'Última Semana' : 'Último Mes'}
                  </Badge>
                  {usarFiltroFecha && fechaDesde && fechaHasta && (
                    <Badge colorScheme="green" p={2}>
                      <Icon as={FaCalendarAlt} mr={1} />
                      {new Date(fechaDesde).toLocaleDateString()} - {new Date(fechaHasta).toLocaleDateString()}
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </Box>
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
              <Text color={subtextColor}>
                {usarFiltroFecha 
                  ? "Intenta ajustar el rango de fechas o buscar por nombre/alias" 
                  : "Intenta buscar por nombre o alias"
                }
              </Text>
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
                    {/* ✨ Indicadores de filtros activos */}
                    <HStack>
                      {jugador.stake_category && (
                        <Badge 
                          colorScheme={getStakeColor(jugador.stake_category)} 
                          variant="solid"
                        >
                          <Icon as={FaLayerGroup} mr={1} />
                          {getStakeLabel(jugador.stake_category)}
                        </Badge>
                      )}
                      {tipoPeriodo !== 'total' && (
                        <Badge colorScheme="purple" variant="subtle">
                          <Icon as={FaChartLine} mr={1} />
                          {tipoPeriodo === 'semana' ? 'Semanal' : 'Mensual'}
                        </Badge>
                      )}
                      {usarFiltroFecha && (
                        <Badge colorScheme="blue" variant="subtle">
                          <Icon as={FaCalendarAlt} mr={1} />
                          Filtrado
                        </Badge>
                      )}
                    </HStack>
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

                  {/* ✨ NUEVO: Selector de stake si hay múltiples */}
                  {stakesDisponibles.length > 1 && (
                    <Box 
                      p={3} 
                      bg={useColorModeValue("blue.50", "blue.900")}
                      borderRadius="md" 
                      mb={4}
                      position="relative"
                      zIndex={1}
                    >
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold" color={textColor}>
                            Stakes disponibles:
                          </Text>
                          <Badge colorScheme="blue">
                            {stakesDisponibles.length} stakes
                          </Badge>
                        </HStack>
                        
                        <HStack spacing={2} wrap="wrap">
                          {stakesDisponibles.map((stakeData) => (
                            <Button
                              key={stakeData.stake}
                              size="sm"
                              variant={stakeSeleccionado === stakeData.stake ? "solid" : "outline"}
                              colorScheme={getStakeColor(stakeData.stake)}
                              onClick={() => cambiarStake(stakeData.stake)}
                              leftIcon={<Icon as={FaLayerGroup} />}
                            >
                              {getStakeLabel(stakeData.stake)}
                              <Badge ml={2} variant="subtle">
                                {stakeData.manos} manos
                              </Badge>
                            </Button>
                          ))}
                        </HStack>
                        
                        {stakeSeleccionado && (
                          <Text fontSize="sm" color={subtextColor}>
                            Mostrando estadísticas de {getStakeLabel(stakeSeleccionado)}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  )}

                  {/* ✨ Información adicional del snapshot */}
                  {jugador.fecha_snapshot && (
                    <Box 
                      p={3} 
                      bg={useColorModeValue("gray.50", "gray.700")}
                      borderRadius="md" 
                      mb={4}
                      position="relative"
                      zIndex={1}
                    >
                      <HStack spacing={4} fontSize="sm" wrap="wrap">
                        <HStack>
                          <Icon as={FaCalendarAlt} color="gray.500" />
                          <Text color={subtextColor}>
                            <strong>Fecha datos:</strong> {new Date(jugador.fecha_snapshot).toLocaleDateString()}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaDatabase} color="gray.500" />
                          <Text color={subtextColor}>
                            <strong>Fuente:</strong> {jugador.data_source || 'CSV'}
                          </Text>
                        </HStack>
                      </HStack>
                    </Box>
                  )}
                  
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
                        Selecciona estadísticas haciendo clic en ellas en las tablas de abajo
                      </Text>
                    )}
                  </Box>
                </Box>
                
                {/* Panel de análisis IA */}
                <AnalisisJugador
                  nombre={jugador.player_name}
                  salaSeleccionada={salaSeleccionada}
                  suscripcionUsuario={auth.suscripcion}
                  tipoPeriodo={tipoPeriodo}
                  fecha={jugador.fecha_snapshot}
                />
              </Box>
              
              {/* Panel derecho - TODAS las estadísticas juntas */}
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
                    {stakeSeleccionado && (
                      <Badge 
                        colorScheme={getStakeColor(stakeSeleccionado)} 
                        variant="solid"
                      >
                        {getStakeLabel(stakeSeleccionado)}
                      </Badge>
                    )}
                  </HStack>
                  
                  {/* ✨ NUEVO: Todas las estadísticas en una sola vista */}
                  <VStack spacing={6} align="stretch">
                    {/* Sección General */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={FaHandPaper} color={brand.primary} />
                        <Text fontWeight="bold" color={textColor}>General</Text>
                      </HStack>
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
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
                        {jugador.all_in_adj_bb_100 && (
                          <StatBox
                            icon={FaChartLine}
                            title="AI Adj BB/100"
                            value={`${jugador.all_in_adj_bb_100}`}
                            onClick={() => toggleStatSelection("AI Adj BB/100", `${jugador.all_in_adj_bb_100}`)}
                            isSelected={selectedStats["AI Adj BB/100"] !== undefined}
                            color={brand.primary}
                          />
                        )}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Sección Preflop */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={FaHandRock} color={brand.primary} />
                        <Text fontWeight="bold" color={textColor}>Preflop</Text>
                      </HStack>
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
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
                              icon={FaHandshake}
                              title="Squeeze"
                              value={`${jugador.squeeze || 0}%`}
                              onClick={() => toggleStatSelection("Squeeze", `${jugador.squeeze || 0}%`)}
                              isSelected={selectedStats["Squeeze"] !== undefined}
                              color={brand.primary}
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
                              icon={FaArrowDown}
                              title="Limp/Fold %"
                              value={`${jugador.limp_fold_pct || 0}%`}
                              onClick={() => toggleStatSelection("Limp/Fold %", `${jugador.limp_fold_pct || 0}%`)}
                              isSelected={selectedStats["Limp/Fold %"] !== undefined}
                              color={brand.primary}
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
                          </>
                        )}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Sección Flop */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={FaChartPie} color={brand.primary} />
                        <Text fontWeight="bold" color={textColor}>Flop</Text>
                      </HStack>
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
                        <StatBox
                          icon={FaChartPie}
                          title="CBet Flop"
                          value={`${jugador.cbet_flop}%`}
                          onClick={() => toggleStatSelection("CBet Flop", `${jugador.cbet_flop}%`)}
                          isSelected={selectedStats["CBet Flop"] !== undefined}
                          color={brand.primary}
                        />
                        {tieneSuscripcionAvanzada && (
                          <>
                            <StatBox
                              icon={FaChartPie}
                              title="CBet Flop IP"
                              value={`${jugador.cbet_flop_ip || 0}%`}
                              onClick={() => toggleStatSelection("CBet Flop IP", `${jugador.cbet_flop_ip || 0}%`)}
                              isSelected={selectedStats["CBet Flop IP"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaChartPie}
                              title="CBet Flop OOP"
                              value={`${jugador.cbet_flop_oop || 0}%`}
                              onClick={() => toggleStatSelection("CBet Flop OOP", `${jugador.cbet_flop_oop || 0}%`)}
                              isSelected={selectedStats["CBet Flop OOP"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaHandRock}
                              title="Donk Flop"
                              value={`${jugador.donk_flop || 0}%`}
                              onClick={() => toggleStatSelection("Donk Flop", `${jugador.donk_flop || 0}%`)}
                              isSelected={selectedStats["Donk Flop"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaArrowUp}
                              title="Check/Raise Flop"
                              value={`${jugador.check_raise_flop || 0}%`}
                              onClick={() => toggleStatSelection("Check/Raise Flop", `${jugador.check_raise_flop || 0}%`)}
                              isSelected={selectedStats["Check/Raise Flop"] !== undefined}
                              color={brand.primary}
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
                              icon={FaHandshake}
                              title="Float Flop"
                              value={`${jugador.float_flop || 0}%`}
                              onClick={() => toggleStatSelection("Float Flop", `${jugador.float_flop || 0}%`)}
                              isSelected={selectedStats["Float Flop"] !== undefined}
                              color={brand.primary}
                            />
                          </>
                        )}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Sección Turn */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={FaChessKnight} color={brand.primary} />
                        <Text fontWeight="bold" color={textColor}>Turn</Text>
                      </HStack>
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
                        <StatBox
                          icon={FaChartPie}
                          title="CBet Turn"
                          value={`${jugador.cbet_turn}%`}
                          onClick={() => toggleStatSelection("CBet Turn", `${jugador.cbet_turn}%`)}
                          isSelected={selectedStats["CBet Turn"] !== undefined}
                          color={brand.primary}
                        />
                        {tieneSuscripcionAvanzada && (
                          <>
                            <StatBox
                              icon={FaChartPie}
                              title="Probe Bet Turn %"
                              value={`${jugador.probe_bet_turn_pct}%`}
                              onClick={() => toggleStatSelection("Probe Bet Turn %", `${jugador.probe_bet_turn_pct}%`)}
                              isSelected={selectedStats["Probe Bet Turn %"] !== undefined}
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
                              icon={FaExclamationTriangle}
                              title="Overbet Turn %"
                              value={`${jugador.overbet_turn_pct}%`}
                              onClick={() => toggleStatSelection("Overbet Turn %", `${jugador.overbet_turn_pct}%`)}
                              isSelected={selectedStats["Overbet Turn %"] !== undefined}
                              color={brand.primary}
                              warning={parseFloat(jugador.overbet_turn_pct) > 10}
                            />
                            <StatBox
                              icon={FaArrowDown}
                              title="Fold to Turn OB"
                              value={`${jugador.fold_to_turn_overbet || 0}%`}
                              onClick={() => toggleStatSelection("Fold to Turn OB", `${jugador.fold_to_turn_overbet || 0}%`)}
                              isSelected={selectedStats["Fold to Turn OB"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaArrowUp}
                              title="Check/Raise Turn"
                              value={`${jugador.check_raise_turn || 0}%`}
                              onClick={() => toggleStatSelection("Check/Raise Turn", `${jugador.check_raise_turn || 0}%`)}
                              isSelected={selectedStats["Check/Raise Turn"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaChessKnight}
                              title="Steal Turn"
                              value={`${jugador.steal_turn || 0}%`}
                              onClick={() => toggleStatSelection("Steal Turn", `${jugador.steal_turn || 0}%`)}
                              isSelected={selectedStats["Steal Turn"] !== undefined}
                              color={brand.primary}
                            />
                          </>
                        )}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Sección River */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={FaWater} color={brand.primary} />
                        <Text fontWeight="bold" color={textColor}>River</Text>
                      </HStack>
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
                        <StatBox
                          icon={FaChartPie}
                          title="CBet River"
                          value={`${jugador.cbet_river || 0}%`}
                          onClick={() => toggleStatSelection("CBet River", `${jugador.cbet_river || 0}%`)}
                          isSelected={selectedStats["CBet River"] !== undefined}
                          color={brand.primary}
                        />
                        {tieneSuscripcionAvanzada && (
                          <>
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
                              title="Overbet River %"
                              value={`${jugador.overbet_river_pct}%`}
                              onClick={() => toggleStatSelection("Overbet River %", `${jugador.overbet_river_pct}%`)}
                              isSelected={selectedStats["Overbet River %"] !== undefined}
                              color={brand.primary}
                              warning={parseFloat(jugador.overbet_river_pct) > 10}
                            />
                            <StatBox
                              icon={FaArrowDown}
                              title="Fold to River OB"
                              value={`${jugador.fold_to_river_overbet || 0}%`}
                              onClick={() => toggleStatSelection("Fold to River OB", `${jugador.fold_to_river_overbet || 0}%`)}
                              isSelected={selectedStats["Fold to River OB"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaHandshake}
                              title="Bet River & Fold"
                              value={`${jugador.bet_river_fold || 0}%`}
                              onClick={() => toggleStatSelection("Bet River & Fold", `${jugador.bet_river_fold || 0}%`)}
                              isSelected={selectedStats["Bet River & Fold"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaChartPie}
                              title="Bet River Small"
                              value={`${jugador.bet_river_small_pot || 0}%`}
                              onClick={() => toggleStatSelection("Bet River Small", `${jugador.bet_river_small_pot || 0}%`)}
                              isSelected={selectedStats["Bet River Small"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaChartPie}
                              title="Bet River Big"
                              value={`${jugador.bet_river_big_pot || 0}%`}
                              onClick={() => toggleStatSelection("Bet River Big", `${jugador.bet_river_big_pot || 0}%`)}
                              isSelected={selectedStats["Bet River Big"] !== undefined}
                              color={brand.primary}
                            />
                          </>
                        )}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Sección Showdown */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={FaTrophy} color={brand.primary} />
                        <Text fontWeight="bold" color={textColor}>Showdown</Text>
                      </HStack>
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
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
                        {tieneSuscripcionAvanzada && (
                          <>
                            <StatBox
                              icon={FaMedal}
                              title="WSDwBR %"
                              value={`${jugador.wsdwbr_pct}%`}
                              onClick={() => toggleStatSelection("WSDwBR %", `${jugador.wsdwbr_pct}%`)}
                              isSelected={selectedStats["WSDwBR %"] !== undefined}
                              color={brand.primary}
                              isSpecial={parseFloat(jugador.wsdwbr_pct) > 60}
                            />
                            <StatBox
                              icon={FaTrophy}
                              title="WSD w/OB River"
                              value={`${jugador.wsdwobr || 0}%`}
                              onClick={() => toggleStatSelection("WSD w/OB River", `${jugador.wsdwobr || 0}%`)}
                              isSelected={selectedStats["WSD w/OB River"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaTrophy}
                              title="WSD w/Raise River"
                              value={`${jugador.wsdwrr || 0}%`}
                              onClick={() => toggleStatSelection("WSD w/Raise River", `${jugador.wsdwrr || 0}%`)}
                              isSelected={selectedStats["WSD w/Raise River"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaHandshake}
                              title="Win River Bet Small"
                              value={`${jugador.wwrb_small || 0}%`}
                              onClick={() => toggleStatSelection("Win River Bet Small", `${jugador.wwrb_small || 0}%`)}
                              isSelected={selectedStats["Win River Bet Small"] !== undefined}
                              color={brand.primary}
                            />
                            <StatBox
                              icon={FaHandshake}
                              title="Win River Bet Big"
                              value={`${jugador.wwrb_big || 0}%`}
                              onClick={() => toggleStatSelection("Win River Bet Big", `${jugador.wwrb_big || 0}%`)}
                              isSelected={selectedStats["Win River Bet Big"] !== undefined}
                              color={brand.primary}
                            />
                          </>
                        )}
                      </SimpleGrid>
                    </Box>
                  </VStack>
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
                        tipoPeriodo={tipoPeriodo}
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
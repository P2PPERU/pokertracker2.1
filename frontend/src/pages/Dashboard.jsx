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
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
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
} from "react-icons/fa";
import { Link } from 'react-router-dom'; // <-- Asegúrate de importar Link
import api from '../services/api';
import GraficoGanancias from '../components/GraficoGanancias';
import AnalisisJugador from '../components/AnalisisJugador';
import { useAuth } from '../context/AuthContext';
import _ from 'lodash';

const Dashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  // Valores de color
  const mainGradient = useColorModeValue(
    "linear(to-r, #5D5FEF, #6A76FB)", 
    "linear(to-r, #5D5FEF, #6A76FB)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const suggestionBg = useColorModeValue("white", "gray.700");
  const suggestionBorderColor = useColorModeValue("gray.200", "gray.600");
  const iconButtonColor = useColorModeValue("blue.600", "blue.200");
  const selectFocusBorderColor = useColorModeValue("blue.600", "blue.300");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputFocusBorderColor = useColorModeValue("blue.600", "blue.300");
  const listItemHoverBg = useColorModeValue("gray.100", "gray.600");

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

  // Verifica si el jugador ya es favorito
  

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
  
      // 🔥 Paso C: Verificar si es favorito al buscar
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
  

  // Buscar jugador predeterminado al montar
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

  if (auth === undefined) return <Spinner />;

  const tieneSuscripcionAvanzada = ["plata", "oro"].includes(auth.suscripcion);

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

  return (
    <Box minH="100vh" bg="#DCE2E8" p={4}>
      <Box maxW="1200px" mx="auto" p={6} bg={cardBg} rounded="lg" boxShadow="xl">
        {/* Encabezado con botón para cambiar color y ver favoritos */}
        <Flex alignItems="center" justifyContent="space-between" mb={4}>
          <Heading size="lg">🔍 Estadísticas</Heading>
          <Flex gap={2}>
            <Link to="/favoritos">
              <Button variant="outline" colorScheme="blue">
                Favoritos
              </Button>
            </Link>
            <IconButton
              aria-label="Toggle Color Mode"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              color={iconButtonColor}
            />
          </Flex>
        </Flex>

        <Flex gap={2} my={4} align="center">
          <Select
            value={salaSeleccionada}
            onChange={(e) => setSalaSeleccionada(e.target.value)}
            maxW="200px"
            focusBorderColor={selectFocusBorderColor}
          >
            <option value="XPK">X-Poker</option>
            <option value="PPP">PPPoker</option>
            <option value="SUP">SupremaPoker</option>
          </Select>
        </Flex>

        <Flex align="center" gap={2} mb={4} maxW="400px">
          <Box width="100%" position="relative">
            <Input
              size="lg"
              placeholder="Buscar jugador..."
              value={nombreBuscado}
              onChange={handleInputChange}
              onFocus={() => setMostrarSugerencias(true)}
              bg={inputBg}
              focusBorderColor={inputFocusBorderColor}
            />
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
                maxWidth="300px"
                boxShadow="sm"
                zIndex="10"
              >
                {sugerencias.map((jug, index) => (
                  <ListItem
                    key={index}
                    p={2}
                    cursor="pointer"
                    _hover={{ background: listItemHoverBg }}
                    onClick={() => {
                      setNombreBuscado(jug.player_name);
                      buscarJugador(jug.player_name);
                      setMostrarSugerencias(false);
                    }}
                  >
                    {jug.player_name}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Button
            size="lg"
            color="white"
            bgGradient="linear(to-r, #5D5FEF, #6A76FB)"
            _hover={{ bgGradient: "linear(to-r, #4c4feb, #5a64f9)" }}
            leftIcon={<FaSearch />}
            onClick={() => buscarJugador(nombreBuscado)}
          >
            Buscar
          </Button>
        </Flex>

        {loading && <Spinner size="xl" color="blue.500" />}
        {!loading && !jugador && <Text>No se encontraron datos del jugador.</Text>}

        {jugador && (
          <>
            <Flex alignItems="center" gap={2} mb={2}>
              <Badge colorScheme="green" fontSize="lg">
                {jugador.player_name}
              </Badge>
              <IconButton
                aria-label={esFavorito ? "Eliminar de favoritos" : "Agregar a favoritos"}
                icon={<FaStar color={esFavorito ? "gold" : "gray"} />}
                onClick={toggleFavorito}
                variant="ghost"
              />
            </Flex>

            {/* Resto de la UI con estadísticas y análisis */}
            <Flex gap={2} mb={4}>
              <Button
                color="white"
                bgGradient="linear(to-r, #5D5FEF, #6A76FB)"
                _hover={{ bgGradient: "linear(to-r, #4c4feb, #5a64f9)" }}
                onClick={copyStats}
                isDisabled={Object.keys(selectedStats).length === 0}
              >
                Copiar Estadísticas Seleccionadas
              </Button>
            </Flex>

            <Flex gap={4} alignItems="start" flexWrap="wrap">
              <Box flex="1" maxW="300px">
                <AnalisisJugador
                  nombre={jugador.player_name}
                  salaSeleccionada={salaSeleccionada}
                  suscripcionUsuario={auth.suscripcion}
                />
              </Box>

              <Box flex="3" minW="300px">
                <Badge colorScheme="green" fontSize="lg" mb={2}>
                  {jugador.player_name}
                </Badge>
                <Grid
                  templateColumns="repeat(6, 1fr)"
                  gap={2}
                  justifyContent="start"
                  alignItems="center"
                  mt={4}
                  overflowX="auto"
                  whiteSpace="nowrap"
                >
                  <StatBox
                    icon={FaHandPaper}
                    title="Manos Jugadas"
                    value={jugador.total_manos}
                    onClick={() => toggleStatSelection("Manos Jugadas", jugador.total_manos)}
                    isSelected={selectedStats["Manos Jugadas"] !== undefined}
                  />
                  <StatBox
                    icon={FaDollarSign}
                    title="Ganancias USD"
                    value={`$${jugador.win_usd}`}
                    onClick={() => toggleStatSelection("Ganancias USD", `$${jugador.win_usd}`)}
                    isSelected={selectedStats["Ganancias USD"] !== undefined}
                  />
                  <StatBox
                    icon={FaChartLine}
                    title="WINRATE"
                    value={`${jugador.bb_100} BB/100`}
                    onClick={() => toggleStatSelection("WINRATE", `${jugador.bb_100} BB/100`)}
                    isSelected={selectedStats["WINRATE"] !== undefined}
                  />
                  <StatBox
                    icon={FaChartPie}
                    title="VPIP"
                    value={`${jugador.vpip}%`}
                    onClick={() => toggleStatSelection("VPIP", `${jugador.vpip}%`)}
                    isSelected={selectedStats["VPIP"] !== undefined}
                  />
                  <StatBox
                    icon={FaArrowUp}
                    title="PFR"
                    value={`${jugador.pfr}%`}
                    onClick={() => toggleStatSelection("PFR", `${jugador.pfr}%`)}
                    isSelected={selectedStats["PFR"] !== undefined}
                  />
                  <StatBox
                    icon={FaSyncAlt}
                    title="3 BET"
                    value={`${jugador.three_bet}%`}
                    onClick={() => toggleStatSelection("3 BET", `${jugador.three_bet}%`)}
                    isSelected={selectedStats["3 BET"] !== undefined}
                  />
                  <StatBox
                    icon={FaArrowDown}
                    title="Fold to 3-BET"
                    value={`${jugador.fold_to_3bet_pct}%`}
                    onClick={() => toggleStatSelection("Fold to 3-BET", `${jugador.fold_to_3bet_pct}%`)}
                    isSelected={selectedStats["Fold to 3-BET"] !== undefined}
                  />
                  {tieneSuscripcionAvanzada && (
                    <>
                      <StatBox
                        icon={FaArrowUp}
                        title="4Bet Preflop"
                        value={`${jugador.four_bet_preflop_pct}%`}
                        onClick={() => toggleStatSelection("4 Bet Preflop", `${jugador.four_bet_preflop_pct}%`)}
                        isSelected={selectedStats["4 Bet Preflop"] !== undefined}
                      />
                      <StatBox
                        icon={FaArrowDown}
                        title="Fold to 4Bet"
                        value={`${jugador.fold_to_4bet_pct}%`}
                        onClick={() => toggleStatSelection("Fold to 4-Bet", `${jugador.fold_to_4bet_pct}%`)}
                        isSelected={selectedStats["Fold to 4-Bet"] !== undefined}
                      />
                      <StatBox
                        icon={FaChartPie}
                        title="CBet Flop"
                        value={`${jugador.cbet_flop}%`}
                        onClick={() => toggleStatSelection("CBet Flop", `${jugador.cbet_flop}%`)}
                        isSelected={selectedStats["CBet Flop"] !== undefined}
                      />
                      <StatBox
                        icon={FaChartPie}
                        title="CBet Turn"
                        value={`${jugador.cbet_turn}%`}
                        onClick={() => toggleStatSelection("CBet Turn", `${jugador.cbet_turn}%`)}
                        isSelected={selectedStats["CBet Turn"] !== undefined}
                      />
                      <StatBox
                        icon={FaPercentage}
                        title="WWSF"
                        value={`${jugador.wwsf}%`}
                        onClick={() => toggleStatSelection("WWSF", `${jugador.wwsf}%`)}
                        isSelected={selectedStats["WWSF"] !== undefined}
                      />
                      <StatBox
                        icon={FaPercentage}
                        title="WTSD"
                        value={`${jugador.wtsd}%`}
                        onClick={() => toggleStatSelection("WTSD", `${jugador.wtsd}%`)}
                        isSelected={selectedStats["WTSD"] !== undefined}
                      />
                      <StatBox
                        icon={FaPercentage}
                        title="WSD"
                        value={`${jugador.wsd}%`}
                        onClick={() => toggleStatSelection("WSD", `${jugador.wsd}%`)}
                        isSelected={selectedStats["WSD"] !== undefined}
                      />
                      <StatBox
                        icon={FaWalking}
                        title="Limp%"
                        value={`${jugador.limp_pct}%`}
                        onClick={() => toggleStatSelection("Limp %", `${jugador.limp_pct}%`)}
                        isSelected={selectedStats["Limp %"] !== undefined}
                      />
                      <StatBox
                        icon={FaHandPointUp}
                        title="LimpRaise %"
                        value={`${jugador.limp_raise_pct}%`}
                        onClick={() => toggleStatSelection("Limp-Raise %", `${jugador.limp_raise_pct}%`)}
                        isSelected={selectedStats["Limp-Raise %"] !== undefined}
                      />
                      <StatBox
                        icon={FaArrowDown}
                        title="Fold to Flop CBet"
                        value={`${jugador.fold_to_flop_cbet_pct}%`}
                        onClick={() => toggleStatSelection("Fold to Flop CBet", `${jugador.fold_to_flop_cbet_pct}%`)}
                        isSelected={selectedStats["Fold to Flop CBet"] !== undefined}
                      />
                      <StatBox
                        icon={FaArrowDown}
                        title="Fold to Turn CBet"
                        value={`${jugador.fold_to_turn_cbet_pct}%`}
                        onClick={() => toggleStatSelection("Fold to Turn CBet", `${jugador.fold_to_turn_cbet_pct}%`)}
                        isSelected={selectedStats["Fold to Turn CBet"] !== undefined}
                      />
                      <StatBox
                        icon={FaChartPie}
                        title="Probe Bet Turn %"
                        value={`${jugador.probe_bet_turn_pct}%`}
                        onClick={() => toggleStatSelection("Probe Bet Turn %", `${jugador.probe_bet_turn_pct}%`)}
                        isSelected={selectedStats["Probe Bet Turn %"] !== undefined}
                      />
                      <StatBox
                        icon={FaWater}
                        title="Bet River %"
                        value={`${jugador.bet_river_pct}%`}
                        onClick={() => toggleStatSelection("Bet River %", `${jugador.bet_river_pct}%`)}
                        isSelected={selectedStats["Bet River %"] !== undefined}
                      />
                      <StatBox
                        icon={FaArrowDown}
                        title="Fold to River Bet"
                        value={`${jugador.fold_to_river_bet_pct}%`}
                        onClick={() => toggleStatSelection("Fold to River Bet", `${jugador.fold_to_river_bet_pct}%`)}
                        isSelected={selectedStats["Fold to River Bet"] !== undefined}
                      />
                      <StatBox
                        icon={FaExclamationTriangle}
                        title="Overbet Turn %"
                        value={`${jugador.overbet_turn_pct}%`}
                        onClick={() => toggleStatSelection("Overbet Turn %", `${jugador.overbet_turn_pct}%`)}
                        isSelected={selectedStats["Overbet Turn %"] !== undefined}
                      />
                      <StatBox
                        icon={FaExclamationTriangle}
                        title="Overbet River %"
                        value={`${jugador.overbet_river_pct}%`}
                        onClick={() => toggleStatSelection("Overbet River %", `${jugador.overbet_river_pct}%`)}
                        isSelected={selectedStats["Overbet River %"] !== undefined}
                      />
                      <StatBox
                        icon={FaMedal}
                        title="WSDWBR %"
                        value={`${jugador.wsdwbr_pct}%`}
                        onClick={() => toggleStatSelection("WSDwBR %", `${jugador.wsdwbr_pct}%`)}
                        isSelected={selectedStats["WSDwBR %"] !== undefined}
                      />
                    </>
                  )}
                </Grid>
              </Box>
            </Flex>

            {tieneSuscripcionAvanzada && (
              <Box mt={8}>
                <Heading size="md" mb={2}>
                  📊 Gráfico de Ganancias
                </Heading>
                <GraficoGanancias nombre={jugador.player_name} />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

// Componente StatBox memorizado para evitar renders innecesarios
const StatBox = React.memo(({ icon: Icon, title, value, isSelected, onClick }) => {
  const defaultBorderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const iconDefaultColor = useColorModeValue("gray.500", "gray.200");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const excludedStats = ["Manos Jugadas", "Ganancias USD", "WINRATE"];

  let numericValue = value;
  if (!excludedStats.includes(title)) {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      numericValue = Math.round(parsedValue);
    } else {
      numericValue = value.includes("%") || value.includes("$") ? value : "—";
    }
  }

  return (
    <Box
      p={2}
      border="1px solid"
      borderColor={isSelected ? "blue.400" : defaultBorderColor}
      borderRadius="md"
      bg={bgColor}
      boxShadow={isSelected ? "0 0 0 2px rgba(66,153,225,0.6)" : "md"}
      textAlign="center"
      cursor={!excludedStats.includes(title) ? "pointer" : "default"}
      onClick={!excludedStats.includes(title) ? onClick : undefined}
      transition="all 0.2s"
      _hover={!excludedStats.includes(title) ? { transform: "translateY(-2px)", boxShadow: "lg" } : {}}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="90px"
      minW="110px"
      flex="none"
    >
      {Icon && (
        <Box color={isSelected ? "blue.400" : iconDefaultColor} mb={1}>
          <Icon size="20px" />
        </Box>
      )}
      <Text fontWeight="bold" fontSize="xs" color={textColor}>
        {title.toUpperCase()}
      </Text>
      <Text fontSize="lg" fontWeight="semibold">
        {numericValue}
      </Text>
    </Box>
  );
});

export default Dashboard;

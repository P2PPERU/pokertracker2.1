import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  List,
  ListItem,
  IconButton,
  Flex,
  Badge,
  useToast,
  Grid,
  GridItem,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaTrash,
  FaStar,
  FaHandPaper,
  FaDollarSign,
  FaChartLine,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaHandPointUp,
  FaPercentage,
  FaWater,
  FaExclamationTriangle,
  FaMedal,
  FaWalking,
} from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Favoritos = () => {
  const { auth } = useAuth();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const toast = useToast();

  // Cargar la lista de favoritos del usuario
  const fetchFavoritos = async () => {
    if (!auth || !auth.id) {
      setFavoritos([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/favoritos/${auth.id}`);
      setFavoritos(res.data);
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      toast({
        title: 'Error al cargar favoritos',
        description: 'No se pudieron obtener los favoritos.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoritos();
  }, [auth]);

  // Eliminar favorito
  const removeFavorito = async (player_name) => {
    if (!auth || !auth.id) return;
    try {
      await api.delete(`/favoritos/${auth.id}/${player_name}`);
      toast({
        title: 'Favorito eliminado',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setFavoritos((prev) =>
        prev.filter((fav) => fav.player_name !== player_name)
      );
      // Si el jugador eliminado estaba seleccionado, se ocultan las estadísticas.
      if (selectedPlayer && selectedPlayer.player_name === player_name) {
        setSelectedPlayer(null);
      }
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      toast({
        title: 'Error al eliminar favorito',
        description: error.message,
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Al hacer click en el recuadro del jugador, se consultan sus estadísticas.
  // Si se hace click sobre el mismo jugador, se oculta la sección.
  const handleSelectPlayer = async (fav) => {
    if (selectedPlayer && selectedPlayer.player_name === fav.player_name) {
      setSelectedPlayer(null);
      return;
    }
    setPlayerLoading(true);
    try {
      const res = await api.get(
        `/jugador/${fav.sala}/${encodeURIComponent(fav.player_name)}`
      );
      setSelectedPlayer(res.data);
    } catch (error) {
      console.error('Error al obtener estadísticas del jugador:', error);
      toast({
        title: 'Error al cargar estadísticas',
        description: 'No se pudieron obtener las estadísticas del jugador.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setPlayerLoading(false);
    }
  };

  // Componente para mostrar cada estadística (similar al Dashboard)
  const StatBox = React.memo(({ icon: Icon, title, value }) => {
    const defaultBorderColor = useColorModeValue("gray.200", "gray.600");
    const bgColor = useColorModeValue("white", "gray.700");
    const iconDefaultColor = useColorModeValue("gray.500", "gray.200");
    const textColor = useColorModeValue("gray.600", "gray.300");

    let numericValue = value;
    const excludedStats = ["Manos Jugadas", "Ganancias USD", "WINRATE"];
    if (!excludedStats.includes(title)) {
      let parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        numericValue = Math.round(parsedValue);
      } else {
        numericValue = value.includes("%") || value.includes("$") ? value : "—";
      }
    }

    return (
      <GridItem
        p={2}
        border="1px solid"
        borderColor={defaultBorderColor}
        borderRadius="md"
        bg={bgColor}
        boxShadow="md"
        textAlign="center"
        transition="all 0.2s"
        _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH="90px"
      >
        {Icon && (
          <Box color={iconDefaultColor} mb={1}>
            <Icon size="20px" />
          </Box>
        )}
        <Text fontWeight="bold" fontSize="xs" color={textColor}>
          {title.toUpperCase()}
        </Text>
        <Text fontSize="lg" fontWeight="semibold">
          {numericValue}
        </Text>
      </GridItem>
    );
  });

  if (loading) return <Spinner size="xl" color="blue.500" />;

  // Definir las estadísticas disponibles
  const allStats = selectedPlayer
    ? [
        { icon: FaHandPaper, title: "Manos Jugadas", value: selectedPlayer.total_manos },
        { icon: FaDollarSign, title: "Ganancias USD", value: `$${selectedPlayer.win_usd}` },
        { icon: FaChartLine, title: "WINRATE", value: `${selectedPlayer.bb_100} BB/100` },
        { icon: FaChartPie, title: "VPIP", value: `${selectedPlayer.vpip}%` },
        { icon: FaArrowUp, title: "PFR", value: `${selectedPlayer.pfr}%` },
        { icon: FaSyncAlt, title: "3 BET", value: `${selectedPlayer.three_bet}%` },
        { icon: FaArrowDown, title: "Fold to 3-BET", value: `${selectedPlayer.fold_to_3bet_pct}%` },
        { icon: FaArrowUp, title: "4Bet Preflop", value: `${selectedPlayer.four_bet_preflop_pct}%` },
        { icon: FaArrowDown, title: "Fold to 4Bet", value: `${selectedPlayer.fold_to_4bet_pct}%` },
        { icon: FaChartPie, title: "CBet Flop", value: `${selectedPlayer.cbet_flop}%` },
        { icon: FaChartPie, title: "CBet Turn", value: `${selectedPlayer.cbet_turn}%` },
        { icon: FaPercentage, title: "WWSF", value: `${selectedPlayer.wwsf}%` },
        { icon: FaPercentage, title: "WTSD", value: `${selectedPlayer.wtsd}%` },
        { icon: FaPercentage, title: "WSD", value: `${selectedPlayer.wsd}%` },
        { icon: FaWalking, title: "Limp%", value: `${selectedPlayer.limp_pct}%` },
        { icon: FaHandPointUp, title: "LimpRaise %", value: `${selectedPlayer.limp_raise_pct}%` },
        { icon: FaArrowDown, title: "Fold to Flop CBet", value: `${selectedPlayer.fold_to_flop_cbet_pct}%` },
        { icon: FaArrowDown, title: "Fold to Turn CBet", value: `${selectedPlayer.fold_to_turn_cbet_pct}%` },
        { icon: FaChartPie, title: "Probe Bet Turn %", value: `${selectedPlayer.probe_bet_turn_pct}%` },
        { icon: FaWater, title: "Bet River %", value: `${selectedPlayer.bet_river_pct}%` },
        { icon: FaArrowDown, title: "Fold to River Bet", value: `${selectedPlayer.fold_to_river_bet_pct}%` },
        { icon: FaExclamationTriangle, title: "Overbet Turn %", value: `${selectedPlayer.overbet_turn_pct}%` },
        { icon: FaExclamationTriangle, title: "Overbet River %", value: `${selectedPlayer.overbet_river_pct}%` },
        { icon: FaMedal, title: "WSDWBR %", value: `${selectedPlayer.wsdwbr_pct}%` },
      ]
    : [];

  // Para usuarios "bronce" solo se muestran algunas estadísticas
  const allowedStatsForBronze = [
    "Manos Jugadas",
    "Ganancias USD",
    "WINRATE",
    "VPIP",
    "PFR",
    "3 BET",
    "Fold to 3-BET",
  ];

  const statsToShow =
    auth && auth.suscripcion === "bronce"
      ? allStats.filter((stat) => allowedStatsForBronze.includes(stat.title))
      : allStats;

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")} p={4}>
      <Box
        maxW="1200px"
        mx="auto"
        bg={useColorModeValue("white", "gray.800")}
        p={6}
        rounded="lg"
        boxShadow="lg"
      >
        <Heading mb={4} color={useColorModeValue("gray.800", "white")}>
          Mis Jugadores Favoritos
        </Heading>
        {favoritos.length === 0 ? (
          <Text color={useColorModeValue("gray.600", "gray.300")}>
            No tienes jugadores favoritos.
          </Text>
        ) : (
          <List spacing={3}>
            {favoritos.map((fav) => (
              <ListItem
                key={fav.id}
                p={3}
                borderWidth="1px"
                rounded="md"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={() => handleSelectPlayer(fav)}
                bg={useColorModeValue("gray.50", "gray.700")}
              >
                <Flex align="center" gap={3}>
                  <Badge colorScheme="yellow" fontSize="lg">
                    <FaStar />
                  </Badge>
                  <Box>
                    <Text fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
                      {fav.player_name}
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
                      Sala: {fav.sala}
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                      Fecha agregado: {new Date(fav.fecha_agregado).toLocaleDateString()}
                    </Text>
                  </Box>
                </Flex>
                <IconButton
                  icon={<FaTrash />}
                  aria-label="Eliminar favorito"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorito(fav.player_name);
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {playerLoading && (
          <Flex justifyContent="center" mt={4}>
            <Spinner size="md" color="blue.500" />
          </Flex>
        )}

        {selectedPlayer && !playerLoading && (
          <Box mt={8}>
            <Heading size="md" mb={4} color={useColorModeValue("gray.800", "white")}>
              Estadísticas de {selectedPlayer.player_name}
            </Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={2}>
              {statsToShow.map((stat, idx) => (
                <StatBox key={idx} icon={stat.icon} title={stat.title} value={stat.value} />
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Favoritos;

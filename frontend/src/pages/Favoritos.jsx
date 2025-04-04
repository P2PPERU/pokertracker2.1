import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Heading,
  Grid,
  Flex,
  Badge,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import {
  FaStar,
  FaTrash,
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
} from "react-icons/fa";
import api from "../services/api";
import StatBox from "../components/StatBox";
import { useAuth } from "../context/AuthContext";

const Favoritos = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const [favoritos, setFavoritos] = useState([]);
  const [datos, setDatos] = useState({});
  const [mostrarStats, setMostrarStats] = useState({});
  const [refreshFavorites, setRefreshFavorites] = useState(0);

  const auth = useAuth()?.auth;
  const tieneSuscripcionAvanzada = ["plata", "oro"].includes(auth?.suscripcion);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const res = await api.get("/favoritos", {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setFavoritos(res.data);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
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

  if (!auth?.token) return <Spinner size="xl" mt={8} />;

  if (favoritos.length === 0 && Object.keys(datos).length === 0) {
    return (
      <Box p={8}>
        <Heading size="md">🔄 Cargando favoritos...</Heading>
      </Box>
    );
  }

  if (!favoritos.length) {
    return (
      <Box p={8}>
        <Heading size="md">⭐ No tienes jugadores favoritos aún</Heading>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#DCE2E8" p={4}>
      <Box maxW="1200px" mx="auto" p={6} bg={cardBg} rounded="lg" boxShadow="xl">
        <Heading mb={6}>⭐ Jugadores Favoritos</Heading>

        {favoritos.map((jugador, idx) => {
          const data = datos[jugador.player_name];

          return (
            <Box key={idx} mb={8}>
              <Flex align="center" justify="space-between" mb={2}>
                <Flex align="center" cursor="pointer" onClick={() => toggleStats(jugador.player_name)}>
                  <Badge colorScheme="green" fontSize="lg" mr={2}>
                    {jugador.player_name}
                  </Badge>
                  <FaStar color="gold" />
                </Flex>
                <Box
                  cursor="pointer"
                  onClick={() => eliminarFavorito(jugador.player_name, jugador.sala)}
                  _hover={{ transform: "scale(1.1)" }}
                >
                  <FaTrash color="red" />
                </Box>
              </Flex>

              {!data && <Spinner size="sm" />}
              {data && mostrarStats[jugador.player_name] && (
                <Grid
                  templateColumns="repeat(6, 1fr)"
                  gap={2}
                  justifyContent="start"
                  alignItems="center"
                  mt={4}
                  overflowX="auto"
                  whiteSpace="nowrap"
                >
                  <StatBox icon={FaHandPaper} title="Manos Jugadas" value={data.total_manos} />
                  <StatBox icon={FaDollarSign} title="Ganancias USD" value={`$${data.win_usd}`} />
                  <StatBox icon={FaChartLine} title="WINRATE" value={`${data.bb_100} BB/100`} />
                  <StatBox icon={FaChartPie} title="VPIP" value={`${data.vpip}%`} />
                  <StatBox icon={FaArrowUp} title="PFR" value={`${data.pfr}%`} />
                  <StatBox icon={FaSyncAlt} title="3 BET" value={`${data.three_bet}%`} />
                  <StatBox icon={FaArrowDown} title="Fold to 3-BET" value={`${data.fold_to_3bet_pct}%`} />

                  {tieneSuscripcionAvanzada && (
                    <>
                      <StatBox icon={FaArrowUp} title="4Bet Preflop" value={`${data.four_bet_preflop_pct}%`} />
                      <StatBox icon={FaArrowDown} title="Fold to 4-Bet" value={`${data.fold_to_4bet_pct}%`} />
                      <StatBox icon={FaChartPie} title="CBet Flop" value={`${data.cbet_flop}%`} />
                      <StatBox icon={FaChartPie} title="CBet Turn" value={`${data.cbet_turn}%`} />
                      <StatBox icon={FaPercentage} title="WWSF" value={`${data.wwsf}%`} />
                      <StatBox icon={FaPercentage} title="WTSD" value={`${data.wtsd}%`} />
                      <StatBox icon={FaPercentage} title="WSD" value={`${data.wsd}%`} />
                      <StatBox icon={FaWalking} title="Limp %" value={`${data.limp_pct}%`} />
                      <StatBox icon={FaHandPointUp} title="Limp-Raise %" value={`${data.limp_raise_pct}%`} />
                      <StatBox icon={FaArrowDown} title="Fold to Flop CBet" value={`${data.fold_to_flop_cbet_pct}%`} />
                      <StatBox icon={FaArrowDown} title="Fold to Turn CBet" value={`${data.fold_to_turn_cbet_pct}%`} />
                      <StatBox icon={FaChartPie} title="Probe Bet Turn %" value={`${data.probe_bet_turn_pct}%`} />
                      <StatBox icon={FaWater} title="Bet River %" value={`${data.bet_river_pct}%`} />
                      <StatBox icon={FaArrowDown} title="Fold to River Bet" value={`${data.fold_to_river_bet_pct}%`} />
                      <StatBox icon={FaExclamationTriangle} title="Overbet Turn %" value={`${data.overbet_turn_pct}%`} />
                      <StatBox icon={FaExclamationTriangle} title="Overbet River %" value={`${data.overbet_river_pct}%`} />
                      <StatBox icon={FaMedal} title="WSDwBR %" value={`${data.wsdwbr_pct}%`} />
                    </>
                  )}
                </Grid>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Favoritos;
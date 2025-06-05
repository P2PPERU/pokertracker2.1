import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  Text,
  useColorModeValue,
  Badge,
  Select,
  Icon,
  TableContainer,
  HStack,
  Tooltip,
  useBreakpointValue,
  Alert,
  AlertIcon,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaChartLine,
  FaDollarSign,
  FaSortAmountUp,
  FaSortAmountDown,
  FaMedal,
  FaInfoCircle,
  FaUsers,
  FaLayerGroup,
  FaGamepad,
} from "react-icons/fa";
import api from "../services/api";

const TopJugadores = () => {
  const [stake, setStake] = useState("nl100");
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("win_usd");
  const [sortDirection, setSortDirection] = useState("desc");

  // Stakes del CSV
  const stakeOptions = [
    { value: "microstakes", label: "Microstakes", range: "NL10-50", color: "green" },
    { value: "nl100", label: "NL100", range: "$0.50/$1", color: "blue" },
    { value: "nl200", label: "NL200", range: "$1/$2", color: "purple" },
    { value: "nl400", label: "NL400", range: "$2/$4", color: "orange" },
    { value: "high-stakes", label: "High Stakes", range: "NL1K+", color: "red" }
  ];

  // Detectar si es móvil
  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });
  const padding = useBreakpointValue({ base: 3, md: 5 });

  // Colores y estilos
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCentral = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const evenRowBg = useColorModeValue("gray.50", "gray.700");
  const oddRowBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.600", "blue.700");
  const hoverBg = useColorModeValue("blue.50", "blue.900");
  const statsBg = useColorModeValue("gray.50", "gray.700");

  // Medallas para los primeros lugares
  const medals = [
    { color: "yellow.400", icon: FaTrophy, label: "Campeón" },
    { color: "gray.400", icon: FaMedal, label: "Subcampeón" },
    { color: "orange.400", icon: FaMedal, label: "Tercer Lugar" }
  ];

  // Obtener info del stake actual
  const getCurrentStakeInfo = () => stakeOptions.find(s => s.value === stake) || stakeOptions[0];

  // Calcular estadísticas del top 10
  const getTopStats = () => {
    if (!jugadores || jugadores.length === 0) {
      return { totalPlayers: 0, avgWinnings: 0, totalHands: 0 };
    }
    const top10 = jugadores.slice(0, 10);
    const totalPlayers = jugadores.length;
    const avgWinnings = top10.reduce((sum, j) => sum + parseFloat(j.win_usd || 0), 0) / top10.length;
    const totalHands = top10.reduce((sum, j) => sum + parseInt(j.total_manos || 0), 0);
    return { totalPlayers, avgWinnings, totalHands };
  };

  // Función para ordenar jugadores
  const sortJugadores = (data) => {
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'total_manos') {
        aVal = parseInt(aVal) || 0;
        bVal = parseInt(bVal) || 0;
      } else if (typeof aVal === 'string' && !isNaN(aVal)) {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const obtenerTopJugadores = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await api.get(`/top-jugadores/${stake}`, config);
      setJugadores(res.data);
    } catch (error) {
      console.error("Error al obtener el ranking:", error);
      setError("No se pudo cargar el ranking. Intenta nuevamente.");
      setJugadores([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    obtenerTopJugadores();
    // eslint-disable-next-line
  }, [stake]);

  // Formatear números
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-PE').format(value);
  };

  // Aplicar ordenamiento
  const jugadoresOrdenados = sortJugadores(jugadores);
  const stats = getTopStats();
  const stakeInfo = getCurrentStakeInfo();

  return (
    <Box minH="100vh" bg={bgPage} py={[4, 8]} px={[2, 4]}>
      <Flex px={[2, 4]} py={[2, 4]} gap={4} justify="center" flexWrap="wrap">
        {/* Banner izquierdo */}
        <Box
          display={["none", "none", "flex"]}
          alignItems="center"
          justifyContent="center"
          width="300px"
          bg="transparent"
          borderRadius="lg"
          boxShadow="md"
          overflow="hidden"
          p={0}
          height="fit-content"
        >
          <a
            href="https://wa.me/51991351213?text=Hola,%20quiero%20más%20info%20sobre%20Supernova"
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: "100%" }}
          >
            <Box
              position="relative"
              overflow="hidden"
              borderRadius="lg"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "lg"
              }}
            >
              <img
                src="/images/supernova.png"
                alt="Publicidad Supernova"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
              />
            </Box>
          </a>
        </Box>

        {/* Contenido principal */}
        <Box
          flex="1"
          maxW="1200px"
          bg={bgCentral}
          borderRadius="xl"
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          {/* Encabezado */}
          <Box p={padding} bg={headerBg} color="white">
            <Flex
              direction={isMobile ? "column" : "row"}
              justify="space-between"
              align={isMobile ? "start" : "center"}
              gap={3}
            >
              <HStack spacing={2} mb={isMobile ? 3 : 0}>
                <Icon as={FaTrophy} boxSize={6} />
                <Heading size="md" fontWeight="bold">
                  Top 10 Jugadores
                </Heading>
              </HStack>
              <HStack spacing={3} wrap="wrap">
                <Icon as={FaLayerGroup} />
                <Select
                  size="sm"
                  width="auto"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  bg="whiteAlpha.300"
                  color="white"
                  borderColor="whiteAlpha.300"
                  fontWeight="bold"
                >
                  {stakeOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ color: 'black' }}>
                      {option.label} ({option.range})
                    </option>
                  ))}
                </Select>
              </HStack>
            </Flex>
          </Box>

          {/* Card de estadísticas del stake */}
          {!loading && jugadoresOrdenados.length > 0 && (
            <Box p={padding} bg={statsBg}>
              <SimpleGrid columns={isMobile ? 1 : 3} spacing={4}>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaUsers} color={stakeInfo.color + ".500"} />
                      <Text>Total Jugadores</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{stats.totalPlayers}</StatNumber>
                  <Text fontSize="xs" color="gray.500">
                    En {stakeInfo.label}
                  </Text>
                </Stat>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaDollarSign} color="green.500" />
                      <Text>Ganancia Promedio</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={stats.avgWinnings > 0 ? "green.500" : "red.500"}>
                    {formatCurrency(stats.avgWinnings)}
                  </StatNumber>
                  <Text fontSize="xs" color="gray.500">
                    Top 10
                  </Text>
                </Stat>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaGamepad} color="purple.500" />
                      <Text>Manos Totales</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{formatNumber(stats.totalHands)}</StatNumber>
                  <Text fontSize="xs" color="gray.500">
                    Top 10
                  </Text>
                </Stat>
              </SimpleGrid>
            </Box>
          )}

          <Divider />

          {/* Contenido de la tabla */}
          <Box p={padding}>
            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            {loading ? (
              <Flex justify="center" align="center" p={6} direction="column" gap={3}>
                <Spinner size="lg" color="blue.500" thickness="3px" />
                <Text color={textColor}>Cargando ranking de {stakeInfo.label}...</Text>
              </Flex>
            ) : (
              <TableContainer>
                <Table
                  variant="simple"
                  size={tableSize}
                  style={{ borderCollapse: "separate", borderSpacing: "0 1px" }}
                >
                  <Thead bg={useColorModeValue("gray.100", "gray.700")}>
                    <Tr>
                      <Th p={isMobile ? 2 : 4} fontSize={isMobile ? "xs" : "sm"} width="40px">#</Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort('player_name')}
                        p={isMobile ? 2 : 4}
                        fontSize={isMobile ? "xs" : "sm"}
                      >
                        <Flex align="center">
                          <Text mr={1}>Jugador</Text>
                          {sortField === 'player_name' && (
                            <Icon as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} boxSize={3} />
                          )}
                        </Flex>
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort('total_manos')}
                        p={isMobile ? 2 : 4}
                        fontSize={isMobile ? "xs" : "sm"}
                        isNumeric
                      >
                        <Flex align="center" justify="flex-end">
                          <Text mr={1}>Manos</Text>
                          {sortField === 'total_manos' && (
                            <Icon as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} boxSize={3} />
                          )}
                          <Icon as={FaGamepad} ml={1} boxSize={3} />
                        </Flex>
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort('bb_100')}
                        p={isMobile ? 2 : 4}
                        fontSize={isMobile ? "xs" : "sm"}
                        isNumeric
                      >
                        <Flex align="center" justify="flex-end">
                          <Text mr={1}>BB/100</Text>
                          {sortField === 'bb_100' && (
                            <Icon as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} boxSize={3} />
                          )}
                          <Icon as={FaChartLine} ml={1} boxSize={3} />
                        </Flex>
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => handleSort('win_usd')}
                        p={isMobile ? 2 : 4}
                        fontSize={isMobile ? "xs" : "sm"}
                        isNumeric
                      >
                        <Flex align="center" justify="flex-end">
                          <Text mr={1}>Ganancias</Text>
                          {sortField === 'win_usd' && (
                            <Icon as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} boxSize={3} />
                          )}
                          <Icon as={FaDollarSign} ml={1} boxSize={3} />
                        </Flex>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {jugadoresOrdenados.slice(0, 10).map((jugador, index) => {
                      const isTop3 = index < 3;
                      const rowBg = isTop3
                        ? useColorModeValue(
                          index === 0 ? "yellow.50" : index === 1 ? "gray.100" : "orange.50",
                          index === 0 ? "yellow.900" : index === 1 ? "gray.700" : "orange.900"
                        )
                        : index % 2 === 0 ? evenRowBg : oddRowBg;
                      return (
                        <Tr
                          key={jugador.player_name}
                          _hover={{ bg: hoverBg }}
                          transition="all 0.2s"
                          backgroundColor={rowBg}
                        >
                          <Td p={isMobile ? 2 : 4}>
                            {isTop3 ? (
                              <Tooltip label={medals[index].label}>
                                <Box display="flex" alignItems="center">
                                  <Icon as={medals[index].icon} color={medals[index].color} boxSize={5} />
                                </Box>
                              </Tooltip>
                            ) : (
                              <Text fontWeight="bold">{index + 1}</Text>
                            )}
                          </Td>
                          <Td p={isMobile ? 2 : 4} fontWeight={isTop3 ? "bold" : "normal"} fontSize={isMobile ? "sm" : "md"}>
                            <HStack>
                              <Text>{jugador.player_name}</Text>
                              {index === 0 && !isMobile && (
                                <Badge colorScheme="yellow" fontSize="xs">TOP</Badge>
                              )}
                            </HStack>
                          </Td>
                          <Td p={isMobile ? 2 : 4} isNumeric>
                            <Text fontWeight="medium">
                              {formatNumber(jugador.total_manos)}
                            </Text>
                          </Td>
                          <Td p={isMobile ? 2 : 4} isNumeric>
                            <Badge
                              colorScheme={parseFloat(jugador.bb_100) > 0 ? "green" : "red"}
                              variant="subtle"
                              px={2}
                              fontSize={isMobile ? "xs" : "sm"}
                            >
                              {jugador.bb_100}
                            </Badge>
                          </Td>
                          <Td
                            p={isMobile ? 2 : 4}
                            isNumeric
                            fontWeight={isTop3 ? "bold" : "normal"}
                            fontSize={isMobile ? "sm" : "md"}
                          >
                            <Text color={parseFloat(jugador.win_usd) > 0 ? "green.500" : "red.500"}>
                              {formatCurrency(jugador.win_usd)}
                            </Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            )}

            {/* Información adicional */}
            {!loading && jugadoresOrdenados.length > 0 && (
              <VStack spacing={3} mt={6}>
                <Badge colorScheme={stakeInfo.color} p={2} borderRadius="md" fontSize="sm">
                  {stakeInfo.label} • {stakeInfo.range}
                </Badge>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Datos actualizados del sistema CSV • Mostrando top 10 de {stats.totalPlayers} jugadores
                </Text>
              </VStack>
            )}

            {/* Sin datos */}
            {!loading && jugadoresOrdenados.length === 0 && (
              <VStack spacing={4} py={8}>
                <Icon as={FaInfoCircle} boxSize={12} color="gray.400" />
                <Text fontSize={isMobile ? "sm" : "md"} color="gray.500" textAlign="center">
                  No hay jugadores disponibles para {stakeInfo.label}
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Intenta seleccionar otro nivel de stake
                </Text>
              </VStack>
            )}
          </Box>
        </Box>

        {/* Banner derecho */}
        <Box
          display={["none", "none", "flex"]}
          alignItems="center"
          justifyContent="center"
          width="300px"
          bg="transparent"
          borderRadius="lg"
          boxShadow="md"
          overflow="hidden"
          p={0}
          height="fit-content"
        >
          <a
            href="https://wa.me/51991351213?text=Hola,%20quiero%20más%20info%20sobre%20Peruev"
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: "100%" }}
          >
            <Box
              position="relative"
              overflow="hidden"
              borderRadius="lg"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "lg"
              }}
            >
              <img
                src="/images/peruev.png"
                alt="Publicidad Peruev+"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
              />
            </Box>
          </a>
        </Box>
      </Flex>
    </Box>
  );
};

export default TopJugadores;

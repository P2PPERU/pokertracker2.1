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
  Input,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Badge,
  Select,
  Icon,
  InputGroup,
  InputLeftElement,
  TableContainer,
  HStack,
  Tooltip,
  useBreakpointValue,
  Alert,
  AlertIcon,
  IconButton
} from "@chakra-ui/react";
import { 
  FaTrophy, 
  FaSearch, 
  FaChartLine, 
  FaDollarSign, 
  FaSortAmountUp, 
  FaSortAmountDown,
  FaMedal,
  FaInfoCircle
} from "react-icons/fa";
import api from "../services/api";

const TopJugadores = () => {
  const [stake, setStake] = useState("50");
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("bb_100");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Valores de stake predefinidos para el selector
  const stakeOptions = ["1", "2", "5", "10", "25", "50", "100", "200", "500"];
  
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
  
  // Medallas para los primeros lugares
  const medals = [
    { color: "yellow.400", icon: FaTrophy, label: "Campeón" },
    { color: "gray.400", icon: FaMedal, label: "Subcampeón" },
    { color: "orange.400", icon: FaMedal, label: "Tercer Lugar" }
  ];

  // Función para ordenar jugadores
  const sortJugadores = (data) => {
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Asegurar que estamos comparando números
      if (typeof aVal === 'string' && !isNaN(aVal)) aVal = parseFloat(aVal);
      if (typeof bVal === 'string' && !isNaN(bVal)) bVal = parseFloat(bVal);
      
      // Para ordenamiento de texto (como nombres)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      // Para ordenamiento numérico
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  // Convertir stake a formato de ciegas
  const formatBlindLevel = (stakeValue) => {
    const numValue = parseInt(stakeValue, 10);
    if (isNaN(numValue)) return stakeValue;
    
    // Formato de ciegas (small blind / big blind)
    const smallBlind = numValue / 2;
    const bigBlind = numValue;
    return `${smallBlind}/${bigBlind}`;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Cambiar dirección si es el mismo campo
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, establecer ordenamiento predeterminado
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const obtenerTopJugadores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/top-jugadores/${stake}`);
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
  }, []); // Solo al montar

  // Formatear ganancias con separador de miles
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Aplicar ordenamiento a los jugadores
  const jugadoresOrdenados = sortJugadores(jugadores);

  return (
    <Box 
      minH="100vh" 
      bg={bgPage} 
      py={[4, 8]} 
      px={[2, 4]}
    >
      <Flex px={[2, 4]} py={[2, 4]} gap={4} justify="center" flexWrap="wrap">
        {/* Banner publicitario izquierdo - solo en desktop */}
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
          maxW="1000px"
          bg={bgCentral}
          borderRadius="xl"
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          {/* Encabezado */}
          <Box 
            p={padding} 
            bg={headerBg}
            color="white"
          >
            <Flex 
              direction={isMobile ? "column" : "row"} 
              justify="space-between" 
              align={isMobile ? "start" : "center"} 
              gap={3}
            >
              <HStack spacing={2} mb={isMobile ? 3 : 0}>
                <Icon as={FaTrophy} boxSize={6} />
                <Heading size="md" fontWeight="bold">
                  Top Jugadores por Stake
                </Heading>
              </HStack>
              
              <HStack spacing={2} wrap="wrap">
                <Text fontWeight="medium" fontSize="sm">
                  Ciegas:
                </Text>
                <Select
                  size="sm"
                  width="auto"
                  value={stakeOptions.includes(stake) ? stake : "custom"}
                  onChange={(e) => setStake(e.target.value)}
                  bg="whiteAlpha.300"
                  color="white"
                  borderColor="whiteAlpha.300"
                >
                  {stakeOptions.map(option => (
                    <option key={option} value={option} style={{color: 'black'}}>
                      {formatBlindLevel(option)}
                    </option>
                  ))}
                  <option value="custom" style={{color: 'black'}}>Otro</option>
                </Select>
                
                {stake === "custom" && (
                  <InputGroup size="sm" width="100px">
                    <InputLeftElement color="gray.300">
                      <Icon as={FaSearch} boxSize={3} />
                    </InputLeftElement>
                    <Input
                      placeholder="Big blind"
                      value={stake === "custom" ? "" : stake}
                      onChange={(e) => setStake(e.target.value)}
                      bg="whiteAlpha.200"
                      color="white"
                    />
                  </InputGroup>
                )}
                
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={obtenerTopJugadores}
                  leftIcon={<FaSearch />}
                >
                  Buscar
                </Button>
                
                <Tooltip label="El valor indica la ciega grande (big blind). Ej: 50 = ciegas 25/50">
                  <IconButton
                    icon={<FaInfoCircle />}
                    size="sm"
                    variant="ghost"
                    color="white"
                    aria-label="Información de ciegas"
                  />
                </Tooltip>
              </HStack>
            </Flex>
            
            {/* Información de ciegas - visible solo en móvil */}
            {isMobile && (
              <Alert status="info" mt={3} fontSize="xs" py={2} px={3} borderRadius="md">
                <AlertIcon boxSize={4} />
                Ciegas {formatBlindLevel(stake)} - NL{stake}
              </Alert>
            )}
          </Box>

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
                <Text color={textColor}>Cargando ranking...</Text>
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
                      <Th 
                        cursor="pointer" 
                        onClick={() => handleSort('player_position')}
                        p={isMobile ? 2 : 4}
                        fontSize={isMobile ? "xs" : "sm"}
                        width="40px"
                      >
                        <Flex align="center">
                          <Text mr={1}>#</Text>
                          {sortField === 'player_position' && (
                            <Icon 
                              as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} 
                              boxSize={3} 
                            />
                          )}
                        </Flex>
                      </Th>
                      <Th 
                        cursor="pointer" 
                        onClick={() => handleSort('player_name')}
                        p={isMobile ? 2 : 4}
                        fontSize={isMobile ? "xs" : "sm"}
                      >
                        <Flex align="center">
                          <Text mr={1}>Jugador</Text>
                          {sortField === 'player_name' && (
                            <Icon 
                              as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} 
                              boxSize={3} 
                            />
                          )}
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
                            <Icon 
                              as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} 
                              boxSize={3} 
                            />
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
                            <Icon 
                              as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} 
                              boxSize={3} 
                            />
                          )}
                          <Icon as={FaDollarSign} ml={1} boxSize={3} />
                        </Flex>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {jugadoresOrdenados.length > 0 ? (
                      jugadoresOrdenados.map((jugador, index) => (
                        <Tr 
                          key={jugador.player_name}
                          _hover={{ bg: hoverBg }}
                          transition="all 0.2s"
                          backgroundColor={index % 2 === 0 ? evenRowBg : oddRowBg}
                        >
                          <Td p={isMobile ? 2 : 4}>
                            {index < 3 ? (
                              <Tooltip label={medals[index].label}>
                                <Box>
                                  <Icon 
                                    as={medals[index].icon} 
                                    color={medals[index].color} 
                                    boxSize={4} 
                                  />
                                </Box>
                              </Tooltip>
                            ) : (
                              index + 1
                            )}
                          </Td>
                          <Td 
                            p={isMobile ? 2 : 4} 
                            fontWeight={index < 3 ? "bold" : "normal"}
                            fontSize={isMobile ? "sm" : "md"}
                          >
                            {jugador.player_name}
                            {index === 0 && !isMobile && (
                              <Badge ml={2} colorScheme="yellow" fontSize="xs">
                                TOP
                              </Badge>
                            )}
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
                            fontWeight={index < 3 ? "bold" : "normal"}
                            fontSize={isMobile ? "sm" : "md"}
                          >
                            <Text 
                              color={parseFloat(jugador.win_usd) > 0 ? "green.500" : "red.500"}
                            >
                              {isMobile 
                                ? formatCurrency(jugador.win_usd).replace('.00', '') 
                                : formatCurrency(jugador.win_usd)
                              }
                            </Text>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={4} textAlign="center" py={4}>
                          <Text fontSize={isMobile ? "sm" : "md"} color="gray.500">
                            No hay jugadores disponibles para NL{stake} ({formatBlindLevel(stake)})
                          </Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
            
            {/* Nota informativa sobre las ciegas */}
            {!isMobile && jugadoresOrdenados.length > 0 && (
              <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
                Mostrando resultados para NL{stake} (ciegas {formatBlindLevel(stake)})
              </Text>
            )}
          </Box>
        </Box>

        {/* Banner publicitario derecho - solo en desktop */}
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
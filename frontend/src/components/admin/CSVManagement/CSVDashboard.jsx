import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Button,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  useToast,
  Flex,
  Divider,
} from '@chakra-ui/react';
import {
  FaDatabase,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaChartBar,
  FaSyncAlt,
  FaFileAlt,
  FaLayerGroup,
} from 'react-icons/fa';
import api from '../../../services/api';

const CSVDashboard = ({ refreshTrigger }) => {
  const [archivos, setArchivos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colores
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const statBg = useColorModeValue('blue.50', 'blue.900');

  const toast = useToast();

  const fetchCSVDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const { data } = await api.get('/admin/csv-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setArchivos(data.archivos_cargados || []);
      setResumen(data.resumen || {});
      
    } catch (error) {
      console.error('Error cargando dashboard CSV:', error);
      setError('Error al cargar la información de archivos CSV');
      
      toast({
        title: 'Error',
        description: 'No se pudo cargar el dashboard de CSV',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSVDashboard();
  }, [refreshTrigger]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeColor = (tipoPeriodo) => {
    switch (tipoPeriodo) {
      case 'total': return 'blue';
      case 'semana': return 'green';
      case 'mes': return 'purple';
      default: return 'gray';
    }
  };

  const getSalaColor = (sala) => {
    switch (sala) {
      case 'XPK': return 'orange';
      case 'PPP': return 'red';
      case 'PM': return 'teal';
      default: return 'gray';
    }
  };

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

  const getStakeLabel = (stake) => {
    switch (stake) {
      case 'microstakes': return 'Micro';
      case 'nl100': return 'NL100';
      case 'nl200': return 'NL200';
      case 'nl400': return 'NL400';
      case 'high-stakes': return 'High';
      default: return stake?.toUpperCase() || 'N/A';
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <VStack spacing={3}>
          <Spinner size="xl" thickness="4px" color="blue.500" />
          <Text>Cargando dashboard CSV...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Error</Text>
          <Text fontSize="sm">{error}</Text>
        </Box>
      </Alert>
    );
  }

  // Agrupar archivos por fecha y stake
  const archivosAgrupados = archivos.reduce((acc, archivo) => {
    const key = `${archivo.fecha_snapshot}-${archivo.stake_category}`;
    if (!acc[key]) {
      acc[key] = {
        fecha_snapshot: archivo.fecha_snapshot,
        stake_category: archivo.stake_category,
        archivos: [],
        total_jugadores: 0,
        salas: new Set()
      };
    }
    acc[key].archivos.push(archivo);
    acc[key].total_jugadores += parseInt(archivo.total_jugadores || 0);
    acc[key].salas.add(archivo.sala);
    return acc;
  }, {});

  return (
    <VStack spacing={6} align="stretch">
      
      {/* Header con botón de refresh */}
      <Flex justify="space-between" align="center">
        <HStack>
          <Icon as={FaDatabase} color="blue.500" boxSize={5} />
          <Text fontSize="lg" fontWeight="bold">
            Dashboard de Archivos CSV
          </Text>
        </HStack>
        
        <Button
          leftIcon={<FaSyncAlt />}
          colorScheme="blue"
          variant="outline"
          size="sm"
          onClick={fetchCSVDashboard}
        >
          Actualizar
        </Button>
      </Flex>

      {/* Estadísticas generales */}
      {resumen && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Stat
            bg={cardBg}
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <StatLabel>
              <HStack>
                <Icon as={FaFileAlt} color="blue.500" />
                <Text>Total Snapshots</Text>
              </HStack>
            </StatLabel>
            <StatNumber>{resumen.total_snapshots || 0}</StatNumber>
            <StatHelpText>Archivos cargados</StatHelpText>
          </Stat>

          <Stat
            bg={cardBg}
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <StatLabel>
              <HStack>
                <Icon as={FaUsers} color="green.500" />
                <Text>Total Jugadores</Text>
              </HStack>
            </StatLabel>
            <StatNumber>{(resumen.total_jugadores || 0).toLocaleString()}</StatNumber>
            <StatHelpText>En todos los archivos</StatHelpText>
          </Stat>

          <Stat
            bg={cardBg}
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <StatLabel>
              <HStack>
                <Icon as={FaCalendarAlt} color="purple.500" />
                <Text>Última Fecha</Text>
              </HStack>
            </StatLabel>
            <StatNumber fontSize="lg">{formatearFecha(resumen.ultima_fecha)}</StatNumber>
            <StatHelpText>Último snapshot</StatHelpText>
          </Stat>

          <Stat
            bg={statBg}
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <StatLabel>
              <HStack>
                <Icon as={FaChartBar} color="blue.600" />
                <Text>Estado</Text>
              </HStack>
            </StatLabel>
            <StatNumber fontSize="lg">
              <Badge colorScheme="green" p={2} borderRadius="md">
                Activo
              </Badge>
            </StatNumber>
            <StatHelpText>Sistema operativo</StatHelpText>
          </Stat>
        </SimpleGrid>
      )}

      <Divider />

      {/* Tabla de archivos cargados */}
      <Box>
        <Text fontSize="md" fontWeight="bold" mb={4}>
          📁 Archivos CSV Cargados
        </Text>
        
        {archivos.length === 0 ? (
          <Box
            bg={cardBg}
            p={8}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
          >
            <Icon as={FaFileAlt} boxSize={8} color="gray.400" mb={3} />
            <Text color="gray.500" fontSize="lg">
              No hay archivos CSV cargados
            </Text>
            <Text color="gray.400" fontSize="sm" mt={1}>
              Sube tu primer archivo CSV usando el formulario superior
            </Text>
          </Box>
        ) : (
          <Box
            bg={cardBg}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Table variant="simple" size="md">
              <Thead bg={headerBg}>
                <Tr>
                  <Th>Fecha Snapshot</Th>
                  <Th>Período</Th>
                  <Th>Sala</Th>
                  <Th>
                    <HStack>
                      <Icon as={FaLayerGroup} />
                      <Text>Stake</Text>
                    </HStack>
                  </Th>
                  <Th>Jugadores</Th>
                  <Th>Último Procesamiento</Th>
                </Tr>
              </Thead>
              <Tbody>
                {archivos.map((archivo, index) => (
                  <Tr key={index} _hover={{ bg: hoverBg }}>
                    <Td>
                      <HStack>
                        <Icon as={FaCalendarAlt} color="blue.500" />
                        <Text fontWeight="medium">
                          {formatearFecha(archivo.fecha_snapshot)}
                        </Text>
                      </HStack>
                    </Td>
                    
                    <Td>
                      <Badge 
                        colorScheme={getBadgeColor(archivo.tipo_periodo)}
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        {archivo.tipo_periodo.toUpperCase()}
                      </Badge>
                    </Td>
                    
                    <Td>
                      <Badge 
                        colorScheme={getSalaColor(archivo.sala)}
                        px={2}
                        py={1}
                        borderRadius="md"
                        variant="outline"
                      >
                        {archivo.sala}
                      </Badge>
                    </Td>
                    
                    <Td>
                      <Badge 
                        colorScheme={getStakeColor(archivo.stake_category)}
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        {getStakeLabel(archivo.stake_category)}
                      </Badge>
                    </Td>
                    
                    <Td>
                      <HStack>
                        <Icon as={FaUsers} color="green.500" boxSize={4} />
                        <Text fontWeight="bold">
                          {parseInt(archivo.total_jugadores).toLocaleString()}
                        </Text>
                      </HStack>
                    </Td>
                    
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatearFechaCompleta(archivo.ultimo_procesamiento)}
                        </Text>
                        <HStack>
                          <Icon as={FaClock} color="gray.400" boxSize={3} />
                          <Text fontSize="xs" color="gray.500">
                            Procesado
                          </Text>
                        </HStack>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Resumen por Stake */}
      <Box>
        <Text fontSize="md" fontWeight="bold" mb={4}>
          📊 Resumen por Nivel de Stake
        </Text>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
          {['microstakes', 'nl100', 'nl200', 'nl400', 'high-stakes'].map(stake => {
            const archivosStake = archivos.filter(a => a.stake_category === stake);
            const totalJugadores = archivosStake.reduce((sum, a) => sum + parseInt(a.total_jugadores || 0), 0);
            
            return (
              <Box
                key={stake}
                bg={cardBg}
                p={4}
                borderRadius="lg"
                border="2px solid"
                borderColor={archivosStake.length > 0 ? `${getStakeColor(stake)}.300` : borderColor}
              >
                <VStack align="start" spacing={2}>
                  <Badge
                    colorScheme={getStakeColor(stake)}
                    fontSize="sm"
                    px={2}
                    py={1}
                  >
                    {getStakeLabel(stake)}
                  </Badge>
                  <Text fontSize="2xl" fontWeight="bold">
                    {totalJugadores.toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {archivosStake.length} archivo{archivosStake.length !== 1 ? 's' : ''}
                  </Text>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Información adicional */}
      <Box
        bg={useColorModeValue("blue.50", "blue.900")}
        p={4}
        borderRadius="md"
        border="1px solid"
        borderColor={useColorModeValue("blue.200", "blue.700")}
      >
        <HStack mb={2}>
          <Icon as={FaChartBar} color="blue.600" />
          <Text fontSize="sm" fontWeight="bold">
            ℹ️ Información del Sistema CSV
          </Text>
        </HStack>
        <VStack align="start" spacing={1} fontSize="xs" color="gray.600">
          <Text>• Los archivos se procesan automáticamente al subirlos</Text>
          <Text>• El stake se selecciona manualmente al subir cada archivo</Text>
          <Text>• La sala se detecta automáticamente desde la columna "Site" del CSV</Text>
          <Text>• Se detectan duplicados por: fecha + período + sala + jugador + stake</Text>
          <Text>• Sistema optimizado para 45+ estadísticas por jugador</Text>
        </VStack>
      </Box>

    </VStack>
  );
};

export default CSVDashboard;
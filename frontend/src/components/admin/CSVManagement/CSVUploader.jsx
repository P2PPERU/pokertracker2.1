import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  Progress,
  useToast,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  Icon,
  Badge,
  Flex,
  Spinner,
  Code,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FaUpload,
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfo,
  FaChartBar,
} from 'react-icons/fa';
import api from '../../../services/api';

const CSVUploader = ({ onUploadSuccess }) => {
  const [archivo, setArchivo] = useState(null);
  const [tipoPeriodo, setTipoPeriodo] = useState('total');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [stakeSeleccionado, setStakeSeleccionado] = useState('');
  const [contenidoCSV, setContenidoCSV] = useState('');
  const [validacion, setValidacion] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Colores
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const successBg = useColorModeValue('green.50', 'green.900');
  const errorBg = useColorModeValue('red.50', 'red.900');
  const warningBg = useColorModeValue('yellow.50', 'yellow.900');

  const toast = useToast();

  // Validar CSV
  const validateCSV = (content) => {
    if (!content) return null;

    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { valid: false, error: 'El archivo debe tener al menos headers y una fila de datos' };
    }

    // Parsear headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const requiredHeaders = ['Site', 'Player', 'Hands', 'BB/100', 'VPIP', 'PFR'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return { 
        valid: false, 
        error: `Headers faltantes: ${missingHeaders.join(', ')}` 
      };
    }

    return {
      valid: true,
      info: {
        headers: headers.length,
        totalLines: lines.length,
        dataLines: lines.length - 1
      }
    };
  };

  // Validar contenido cuando cambie
  useEffect(() => {
    if (contenidoCSV) {
      const validation = validateCSV(contenidoCSV);
      setValidacion(validation);
    } else {
      setValidacion(null);
    }
  }, [contenidoCSV]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo CSV',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setArchivo(file);
    setResultado(null);

    // Leer el contenido del archivo
    const reader = new FileReader();
    reader.onload = (e) => {
      setContenidoCSV(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!validacion?.valid) {
      toast({
        title: 'Error de validación',
        description: validacion?.error || 'El archivo CSV no es válido',
        status: 'error',
        duration: 3000
      });
      return;
    }

    // Validar stake
    if (!stakeSeleccionado) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un stake',
        status: 'error',
        duration: 3000
      });
      return;
    }

    if (!tipoPeriodo || !fecha) {
      toast({
        title: 'Error',
        description: 'Tipo de período y fecha son obligatorios',
        status: 'error',
        duration: 3000
      });
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      const response = await api.post('/admin/upload-stats-csv', {
        contenidoCSV,
        tipoPeriodo,
        fecha,
        stake: stakeSeleccionado  // Enviar el stake seleccionado
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = response.data;
      setResultado(result);
      
      toast({
        title: 'CSV procesado exitosamente',
        description: `${result.estadisticas.total_procesados} jugadores procesados para ${stakeSeleccionado.toUpperCase()}`,
        status: 'success',
        duration: 5000
      });

      // Limpiar formulario
      resetForm();
      
      // Notificar al componente padre
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Error al procesar el archivo',
        status: 'error',
        duration: 5000
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setArchivo(null);
    setContenidoCSV('');
    setResultado(null);
    setValidacion(null);
    setTipoPeriodo('total');
    setStakeSeleccionado('');
    setFecha(new Date().toISOString().split('T')[0]);
  };

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="base"
    >
      <VStack spacing={6} align="stretch">
        
        {/* Header */}
        <Box>
          <HStack mb={2}>
            <Icon as={FaUpload} color="blue.500" boxSize={5} />
            <Text fontSize="lg" fontWeight="bold">
              Subir Archivo CSV de Estadísticas
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            Sube archivos CSV con estadísticas de jugadores para el sistema
          </Text>
        </Box>

        <Divider />

        {/* Información de categorías de stakes */}
        <Box
          p={4}
          bg={useColorModeValue("blue.50", "blue.900")}
          borderRadius="lg"
          border="1px solid"
          borderColor={useColorModeValue("blue.200", "blue.700")}
        >
          <Text fontSize="sm" fontWeight="bold" mb={3}>
            🎯 Niveles de Stakes Disponibles
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={2}>
            <Box p={2} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <HStack mb={1}>
                <Text fontSize="sm">🐟</Text>
                <Text fontWeight="bold" fontSize="xs">Microstakes</Text>
              </HStack>
              <Text fontSize="2xs" color="gray.600">
                BB &lt; $1.00<br/>
                NL10, NL25, NL50
              </Text>
            </Box>

            <Box p={2} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
              <HStack mb={1}>
                <Text fontSize="sm">💰</Text>
                <Text fontWeight="bold" fontSize="xs">NL100</Text>
              </HStack>
              <Text fontSize="2xs" color="gray.600">
                BB = $1.00<br/>
                $0.50/$1.00
              </Text>
            </Box>

            <Box p={2} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
              <HStack mb={1}>
                <Text fontSize="sm">🎯</Text>
                <Text fontWeight="bold" fontSize="xs">NL200</Text>
              </HStack>
              <Text fontSize="2xs" color="gray.600">
                BB = $2.00<br/>
                $1/$2
              </Text>
            </Box>

            <Box p={2} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
              <HStack mb={1}>
                <Text fontSize="sm">🔥</Text>
                <Text fontWeight="bold" fontSize="xs">NL400</Text>
              </HStack>
              <Text fontSize="2xs" color="gray.600">
                BB = $4.00<br/>
                $2/$4
              </Text>
            </Box>

            <Box p={2} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
              <HStack mb={1}>
                <Text fontSize="sm">💎</Text>
                <Text fontWeight="bold" fontSize="xs">High Stakes</Text>
              </HStack>
              <Text fontSize="2xs" color="gray.600">
                BB &gt; $4.00<br/>
                NL1K, NL2K+
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Formulario */}
        <VStack spacing={4} align="stretch">
          
          {/* Selector de archivo */}
          <FormControl>
            <FormLabel>
              <HStack>
                <Icon as={FaFileAlt} />
                <Text>Archivo CSV</Text>
              </HStack>
            </FormLabel>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              bg={inputBg}
              border="2px dashed"
              borderColor={archivo ? "green.300" : borderColor}
              p={2}
              cursor="pointer"
              _hover={{ borderColor: "blue.300" }}
            />
            <FormHelperText>
              Selecciona un archivo CSV con estadísticas de poker
            </FormHelperText>
            {archivo && (
              <HStack mt={2}>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text fontSize="sm" color="green.500">
                  {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
                </Text>
              </HStack>
            )}
          </FormControl>

          {/* Selector de Stake - NUEVO */}
          <FormControl isRequired>
            <FormLabel>
              <HStack>
                <Icon as={FaChartBar} color="orange.500" />
                <Text>Nivel de Stake</Text>
                <Text color="red.500">*</Text>
              </HStack>
            </FormLabel>
            <Select
              value={stakeSeleccionado}
              onChange={(e) => setStakeSeleccionado(e.target.value)}
              bg={inputBg}
              placeholder="Selecciona el stake del archivo"
              borderColor={stakeSeleccionado ? "green.300" : borderColor}
              _hover={{ borderColor: "blue.300" }}
            >
              <option value="microstakes">Microstakes (NL10, NL25, NL50)</option>
              <option value="nl100">NL100 ($0.50/$1)</option>
              <option value="nl200">NL200 ($1/$2)</option>
              <option value="nl400">NL400 ($2/$4)</option>
              <option value="high-stakes">High Stakes (NL1K+)</option>
            </Select>
            <FormHelperText>
              Este stake se aplicará a TODOS los jugadores del archivo
            </FormHelperText>
          </FormControl>

          {/* Configuración */}
          <HStack spacing={4}>
            <FormControl flex={1}>
              <FormLabel>
                <HStack>
                  <Icon as={FaClock} />
                  <Text>Tipo de Período</Text>
                </HStack>
              </FormLabel>
              <Select
                value={tipoPeriodo}
                onChange={(e) => setTipoPeriodo(e.target.value)}
                bg={inputBg}
              >
                <option value="total">Total (Historial Completo)</option>
                <option value="semana">Semanal (Últimos 7 días)</option>
                <option value="mes">Mensual (Últimos 30 días)</option>
              </Select>
            </FormControl>

            <FormControl flex={1}>
              <FormLabel>
                <HStack>
                  <Icon as={FaCalendarAlt} />
                  <Text>Fecha del Snapshot</Text>
                </HStack>
              </FormLabel>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                bg={inputBg}
              />
            </FormControl>
          </HStack>

          {/* Preview del contenido y validación */}
          {contenidoCSV && (
            <VStack spacing={4} align="stretch">
              {/* Estado de validación */}
              {validacion && (
                <Alert
                  status={validacion.valid ? "success" : "error"}
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box flex={1}>
                    <Text fontWeight="bold">
                      {validacion.valid ? "✅ Archivo válido" : "❌ Error de validación"}
                    </Text>
                    {validacion.valid ? (
                      <HStack mt={1} spacing={4} fontSize="sm">
                        <Badge colorScheme="green">
                          {validacion.info.dataLines} registros
                        </Badge>
                        <Badge colorScheme="blue">
                          {validacion.info.headers} columnas
                        </Badge>
                        {stakeSeleccionado && (
                          <Badge colorScheme="orange">
                            Stake: {stakeSeleccionado.toUpperCase()}
                          </Badge>
                        )}
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="red.600" mt={1}>
                        {validacion.error}
                      </Text>
                    )}
                  </Box>
                </Alert>
              )}

              {/* Preview del archivo */}
              <FormControl>
                <FormLabel>
                  <HStack>
                    <Icon as={FaInfo} />
                    <Text>Preview del Archivo</Text>
                  </HStack>
                </FormLabel>
                <Textarea
                  value={contenidoCSV.split('\n').slice(0, 5).join('\n')}
                  isReadOnly
                  rows={4}
                  bg={inputBg}
                  fontSize="sm"
                  fontFamily="mono"
                  border="1px solid"
                  borderColor={validacion?.valid ? "green.300" : "red.300"}
                />
                <FormHelperText>
                  Mostrando las primeras 5 líneas del archivo CSV
                  {validacion?.info && (
                    <Text as="span" ml={2} color="gray.500">
                      • Total: {validacion.info.totalLines} líneas
                    </Text>
                  )}
                </FormHelperText>
              </FormControl>
            </VStack>
          )}
        </VStack>

        {/* Botones de acción */}
        <HStack spacing={3}>
          <Button
            leftIcon={uploading ? <Spinner size="sm" /> : <FaUpload />}
            colorScheme={validacion?.valid && stakeSeleccionado ? "blue" : "gray"}
            onClick={handleUpload}
            isLoading={uploading}
            loadingText="Procesando..."
            isDisabled={!validacion?.valid || !stakeSeleccionado || uploading}
            flex={1}
            size="lg"
          >
            {!contenidoCSV 
              ? "Selecciona un archivo CSV" 
              : !stakeSeleccionado
                ? "Selecciona un stake"
              : !validacion?.valid 
                ? "Archivo inválido" 
                : `Procesar ${validacion.info?.dataLines || 0} registros como ${stakeSeleccionado.toUpperCase()}`
            }
          </Button>
          
          <Button
            variant="outline"
            onClick={resetForm}
            isDisabled={uploading}
            leftIcon={<Icon as={FaExclamationTriangle} />}
          >
            Limpiar
          </Button>
        </HStack>

        {/* Barra de progreso durante upload */}
        {uploading && (
          <Box>
            <Progress
              size="sm"
              isIndeterminate
              colorScheme="blue"
              borderRadius="md"
            />
            <Text mt={2} fontSize="sm" textAlign="center" color="blue.500">
              Procesando archivo CSV... Esto puede tomar unos momentos
            </Text>
          </Box>
        )}

        {/* Resultado del procesamiento */}
        {resultado && (
          <Alert
            status={resultado.success ? "success" : "error"}
            borderRadius="md"
          >
            <AlertIcon />
            <Box flex={1}>
              <Text fontWeight="bold">
                {resultado.success ? "¡Procesamiento exitoso!" : "Error en el procesamiento"}
              </Text>
              {resultado.estadisticas && (
                <VStack mt={2} spacing={1} align="start">
                  <HStack>
                    <Badge colorScheme="green">Procesados:</Badge>
                    <Text fontSize="sm">{resultado.estadisticas.total_procesados} jugadores</Text>
                  </HStack>
                  {resultado.estadisticas.total_errores > 0 && (
                    <HStack>
                      <Badge colorScheme="orange">Errores:</Badge>
                      <Text fontSize="sm">{resultado.estadisticas.total_errores} registros</Text>
                    </HStack>
                  )}
                  <HStack>
                    <Badge colorScheme="blue">Período:</Badge>
                    <Text fontSize="sm">{resultado.estadisticas.tipo_periodo}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="purple">Fecha:</Badge>
                    <Text fontSize="sm">{resultado.estadisticas.fecha_snapshot}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="orange">Stake:</Badge>
                    <Text fontSize="sm">{resultado.estadisticas.stake_procesado?.toUpperCase()}</Text>
                  </HStack>
                </VStack>
              )}
              {resultado.errores && resultado.errores.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="bold">Errores encontrados:</Text>
                  {resultado.errores.slice(0, 3).map((error, index) => (
                    <Text key={index} fontSize="xs" color="red.600">
                      • {error}
                    </Text>
                  ))}
                  {resultado.errores.length > 3 && (
                    <Text fontSize="xs" color="gray.500">
                      ... y {resultado.errores.length - 3} errores más
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          </Alert>
        )}

        {/* Información adicional */}
        <Box
          p={4}
          bg={useColorModeValue("gray.50", "gray.900")}
          borderRadius="md"
          border="1px solid"
          borderColor={useColorModeValue("gray.200", "gray.700")}
        >
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            📋 Formato esperado del CSV:
          </Text>
          <VStack align="start" spacing={1} fontSize="xs" color="gray.600">
            <Text>• Headers: Site, Player, Hands, BB/100, VPIP, PFR, y más estadísticas</Text>
            <Text>• Columna Site: identifica la sala (XPK, PPP, PM) - detección automática</Text>
            <Text>• Stake: seleccionado manualmente por el admin al subir</Text>
            <Text>• Se procesan en lotes de 1000 jugadores para optimizar rendimiento</Text>
            <Text>• Sistema elimina duplicados automáticamente</Text>
            <Text>• Un archivo puede contener jugadores de múltiples salas</Text>
          </VStack>
        </Box>

      </VStack>
    </Box>
  );
};

export default CSVUploader;
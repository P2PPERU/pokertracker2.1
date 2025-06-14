import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  useColorModeValue,
  Heading,
  Divider,
  Icon,
  Badge,
  Flex,
  Spinner,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Textarea,
  Code,
} from '@chakra-ui/react';
import { 
  FaUpload, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaSpinner, 
  FaFileAlt,
  FaChartBar,
  FaSyncAlt,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import api from '../../../services/api';

const GraficosCSVUpload = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);
  const [csvPreview, setCsvPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Colores
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('blue.50', 'blue.900');

  const toast = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/graficos-csv/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      if (error.response?.status === 404) {
        console.log('Endpoint de estadísticas no encontrado, continuando sin estadísticas');
      }
    }
  };

  const validateCSV = (content) => {
    // Limpiar el contenido primero
    const cleanContent = content.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanContent.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      return { valid: false, error: 'El archivo debe tener al menos un encabezado y una fila de datos' };
    }

    // Verificar headers - sin convertir a minúsculas, solo limpiar espacios
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const requiredHeaders = ['player_name', 'hand_group', 'total_money_won', 'money_won_nosd', 'money_won_sd'];
    
    // Verificar headers de forma case-insensitive
    const headersLower = headers.map(h => h.toLowerCase());
    const missingHeaders = requiredHeaders.filter(h => !headersLower.includes(h.toLowerCase()));
    
    if (missingHeaders.length > 0) {
      return { 
        valid: false, 
        error: `Columnas faltantes: ${missingHeaders.join(', ')}. Se esperan: ${requiredHeaders.join(', ')}. Headers encontrados: ${headers.join(', ')}` 
      };
    }

    // Verificar al menos una fila de datos
    if (lines.length < 2) {
      return { valid: false, error: 'No se encontraron datos en el archivo' };
    }

    // Validar formato de datos en la primera fila
    const firstDataRow = lines[1].split(',').map(col => col.trim());
    if (firstDataRow.length !== headers.length) {
      return { 
        valid: false, 
        error: `La primera fila de datos tiene ${firstDataRow.length} columnas, pero se esperan ${headers.length}` 
      };
    }

    // Verificar que los valores numéricos sean válidos
    const handGroupIndex = headersLower.indexOf('hand_group');
    const moneyIndices = [
      headersLower.indexOf('total_money_won'),
      headersLower.indexOf('money_won_nosd'), 
      headersLower.indexOf('money_won_sd')
    ];

    // Validar algunas filas de datos
    for (let i = 1; i < Math.min(5, lines.length); i++) {
      const row = lines[i].split(',').map(col => col.trim());
      
      // Verificar hand_group es número
      if (handGroupIndex >= 0 && row[handGroupIndex] && isNaN(parseInt(row[handGroupIndex]))) {
        return {
          valid: false,
          error: `Fila ${i + 1}: hand_group debe ser un número, se encontró: "${row[handGroupIndex]}"`
        };
      }
      
      // Verificar que los valores de dinero sean números
      for (const idx of moneyIndices) {
        if (idx >= 0 && row[idx] && isNaN(parseFloat(row[idx]))) {
          return {
            valid: false,
            error: `Fila ${i + 1}: los valores de dinero deben ser números, se encontró: "${row[idx]}"`
          };
        }
      }
    }

    return { 
      valid: true, 
      info: {
        headers: headers.length,
        rows: lines.length - 1,
        headerNames: headers
      }
    };
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Por favor selecciona un archivo CSV válido' });
      setValidationError('El archivo debe ser formato CSV');
      return;
    }

    setFile(selectedFile);
    setMessage({ type: '', text: '' });
    setValidationError(null);

    // Leer y mostrar preview
    try {
      // Leer y limpiar contenido del archivo
      const content = await selectedFile.text();
      // Limpiar saltos de línea de Windows y espacios extra
      const cleanContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      setCsvPreview(cleanContent);
      
      // Validar contenido usando la versión limpia
      const validation = validateCSV(cleanContent);
      if (!validation.valid) {
        setValidationError(validation.error);
        setMessage({ type: 'error', text: validation.error });
      } else {
        setMessage({ 
          type: 'info', 
          text: `Archivo válido: ${validation.info.rows} filas de datos encontradas. Headers: ${validation.info.headerNames.join(', ')}` 
        });
      }
    } catch (error) {
      console.error('Error leyendo archivo:', error);
      setMessage({ type: 'error', text: 'Error al leer el archivo' });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Por favor selecciona un archivo CSV' });
      return;
    }

    // Re-validar con el contenido limpio antes de enviar
    const finalValidation = validateCSV(csvPreview);
    if (!finalValidation.valid) {
      setMessage({ type: 'error', text: 'El archivo no es válido: ' + finalValidation.error });
      return;
    }

    if (validationError) {
      setMessage({ type: 'error', text: 'Por favor corrige los errores de validación antes de continuar' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Leer y limpiar contenido del archivo
      const contenidoCSV = await file.text();
      const contenidoLimpio = contenidoCSV.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      
      console.log('Enviando CSV al servidor:', {
        fileName: file.name,
        size: file.size,
        firstLine: contenidoLimpio.split('\n')[0],
        totalLines: contenidoLimpio.split('\n').length,
        headers: contenidoLimpio.split('\n')[0].split(',').map(h => h.trim())
      });
      
      // Enviar al backend
      const token = localStorage.getItem('token');
      const response = await api.post('/admin/graficos-csv/upload', 
        { contenidoCSV: contenidoLimpio },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      
      if (data.success) {
        setMessage({
          type: 'success',
          text: `✅ CSV procesado exitosamente: ${data.estadisticas.total_procesados} registros procesados`
        });
        setFile(null);
        setCsvPreview('');
        setShowPreview(false);
        // Limpiar input de archivo
        document.getElementById('csv-graficos-input').value = '';
        // Recargar estadísticas
        loadStats();

        toast({
          title: 'CSV procesado exitosamente',
          description: `${data.estadisticas.total_procesados} registros procesados`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        setMessage({
          type: 'error',
          text: `Error: ${data.error || 'Error desconocido'}`
        });
      }
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Response data:', error.response?.data);
      
      let errorMessage = 'Error al procesar el archivo';
      
      if (error.response) {
        // El servidor respondió con un error
        if (error.response.status === 400) {
          errorMessage = error.response.data?.error || 'Formato de archivo inválido';
        } else if (error.response.status === 401) {
          errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
        } else if (error.response.status === 404) {
          errorMessage = 'Endpoint no encontrado. Verifica que el backend esté configurado correctamente.';
        } else {
          errorMessage = error.response.data?.error || `Error del servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="base"
      >
        <VStack spacing={6} align="stretch">
          <HStack mb={2}>
            <Icon as={FaChartBar} color="blue.500" boxSize={6} />
            <Heading size="md">Subir CSV de Gráficos</Heading>
          </HStack>

          {/* Estadísticas actuales */}
          {stats && stats.estadisticas && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
              <Stat
                bg={statBg}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
              >
                <StatLabel>Jugadores con gráficos</StatLabel>
                <StatNumber>{stats.estadisticas.total_jugadores || 0}</StatNumber>
                <StatHelpText>Total</StatHelpText>
              </Stat>

              <Stat
                bg={statBg}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
              >
                <StatLabel>Puntos de datos</StatLabel>
                <StatNumber>{stats.estadisticas.total_puntos_datos || 0}</StatNumber>
                <StatHelpText>Total</StatHelpText>
              </Stat>

              <Stat
                bg={statBg}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
              >
                <StatLabel>Última actualización</StatLabel>
                <StatNumber fontSize="md">
                  {stats.estadisticas.ultima_actualizacion 
                    ? new Date(stats.estadisticas.ultima_actualizacion).toLocaleDateString() 
                    : 'N/A'}
                </StatNumber>
                <StatHelpText>Fecha</StatHelpText>
              </Stat>

              <Stat
                bg={statBg}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
              >
                <StatLabel>Formato</StatLabel>
                <StatNumber fontSize="lg">
                  <Badge colorScheme="orange" p={2} borderRadius="md">
                    CSV
                  </Badge>
                </StatNumber>
                <StatHelpText>Tipo de datos</StatHelpText>
              </Stat>
            </SimpleGrid>
          )}

          <Divider />

          {/* Mensajes */}
          {message.text && (
            <Alert 
              status={message.type === 'success' ? 'success' : message.type === 'error' ? 'error' : 'info'}
              borderRadius="md"
            >
              <AlertIcon />
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Selector de archivo */}
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium">
              Seleccionar archivo CSV de gráficos
            </Text>
            <Input
              id="csv-graficos-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              bg={inputBg}
              border="2px dashed"
              borderColor={file && !validationError ? "green.300" : validationError ? "red.300" : borderColor}
              p={2}
              cursor="pointer"
              _hover={{ borderColor: "blue.300" }}
            />
            {file && (
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FaFileAlt} color={validationError ? "red.500" : "green.500"} />
                  <Text fontSize="sm" color={validationError ? "red.500" : "green.500"}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Text>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPreview(!showPreview)}
                  leftIcon={showPreview ? <FaEyeSlash /> : <FaEye />}
                >
                  {showPreview ? 'Ocultar' : 'Ver'} Preview
                </Button>
              </HStack>
            )}
          </VStack>

          {/* Preview del CSV */}
          {showPreview && csvPreview && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Preview del archivo (primeras 10 líneas):
              </Text>
              <Textarea
                value={csvPreview.split('\n').slice(0, 10).join('\n')}
                isReadOnly
                rows={10}
                fontFamily="mono"
                fontSize="xs"
                bg={inputBg}
                border="1px solid"
                borderColor={validationError ? "red.300" : "green.300"}
              />
              {csvPreview.split('\n').length > 10 && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  ... y {csvPreview.split('\n').length - 10} líneas más
                </Text>
              )}
            </Box>
          )}

          {/* Error de validación */}
          {validationError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Error de validación</Text>
                <Text fontSize="sm">{validationError}</Text>
              </Box>
            </Alert>
          )}

          {/* Botones de acción */}
          <HStack spacing={4}>
            <Button
              onClick={handleUpload}
              isDisabled={!file || loading || validationError}
              isLoading={loading}
              loadingText="Procesando..."
              leftIcon={<FaUpload />}
              colorScheme="blue"
              flex={1}
            >
              Subir y Procesar CSV
            </Button>

            <Button
              onClick={loadStats}
              isDisabled={loading}
              variant="outline"
              leftIcon={<FaSyncAlt />}
            >
              Actualizar Estadísticas
            </Button>

            {(file || validationError) && (
              <Button
                onClick={() => {
                  setFile(null);
                  setCsvPreview('');
                  setShowPreview(false);
                  setValidationError(null);
                  setMessage({ type: '', text: '' });
                  document.getElementById('csv-graficos-input').value = '';
                }}
                variant="ghost"
                colorScheme="red"
                size="sm"
              >
                Limpiar
              </Button>
            )}
          </HStack>

          {/* Instrucciones */}
          <Box
            mt={6}
            p={4}
            bg={useColorModeValue('gray.50', 'gray.900')}
            borderRadius="md"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <Text fontWeight="bold" mb={2}>📋 Formato del CSV:</Text>
            <Text fontSize="sm" color="gray.600" mb={2}>
              El archivo CSV debe tener las siguientes columnas (en cualquier orden):
            </Text>
            <Code
              display="block"
              p={2}
              borderRadius="md"
              fontSize="xs"
              colorScheme="gray"
            >
              player_name,hand_group,total_money_won,money_won_nosd,money_won_sd
            </Code>
            
            <Text fontSize="sm" color="gray.600" mt={3} mb={1}>
              Ejemplo de contenido:
            </Text>
            <Code
              display="block"
              p={2}
              borderRadius="md"
              fontSize="xs"
              colorScheme="gray"
              whiteSpace="pre"
            >
{`player_name,hand_group,total_money_won,money_won_nosd,money_won_sd
JugadorA,0,0.00,0.00,0.00
JugadorA,100,125.50,75.30,50.20
JugadorA,200,250.75,150.45,100.30
JugadorB,0,0.00,0.00,0.00
JugadorB,100,-50.25,-30.15,-20.10`}
            </Code>

            <VStack align="start" mt={3} spacing={1} fontSize="xs" color="gray.600">
              <Text>• <strong>player_name</strong>: Nombre del jugador</Text>
              <Text>• <strong>hand_group</strong>: Grupo de manos (0, 100, 200, etc.)</Text>
              <Text>• <strong>total_money_won</strong>: Ganancia total</Text>
              <Text>• <strong>money_won_nosd</strong>: Ganancia sin showdown</Text>
              <Text>• <strong>money_won_sd</strong>: Ganancia en showdown</Text>
            </VStack>
          </Box>

          {/* Top jugadores */}
          {stats && stats.top_jugadores && stats.top_jugadores.length > 0 && (
            <Box mt={6}>
              <Text fontWeight="bold" mb={2}>🏆 Top 10 Jugadores por Ganancias:</Text>
              <VStack spacing={1} align="stretch">
                {stats.top_jugadores.map((jugador, index) => (
                  <Flex
                    key={index}
                    justify="space-between"
                    p={2}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    <Text>{index + 1}. {jugador.player_name}</Text>
                    <Text color={parseFloat(jugador.ganancia_final) >= 0 ? 'green.500' : 'red.500'}>
                      ${parseFloat(jugador.ganancia_final).toFixed(2)}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default GraficosCSVUpload;
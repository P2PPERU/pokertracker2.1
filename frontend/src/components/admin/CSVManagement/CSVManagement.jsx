import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useColorModeValue,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react';
import {
  FaUpload,
  FaDatabase,
  FaChartLine,
} from 'react-icons/fa';
import CSVUploader from './CSVUploader';
import CSVDashboard from './CSVDashboard';

const CSVManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Colores
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleUploadSuccess = () => {
    // Trigger refresh del dashboard
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box>
      {/* Header de la sección */}
      <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
        <HStack justify="space-between" align="center">
          <HStack>
            <Icon as={FaDatabase} color="blue.500" boxSize={5} />
            <Heading size="md">Gestión de Archivos CSV</Heading>
            <Badge colorScheme="blue" ml={2}>
              Sistema Stats CSV
            </Badge>
          </HStack>
          
          <HStack spacing={2}>
            <Badge colorScheme="green" variant="outline">
              45+ Stats
            </Badge>
            <Badge colorScheme="purple" variant="outline">
              Auto-Procesamiento
            </Badge>
          </HStack>
        </HStack>
        
        <Text 
          mt={2}
          color="gray.500" 
          fontSize="sm"
        >
          Sube y gestiona archivos CSV con estadísticas de poker. Sistema optimizado para PokerTracker 4.
        </Text>
      </Box>

      {/* Tabs de gestión CSV */}
      <Box>
        <Tabs isFitted variant="enclosed">
          <TabList>
            <Tab _selected={{ color: 'white', bg: '#4066ED' }}>
              <HStack>
                <Icon as={FaUpload} />
                <Text>Subir CSV</Text>
              </HStack>
            </Tab>
            <Tab _selected={{ color: 'white', bg: '#4066ED' }}>
              <HStack>
                <Icon as={FaChartLine} />
                <Text>Dashboard</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Panel de subida de CSV */}
            <TabPanel p={6}>
              <VStack spacing={6} align="stretch">
                
                {/* Información del sistema */}
                <Box
                  bg={useColorModeValue("blue.50", "blue.900")}
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={useColorModeValue("blue.200", "blue.700")}
                >
                  <HStack mb={3}>
                    <Icon as={FaDatabase} color="blue.600" />
                    <Text fontWeight="bold">🚀 Sistema CSV Mejorado</Text>
                  </HStack>
                  
                  <VStack align="start" spacing={2} fontSize="sm">
                    <HStack>
                      <Badge colorScheme="green">✓</Badge>
                      <Text>45+ estadísticas por jugador (vs 20 de PT4)</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="green">✓</Badge>
                      <Text>Procesamiento automático en lotes de 1000</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="green">✓</Badge>
                      <Text>Detección inteligente de salas y stakes</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="green">✓</Badge>
                      <Text>Análisis IA mejorado con todos los stats</Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Componente de subida */}
                <CSVUploader onUploadSuccess={handleUploadSuccess} />
                
              </VStack>
            </TabPanel>

            {/* Panel del dashboard */}
            <TabPanel p={6}>
              <CSVDashboard refreshTrigger={refreshTrigger} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default CSVManagement;
import React from 'react';
import {
  SimpleGrid,
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  Spinner,
  Button,
  HStack,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import {
  FaUsers,
  FaGem,
  FaMedal,
  FaRobot,
  FaFileAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaSyncAlt
} from 'react-icons/fa';
import { useAdminMetrics } from '../../../hooks/admin/useAdminMetrics';

// Componente StatBox mejorado con datos reales
const StatBox = ({ label, number, icon, growth, color = "#4066ED", isLoading = false }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  
  if (isLoading) {
    return (
      <Box 
        bg={cardBg} 
        p={4} 
        borderRadius="lg" 
        boxShadow="base"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="md" color={color} />
      </Box>
    );
  }
  
  return (
    <Box 
      bg={cardBg} 
      p={4} 
      borderRadius="lg" 
      boxShadow="base"
      display="flex"
      alignItems="center"
      transition="transform 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
      position="relative"
    >
      <Flex alignItems="center" w="100%">
        <Box 
          p={3}
          bg={useColorModeValue("blue.50", "blue.900")}
          borderRadius="lg"
          mr={4}
        >
          <Icon as={icon} boxSize={6} color={color} />
        </Box>
        
        <Box flex="1">
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          <HStack spacing={2} align="center">
            <Text fontSize="2xl" fontWeight="bold">
              {typeof number === 'number' ? 
                (number >= 1000 ? `${(number/1000).toFixed(1)}k` : number.toLocaleString()) 
                : number
              }
            </Text>
            {growth !== undefined && (
              <Badge 
                colorScheme={growth > 0 ? "green" : growth < 0 ? "red" : "gray"}
                fontSize="xs"
                px={2}
                py={1}
              >
                {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
              </Badge>
            )}
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};

const AdminStats = ({ usuarios = [], archivosManos = [] }) => {
  const { metrics, loading, error, refreshMetrics, calculateMetrics } = useAdminMetrics();

  const handleRefresh = async () => {
    await refreshMetrics();
  };

  const handleCalculateMetrics = async () => {
    const result = await calculateMetrics();
    if (result.success) {
      // Mostrar notificación de éxito si tienes toast
      console.log("✅ Métricas calculadas exitosamente");
    }
  };

  if (error) {
    return (
      <Box bg="red.50" p={4} borderRadius="lg" mb={6}>
        <Text color="red.600">Error: {error}</Text>
        <Button mt={2} size="sm" onClick={handleRefresh}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box mb={6}>
      {/* Header con botones de control */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          📊 Métricas en Tiempo Real
        </Text>
        <HStack spacing={2}>
          <Tooltip label="Refrescar datos">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefresh}
              isLoading={loading}
              leftIcon={<FaSyncAlt />}
            >
              Actualizar
            </Button>
          </Tooltip>
          <Tooltip label="Calcular métricas manualmente">
            <Button 
              size="sm" 
              colorScheme="blue"
              onClick={handleCalculateMetrics}
            >
              Calcular
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      {/* Grid de métricas */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={4}>
        <StatBox 
          label="Total Usuarios" 
          number={metrics.users.total_users} 
          icon={FaUsers}
          growth={metrics.growth.total_users}
          isLoading={loading}
        />
        
        <StatBox 
          label="Usuarios Activos (7d)" 
          number={metrics.users.activeUsers} 
          icon={FaChartLine}
          growth={metrics.growth.active_users_7d}
          color="#10B981"
          isLoading={loading}
        />
        
        <StatBox 
          label="Usuarios Pagados" 
          number={metrics.users.paid_users} 
          icon={FaGem}
          growth={metrics.growth.paid_users}
          color="#F59E0B"
          isLoading={loading}
        />
        
        <StatBox 
          label="MRR (Ingresos)" 
          number={`$${metrics.financial.mrr.toFixed(0)}`} 
          icon={FaMoneyBillWave}
          growth={metrics.growth.mrr}
          color="#10B981"
          isLoading={loading}
        />
        
        <StatBox 
          label="Búsquedas Hoy" 
          number={metrics.usage.player_searches} 
          icon={FaFileAlt}
          growth={metrics.growth.player_searches}
          color="#3B82F6"
          isLoading={loading}
        />
        
        <StatBox 
          label="Análisis IA Hoy" 
          number={metrics.usage.ai_analyses} 
          icon={FaRobot}
          growth={metrics.growth.ai_analyses}
          color="#8B5CF6"
          isLoading={loading}
        />
      </SimpleGrid>

      {/* Métricas adicionales en una segunda fila */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={4}>
        <StatBox 
          label="Nuevos Registros" 
          number={metrics.users.new_registrations} 
          icon={FaUsers}
          color="#06B6D4"
          isLoading={loading}
        />
        
        <StatBox 
          label="Tasa Conversión" 
          number={`${metrics.users.conversionRate.toFixed(1)}%`} 
          icon={FaChartLine}
          growth={metrics.growth.conversion_rate}
          color="#EF4444"
          isLoading={loading}
        />
        
        <StatBox 
          label="ARPU ($/usuario)" 
          number={`$${metrics.financial.arpu.toFixed(2)}`} 
          icon={FaMoneyBillWave}
          color="#F59E0B"
          isLoading={loading}
        />
        
        <StatBox 
          label="Búsquedas/Usuario" 
          number={metrics.usage.avg_searches_per_user.toFixed(1)} 
          icon={FaFileAlt}
          color="#8B5CF6"
          isLoading={loading}
        />
      </SimpleGrid>
    </Box>
  );
};

export default AdminStats;
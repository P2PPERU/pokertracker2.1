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

// Función helper para manejar números de forma segura
const safeToFixed = (value, decimals = 2) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toFixed(decimals);
};

const safeNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Componente StatBox mejorado con datos reales
const StatBox = ({ label, number, icon, growth, color = "#4066ED", isLoading = false }) => {
    // ✅ TODOS LOS HOOKS AL PRINCIPIO - SIEMPRE EN EL MISMO ORDEN
    const cardBg = useColorModeValue("white", "gray.800");
    const blueBg = useColorModeValue("blue.50", "blue.900");
    
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
                    bg={blueBg}  // ✅ USA LA VARIABLE, NO useColorModeValue AQUÍ
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
                        {growth !== undefined && !isNaN(growth) && (
                            <Badge 
                                colorScheme={growth > 0 ? "green" : growth < 0 ? "red" : "gray"}
                                fontSize="xs"
                                px={2}
                                py={1}
                            >
                                {growth > 0 ? "+" : ""}{safeToFixed(growth, 1)}%
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

  // Normalizar métricas para evitar errores
  const safeMetrics = {
    users: {
      total_users: safeNumber(metrics?.users?.total_users || 0),
      activeUsers: safeNumber(metrics?.users?.activeUsers || 0),
      paid_users: safeNumber(metrics?.users?.paid_users || 0),
      new_registrations: safeNumber(metrics?.users?.new_registrations || 0),
      conversionRate: safeNumber(metrics?.users?.conversionRate || 0)
    },
    financial: {
      mrr: safeNumber(metrics?.financial?.mrr || 0),
      arpu: safeNumber(metrics?.financial?.arpu || 0)
    },
    usage: {
      player_searches: safeNumber(metrics?.usage?.player_searches || 0),
      ai_analyses: safeNumber(metrics?.usage?.ai_analyses || 0),
      avg_searches_per_user: safeNumber(metrics?.usage?.avg_searches_per_user || 0)
    },
    growth: {
      total_users: safeNumber(metrics?.growth?.total_users || 0),
      active_users_7d: safeNumber(metrics?.growth?.active_users_7d || 0),
      paid_users: safeNumber(metrics?.growth?.paid_users || 0),
      mrr: safeNumber(metrics?.growth?.mrr || 0),
      player_searches: safeNumber(metrics?.growth?.player_searches || 0),
      ai_analyses: safeNumber(metrics?.growth?.ai_analyses || 0),
      conversion_rate: safeNumber(metrics?.growth?.conversion_rate || 0)
    }
  };

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
          number={safeMetrics.users.total_users} 
          icon={FaUsers}
          growth={safeMetrics.growth.total_users}
          isLoading={loading}
        />
        
        <StatBox 
          label="Usuarios Activos (7d)" 
          number={safeMetrics.users.activeUsers} 
          icon={FaChartLine}
          growth={safeMetrics.growth.active_users_7d}
          color="#10B981"
          isLoading={loading}
        />
        
        <StatBox 
          label="Usuarios Pagados" 
          number={safeMetrics.users.paid_users} 
          icon={FaGem}
          growth={safeMetrics.growth.paid_users}
          color="#F59E0B"
          isLoading={loading}
        />
        
        <StatBox 
          label="MRR (Ingresos)" 
          number={`$${safeToFixed(safeMetrics.financial.mrr, 0)}`} 
          icon={FaMoneyBillWave}
          growth={safeMetrics.growth.mrr}
          color="#10B981"
          isLoading={loading}
        />
        
        <StatBox 
          label="Búsquedas Hoy" 
          number={safeMetrics.usage.player_searches} 
          icon={FaFileAlt}
          growth={safeMetrics.growth.player_searches}
          color="#3B82F6"
          isLoading={loading}
        />
        
        <StatBox 
          label="Análisis IA Hoy" 
          number={safeMetrics.usage.ai_analyses} 
          icon={FaRobot}
          growth={safeMetrics.growth.ai_analyses}
          color="#8B5CF6"
          isLoading={loading}
        />
      </SimpleGrid>

      {/* Métricas adicionales en una segunda fila */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={4}>
        <StatBox 
          label="Nuevos Registros" 
          number={safeMetrics.users.new_registrations} 
          icon={FaUsers}
          color="#06B6D4"
          isLoading={loading}
        />
        
        <StatBox 
          label="Tasa Conversión" 
          number={`${safeToFixed(safeMetrics.users.conversionRate, 1)}%`} 
          icon={FaChartLine}
          growth={safeMetrics.growth.conversion_rate}
          color="#EF4444"
          isLoading={loading}
        />
        
        <StatBox 
          label="ARPU ($/usuario)" 
          number={`$${safeToFixed(safeMetrics.financial.arpu, 2)}`} 
          icon={FaMoneyBillWave}
          color="#F59E0B"
          isLoading={loading}
        />
        
        <StatBox 
          label="Búsquedas/Usuario" 
          number={safeToFixed(safeMetrics.usage.avg_searches_per_user, 1)} 
          icon={FaFileAlt}
          color="#8B5CF6"
          isLoading={loading}
        />
      </SimpleGrid>
    </Box>
  );
};

export default AdminStats;
import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Badge,
  Text
} from '@chakra-ui/react';
import { useAdminMetrics } from '../../../hooks/admin/useAdminMetrics';

// Funciones helper para manejar números de forma segura
const safeToFixed = (value, decimals = 2) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toFixed(decimals);
};

const safeNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const MetricsOverview = () => {
  const { metrics, loading } = useAdminMetrics();
  const cardBg = useColorModeValue("white", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "gray.700");

  // Normalizar métricas para evitar errores
  const safeMetrics = {
    users: {
      total_users: safeNumber(metrics?.users?.total_users || 0),
      activeUsers: safeNumber(metrics?.users?.activeUsers || 0),
      new_registrations: safeNumber(metrics?.users?.new_registrations || 0),
      conversionRate: safeNumber(metrics?.users?.conversionRate || 0)
    },
    financial: {
      mrr: safeNumber(metrics?.financial?.mrr || 0),
      totalRevenue: safeNumber(metrics?.financial?.totalRevenue || (metrics?.financial?.mrr || 0) * 12),
      arpu: safeNumber(metrics?.financial?.arpu || 0)
    },
    usage: {
      ai_analyses: safeNumber(metrics?.usage?.ai_analyses || 0),
      avg_searches_per_user: safeNumber(metrics?.usage?.avg_searches_per_user || 0)
    },
    growth: {
      mrr: safeNumber(metrics?.growth?.mrr || 0),
      active_users_7d: safeNumber(metrics?.growth?.active_users_7d || 0),
      conversion_rate: safeNumber(metrics?.growth?.conversion_rate || 0),
      ai_analyses: safeNumber(metrics?.growth?.ai_analyses || 0)
    }
  };

  return (
    <Box 
      bg={cardBg}
      p={6}
      borderRadius="xl"
      boxShadow="base"
      mb={6}
    >
      <Heading size="md" mb={6} color="blue.600">
        📈 Análisis de Crecimiento
      </Heading>

      {/* Métricas Financieras */}
      <Box mb={6}>
        <Heading size="sm" mb={4} color="gray.600">
          💰 Métricas Financieras
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Stat>
            <StatLabel>MRR (Ingresos Mensuales)</StatLabel>
            <StatNumber>${safeToFixed(safeMetrics.financial.mrr, 2)}</StatNumber>
            <StatHelpText>
              {safeMetrics.growth.mrr !== 0 && (
                <>
                  <StatArrow type={safeMetrics.growth.mrr > 0 ? 'increase' : 'decrease'} />
                  {safeToFixed(Math.abs(safeMetrics.growth.mrr), 1)}%
                </>
              )}
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>ARR (Proyección Anual)</StatLabel>
            <StatNumber>${safeToFixed(safeMetrics.financial.totalRevenue, 0)}</StatNumber>
            <StatHelpText>Basado en MRR actual</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>ARPU (Ingreso por Usuario)</StatLabel>
            <StatNumber>${safeToFixed(safeMetrics.financial.arpu, 2)}</StatNumber>
            <StatHelpText>Promedio mensual</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Tasa de Conversión</StatLabel>
            <StatNumber>{safeToFixed(safeMetrics.users.conversionRate, 1)}%</StatNumber>
            <StatHelpText>
              {safeMetrics.growth.conversion_rate !== 0 && (
                <>
                  <StatArrow type={safeMetrics.growth.conversion_rate > 0 ? 'increase' : 'decrease'} />
                  {safeToFixed(Math.abs(safeMetrics.growth.conversion_rate), 1)}%
                </>
              )}
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Métricas de Usuarios */}
      <Box>
        <Heading size="sm" mb={4} color="gray.600">
          👥 Engagement y Retención
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Stat>
            <StatLabel>Usuarios Activos (7d)</StatLabel>
            <StatNumber>{safeMetrics.users.activeUsers}</StatNumber>
            <StatHelpText>
              {safeMetrics.growth.active_users_7d !== 0 && (
                <>
                  <StatArrow type={safeMetrics.growth.active_users_7d > 0 ? 'increase' : 'decrease'} />
                  {safeToFixed(Math.abs(safeMetrics.growth.active_users_7d), 1)}%
                </>
              )}
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Nuevos Registros</StatLabel>
            <StatNumber>{safeMetrics.users.new_registrations}</StatNumber>
            <StatHelpText>Hoy</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Búsquedas por Usuario</StatLabel>
            <StatNumber>{safeToFixed(safeMetrics.usage.avg_searches_per_user, 1)}</StatNumber>
            <StatHelpText>Promedio diario</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Análisis IA Solicitados</StatLabel>
            <StatNumber>{safeMetrics.usage.ai_analyses}</StatNumber>
            <StatHelpText>
              {safeMetrics.growth.ai_analyses !== 0 && (
                <>
                  <StatArrow type={safeMetrics.growth.ai_analyses > 0 ? 'increase' : 'decrease'} />
                  {safeToFixed(Math.abs(safeMetrics.growth.ai_analyses), 1)}%
                </>
              )}
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Indicadores de salud del negocio */}
      <Box mt={6} p={4} bg={sectionBg} borderRadius="lg">
        <Text fontWeight="bold" mb={2}>🎯 Indicadores Clave:</Text>
        <Flex wrap="wrap" gap={2}>
          <Badge 
            colorScheme={safeMetrics.users.conversionRate > 5 ? "green" : "orange"}
            p={2}
            borderRadius="md"
          >
            Conversión: {safeToFixed(safeMetrics.users.conversionRate, 1)}%
          </Badge>
          
          <Badge 
            colorScheme={safeMetrics.financial.mrr > 1000 ? "green" : "blue"}
            p={2}
            borderRadius="md"
          >
            MRR: ${safeToFixed(safeMetrics.financial.mrr, 0)}
          </Badge>
          
          <Badge 
            colorScheme={safeMetrics.users.activeUsers > safeMetrics.users.total_users * 0.3 ? "green" : "orange"}
            p={2}
            borderRadius="md"
          >
            Engagement: {safeToFixed(
              safeMetrics.users.total_users > 0 
                ? (safeMetrics.users.activeUsers / safeMetrics.users.total_users) * 100 
                : 0, 
              1
            )}%
          </Badge>
        </Flex>
      </Box>
    </Box>
  );
};

export default MetricsOverview;
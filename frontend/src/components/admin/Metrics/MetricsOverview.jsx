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

const MetricsOverview = () => {
  const { metrics, loading } = useAdminMetrics();
  const cardBg = useColorModeValue("white", "gray.800");

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
            <StatNumber>${metrics.financial.mrr.toFixed(2)}</StatNumber>
            <StatHelpText>
              {metrics.growth.mrr !== undefined && (
                <>
                  <StatArrow type={metrics.growth.mrr > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(metrics.growth.mrr).toFixed(1)}%
                </>
              )}
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>ARR (Proyección Anual)</StatLabel>
            <StatNumber>${metrics.financial.totalRevenue.toFixed(0)}</StatNumber>
            <StatHelpText>Basado en MRR actual</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>ARPU (Ingreso por Usuario)</StatLabel>
            <StatNumber>${metrics.financial.arpu.toFixed(2)}</StatNumber>
            <StatHelpText>Promedio mensual</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Tasa de Conversión</StatLabel>
            <StatNumber>{metrics.users.conversionRate.toFixed(1)}%</StatNumber>
            <StatHelpText>
              {metrics.growth.conversion_rate !== undefined && (
                <>
                  <StatArrow type={metrics.growth.conversion_rate > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(metrics.growth.conversion_rate).toFixed(1)}%
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
            <StatNumber>{metrics.users.activeUsers}</StatNumber>
            <StatHelpText>
              {metrics.growth.active_users_7d !== undefined && (
                <>
                  <StatArrow type={metrics.growth.active_users_7d > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(metrics.growth.active_users_7d).toFixed(1)}%
                </>
              )}
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Nuevos Registros</StatLabel>
            <StatNumber>{metrics.users.new_registrations}</StatNumber>
            <StatHelpText>Hoy</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Búsquedas por Usuario</StatLabel>
            <StatNumber>{metrics.usage.avg_searches_per_user.toFixed(1)}</StatNumber>
            <StatHelpText>Promedio diario</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Análisis IA Solicitados</StatLabel>
            <StatNumber>{metrics.usage.ai_analyses}</StatNumber>
            <StatHelpText>
              {metrics.growth.ai_analyses !== undefined && (
                <>
                  <StatArrow type={metrics.growth.ai_analyses > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(metrics.growth.ai_analyses).toFixed(1)}%
                </>
              )}
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Indicadores de salud del negocio */}
      <Box mt={6} p={4} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="lg">
        <Text fontWeight="bold" mb={2}>🎯 Indicadores Clave:</Text>
        <Flex wrap="wrap" gap={2}>
          <Badge 
            colorScheme={metrics.users.conversionRate > 5 ? "green" : "orange"}
            p={2}
            borderRadius="md"
          >
            Conversión: {metrics.users.conversionRate.toFixed(1)}%
          </Badge>
          
          <Badge 
            colorScheme={metrics.financial.mrr > 1000 ? "green" : "blue"}
            p={2}
            borderRadius="md"
          >
            MRR: ${metrics.financial.mrr.toFixed(0)}
          </Badge>
          
          <Badge 
            colorScheme={metrics.users.activeUsers > metrics.users.total_users * 0.3 ? "green" : "orange"}
            p={2}
            borderRadius="md"
          >
            Engagement: {((metrics.users.activeUsers / metrics.users.total_users) * 100 || 0).toFixed(1)}%
          </Badge>
        </Flex>
      </Box>
    </Box>
  );
};

export default MetricsOverview;
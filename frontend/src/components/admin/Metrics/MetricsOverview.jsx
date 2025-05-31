import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import MetricCard from './MetricCard';
import { useAdminMetrics } from '../../../hooks/admin/useAdminMetrics';

const MetricsOverview = ({ usuarios = [] }) => {
  const { metrics } = useAdminMetrics(usuarios);
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
        📊 Métricas de Negocio
      </Heading>

      {/* Métricas Financieras */}
      <Box mb={6}>
        <Heading size="sm" mb={4} color="gray.600">
          💰 Ingresos
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <MetricCard
            title="MRR (Ingresos Mensuales)"
            value={metrics.financial.mrr}
            change={metrics.financial.mrrGrowth}
            format="currency"
            icon="💰"
          />
          <MetricCard
            title="ARR (Ingresos Anuales)"
            value={metrics.financial.totalRevenue}
            change="15.2"
            format="currency"
            icon="📈"
          />
          <MetricCard
            title="ARPU (Ingreso por Usuario)"
            value={metrics.financial.arpu}
            change="8.5"
            format="currency"
            icon="👤"
          />
          <MetricCard
            title="Revenue Oro vs Plata"
            value={((metrics.financial.revenueByPlan.oro / metrics.financial.mrr) * 100) || 0}
            change="5.3"
            format="percentage"
            icon="🏆"
          />
        </SimpleGrid>
      </Box>

      {/* Métricas de Usuarios */}
      <Box>
        <Heading size="sm" mb={4} color="gray.600">
          👥 Usuarios y Retención
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <MetricCard
            title="Tasa de Conversión"
            value={metrics.users.conversionRate}
            change="4.2"
            format="percentage"
            icon="🎯"
          />
          <MetricCard
            title="Tasa de Churn"
            value={metrics.users.churnRate}
            change="-2.1"
            format="percentage"
            icon="📉"
            invertColors={true}
          />
          <MetricCard
            title="Retención"
            value={metrics.users.retentionRate}
            change="2.1"
            format="percentage"
            icon="🔒"
          />
          <MetricCard
            title="Upgrade Rate (Plata→Oro)"
            value={metrics.users.upgradeRate}
            change="7.8"
            format="percentage"
            icon="⬆️"
          />
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default MetricsOverview;
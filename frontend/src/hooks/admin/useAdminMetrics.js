import { useState, useEffect } from 'react';

export const useAdminMetrics = (usuarios = []) => {
  const [metrics, setMetrics] = useState({
    financial: {
      mrr: 0,
      totalRevenue: 0,
      revenueByPlan: { oro: 0, plata: 0 },
      mrrGrowth: 0,
      arpu: 0
    },
    users: {
      churnRate: 0,
      retentionRate: 0,
      conversionRate: 0,
      activeUsers: 0,
      upgradeRate: 0
    }
  });

  useEffect(() => {
    if (usuarios.length > 0) {
      calculateMetrics();
    }
  }, [usuarios]);

  const calculateMetrics = () => {
    // 💰 MÉTRICAS FINANCIERAS
    const oroUsers = usuarios.filter(u => u.suscripcion === 'oro').length;
    const plataUsers = usuarios.filter(u => u.suscripcion === 'plata').length;
    
    // Precios por plan (ajusta según tus precios reales)
    const PRECIOS = {
      oro: 19.99,
      plata: 9.99,
      bronce: 0
    };

    const mrrOro = oroUsers * PRECIOS.oro;
    const mrrPlata = plataUsers * PRECIOS.plata;
    const totalMRR = mrrOro + mrrPlata;
    const totalRevenue = totalMRR * 12; // ARR
    const arpu = usuarios.length > 0 ? totalMRR / usuarios.length : 0;

    // 👥 MÉTRICAS DE USUARIOS
    const totalUsers = usuarios.length;
    const paidUsers = oroUsers + plataUsers;
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;
    const upgradeRate = plataUsers > 0 ? (oroUsers / plataUsers) * 100 : 0;

    // Calcular churn (usuarios con suscripción expirada)
    const now = new Date();
    const expiredUsers = usuarios.filter(u => 
      u.suscripcion_expira && new Date(u.suscripcion_expira) < now
    ).length;
    const churnRate = paidUsers > 0 ? (expiredUsers / paidUsers) * 100 : 0;
    const retentionRate = 100 - churnRate;

    setMetrics({
      financial: {
        mrr: totalMRR,
        totalRevenue: totalRevenue,
        revenueByPlan: { oro: mrrOro, plata: mrrPlata },
        mrrGrowth: 12.5, // Esto lo calcularías con datos históricos
        arpu: arpu
      },
      users: {
        churnRate: churnRate,
        retentionRate: retentionRate,
        conversionRate: conversionRate,
        activeUsers: totalUsers,
        upgradeRate: upgradeRate
      }
    });
  };

  return { metrics };
};
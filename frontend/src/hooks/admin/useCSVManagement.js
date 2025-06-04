// frontend/src/hooks/admin/useCSVManagement.js
import { useState, useCallback } from 'react';
import api from '../../services/api';

export const useCSVManagement = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dashboard, setDashboard] = useState({
    archivos: [],
    resumen: null
  });
  const [error, setError] = useState(null);

  // Obtener token de autenticación
  const getAuthToken = useCallback(() => {
    try {
      // Intentar primero desde el objeto auth
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (auth?.token) return auth.token;
      
      // Fallback al método directo
      return localStorage.getItem('token');
    } catch (error) {
      console.warn('Error obteniendo token:', error);
      return localStorage.getItem('token');
    }
  }, []);

  // Cargar dashboard de archivos CSV
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const { data } = await api.get('/admin/csv-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboard({
        archivos: data.archivos_cargados || [],
        resumen: data.resumen || null
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error cargando dashboard CSV:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al cargar dashboard CSV';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  // Subir archivo CSV - ACTUALIZADO para incluir stake
  const uploadCSV = useCallback(async (csvData) => {
    try {
      setUploading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Validar que venga el stake
      if (!csvData.stake) {
        throw new Error('El stake es obligatorio');
      }

      // Validar que venga el contenido CSV
      if (!csvData.contenidoCSV) {
        throw new Error('El contenido del CSV es obligatorio');
      }

      // Validar que vengan los otros campos obligatorios
      if (!csvData.tipoPeriodo || !csvData.fecha) {
        throw new Error('Tipo de período y fecha son obligatorios');
      }

      const { data } = await api.post('/admin/upload-stats-csv', {
        contenidoCSV: csvData.contenidoCSV,
        tipoPeriodo: csvData.tipoPeriodo,
        fecha: csvData.fecha,
        stake: csvData.stake  // Asegurar que se envíe el stake
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refrescar dashboard después de la subida exitosa
      await fetchDashboard();

      return { success: true, data };
    } catch (error) {
      console.error('Error subiendo CSV:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error procesando archivo CSV';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, [getAuthToken, fetchDashboard]);

  // Obtener información de uploads recientes
  const getUploadStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const { data } = await api.get('/admin/stats-csv-info', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo stats de upload:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al obtener estadísticas';
      return { success: false, error: errorMessage };
    }
  }, [getAuthToken]);

  // Validar archivo CSV antes de subirlo - ACTUALIZADO
  const validateCSV = useCallback((content) => {
    try {
      if (!content || !content.trim()) {
        return { valid: false, error: 'El archivo está vacío' };
      }

      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return { valid: false, error: 'El archivo debe tener al menos headers y una fila de datos' };
      }

      // Validar headers básicos
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      // Headers requeridos - Site es para sala, NO para stake
      const requiredHeaders = ['Site', 'Player', 'Hands', 'BB/100', 'VPIP', 'PFR'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        return { 
          valid: false, 
          error: `Headers faltantes: ${missingHeaders.join(', ')}` 
        };
      }

      // Validar que tenga datos
      const dataLines = lines.slice(1).filter(line => line.trim());
      if (dataLines.length === 0) {
        return { valid: false, error: 'No se encontraron datos en el archivo' };
      }

      // Validar que Site tenga valores válidos en algunas filas
      const sampleLines = dataLines.slice(0, 5); // Revisar primeras 5 líneas
      const validSites = ['XPK', 'PPP', 'PM', 'ClubGG'];
      let hasValidSite = false;

      for (const line of sampleLines) {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const siteIndex = headers.indexOf('Site');
        if (siteIndex >= 0 && values[siteIndex] && validSites.includes(values[siteIndex])) {
          hasValidSite = true;
          break;
        }
      }

      if (!hasValidSite) {
        return { 
          valid: false, 
          error: 'No se encontraron salas válidas (XPK, PPP, PM) en el archivo' 
        };
      }

      return { 
        valid: true, 
        info: {
          totalLines: lines.length,
          dataLines: dataLines.length,
          headers: headers.length,
          hasValidSites: hasValidSite
        }
      };
    } catch (error) {
      console.error('Error validando CSV:', error);
      return { valid: false, error: 'Error validando el archivo CSV' };
    }
  }, []);

  // Validar stake seleccionado
  const validateStake = useCallback((stake) => {
    const validStakes = ['microstakes', 'nl100', 'nl200', 'nl400', 'high-stakes'];
    return validStakes.includes(stake);
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Obtener resumen por stake
  const getStakeSummary = useCallback(() => {
    if (!dashboard.archivos || dashboard.archivos.length === 0) {
      return {};
    }

    const summary = {};
    const stakes = ['microstakes', 'nl100', 'nl200', 'nl400', 'high-stakes'];
    
    stakes.forEach(stake => {
      const archivosStake = dashboard.archivos.filter(a => a.stake_category === stake);
      summary[stake] = {
        totalArchivos: archivosStake.length,
        totalJugadores: archivosStake.reduce((sum, a) => sum + parseInt(a.total_jugadores || 0), 0),
        salas: [...new Set(archivosStake.map(a => a.sala))],
        ultimaFecha: archivosStake.length > 0 ? 
          archivosStake.reduce((latest, a) => {
            const fecha = new Date(a.fecha_snapshot);
            return fecha > latest ? fecha : latest;
          }, new Date(0)).toISOString().split('T')[0] : null
      };
    });

    return summary;
  }, [dashboard.archivos]);

  return {
    // Estados
    loading,
    uploading,
    dashboard,
    error,
    
    // Funciones
    fetchDashboard,
    uploadCSV,
    getUploadStats,
    validateCSV,
    validateStake,
    clearError,
    getStakeSummary,
    
    // Datos computados
    hasData: dashboard.archivos.length > 0,
    totalJugadores: dashboard.resumen?.total_jugadores || 0,
    totalArchivos: dashboard.resumen?.total_snapshots || 0,
    ultimaFecha: dashboard.resumen?.ultima_fecha,
  };
};
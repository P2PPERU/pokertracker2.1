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

  // Subir archivo CSV
  const uploadCSV = useCallback(async (csvData) => {
    try {
      setUploading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const { data } = await api.post('/admin/upload-stats-csv', csvData, {
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

  // Validar archivo CSV antes de subirlo
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

      return { 
        valid: true, 
        info: {
          totalLines: lines.length,
          dataLines: dataLines.length,
          headers: headers.length
        }
      };
    } catch (error) {
      return { valid: false, error: 'Error validando el archivo CSV' };
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
    clearError,
    
    // Datos computados
    hasData: dashboard.archivos.length > 0,
    totalJugadores: dashboard.resumen?.total_jugadores || 0,
    totalArchivos: dashboard.resumen?.total_snapshots || 0,
    ultimaFecha: dashboard.resumen?.ultima_fecha,
  };
};
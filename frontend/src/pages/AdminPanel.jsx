import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Icon,
  Spinner,
  Flex,
  Button,
  Text,
} from '@chakra-ui/react';
import {
  FaUsers,
  FaFileAlt,
  FaDatabase,
} from 'react-icons/fa';

// Importar componentes existentes
import { AdminHeader } from '../components/admin/shared';
import { AdminStats } from '../components/admin/Dashboard';
import { UserManagement } from '../components/admin/UserManagement';
import { HandAnalysis } from '../components/admin/HandAnalysis';

// Importar nuevo componente CSV
import { CSVManagement } from '../components/admin/CSVManagement';

// Importar nuevo componente de métricas
import MetricsOverview from '../components/admin/Metrics/MetricsOverview';

import api from '../services/api';

const AdminPanel = () => {
  // Estados para datos compartidos
  const [usuarios, setUsuarios] = useState([]);
  const [archivosManos, setArchivosManos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colores del tema
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // ✅ CORREGIDO: Obtener token correctamente
        let token;
        try {
          const auth = JSON.parse(localStorage.getItem('auth'));
          token = auth?.token;
        } catch (error) {
          console.warn("Error leyendo auth desde localStorage:", error);
          token = null;
        }
        
        if (!token) {
          setError("No se encontró token de autenticación");
          setLoading(false);
          return;
        }

        // Cargar usuarios y archivos en paralelo
        const [usuariosRes, archivosRes] = await Promise.all([
          api.get("/admin/usuarios", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          api.get("/manos/admin/pendientes", { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);
        
        // Procesar usuarios y verificar suscripciones expiradas
        const usuariosActualizados = await Promise.all(
          usuariosRes.data.map(async (u) => {
            if (
              (u.suscripcion === "oro" || u.suscripcion === "plata") && 
              u.suscripcion_expira && 
              new Date(u.suscripcion_expira) < new Date()
            ) {
              // Auto-downgrade si la suscripción expiró
              try {
                await api.put(
                  `/admin/usuarios/${u.id}/suscripcion`, 
                  { nuevaSuscripcion: "bronce" }, 
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                await api.put(
                  `/admin/usuarios/${u.id}/expiracion`, 
                  { nuevaFecha: null }, 
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                return { ...u, suscripcion: "bronce", suscripcion_expira: null };
              } catch (updateError) {
                console.error("Error actualizando suscripción expirada:", updateError);
                return u;
              }
            }
            return u;
          })
        );
        
        setUsuarios(usuariosActualizados);
        setArchivosManos(archivosRes.data);
        setError(null);
        
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
        setError("Error al cargar datos del panel administrativo");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Función para refrescar datos (puede ser llamada por componentes hijos)
  const refreshData = async () => {
    // ✅ CORREGIDO: Obtener token correctamente
    let token;
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      token = auth?.token;
    } catch (error) {
      console.warn("Error leyendo auth desde localStorage:", error);
      return;
    }
    
    if (!token) return;
    
    try {
      const [usuariosRes, archivosRes] = await Promise.all([
        api.get("/admin/usuarios", { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        api.get("/manos/admin/pendientes", { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);
      
      setUsuarios(usuariosRes.data);
      setArchivosManos(archivosRes.data);
    } catch (error) {
      console.error("Error refrescando datos:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Flex 
        minH="100vh" 
        bg={pageBg} 
        align="center" 
        justify="center"
      >
        <Spinner size="xl" thickness="4px" color="#4066ED" />
      </Flex>
    );
  }

  // Error state
  if (error) {
    return (
      <Box minH="100vh" bg={pageBg} p={4}>
        <Box maxW="1400px" mx="auto">
          <AdminHeader />
          <Box 
            bg="red.50" 
            border="1px solid" 
            borderColor="red.200" 
            borderRadius="lg" 
            p={6} 
            textAlign="center"
          >
            <Text color="red.600" fontSize="lg" fontWeight="bold">
              ⚠️ {error}
            </Text>
            <Button 
              mt={4} 
              colorScheme="red" 
              onClick={() => window.location.reload()}
            >
              Recargar Página
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Box maxW="1400px" mx="auto">
        
        {/* Header del Panel */}
        <AdminHeader />

        {/* Estadísticas Generales */}
        <AdminStats 
          usuarios={usuarios} 
          archivosManos={archivosManos} 
        />
        
        {/* 💰 MÉTRICAS DE NEGOCIO */}
        <MetricsOverview usuarios={usuarios} />

        {/* Tabs de Gestión */}
        <Box 
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="base"
        >
          <Tabs isFitted variant="enclosed">
            <TabList>
              <Tab _selected={{ color: 'white', bg: '#4066ED' }}>
                <Icon as={FaUsers} mr={2} />
                Gestión de Usuarios
              </Tab>
              <Tab _selected={{ color: 'white', bg: '#4066ED' }}>
                <Icon as={FaFileAlt} mr={2} />
                Análisis de Manos
              </Tab>
              <Tab _selected={{ color: 'white', bg: '#4066ED' }}>
                <Icon as={FaDatabase} mr={2} />
                Gestión CSV
              </Tab>
            </TabList>

            <TabPanels>
              {/* Panel de Gestión de Usuarios */}
              <TabPanel p={0}>
                <UserManagement onDataChange={refreshData} />
              </TabPanel>

              {/* Panel de Análisis de Manos */}
              <TabPanel p={0}>
                <HandAnalysis onDataChange={refreshData} />
              </TabPanel>

              {/* Panel de Gestión CSV */}
              <TabPanel p={0}>
                <CSVManagement onDataChange={refreshData} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
        
      </Box>
    </Box>
  );
};

export default AdminPanel;
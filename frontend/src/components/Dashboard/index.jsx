// frontend/src/components/Dashboard/index.jsx

import React from 'react';
import {
  Box,
  Flex,
  VStack,
  Spinner,
  useColorModeValue,
  useDisclosure,
  Icon,
  Text,
} from '@chakra-ui/react';
import { FaSearch } from "react-icons/fa";

// Componentes
import DashboardHeader from './DashboardHeader';
import PlayerSearch from './PlayerSearch';
import PlayerInfo from './PlayerInfo';
import { HUDDisplay, HUDConfigModal, ColorLegend } from './HUD';
import { StatsCopyButton } from './StatsPanel';
import GraficoGanancias from '../GraficoGanancias';
import AnalisisJugador from '../AnalisisJugador';

// Hooks
import { useAuth } from '../../context/AuthContext';
import { usePlayerSearch } from '../../hooks/dashboard/usePlayerSearch';
import { useHUDConfig } from '../../hooks/dashboard/useHUDConfig';
import { useStatsSelection } from '../../hooks/dashboard/useStatsSelection';

// Utils
import { hasAdvancedSubscription } from '../../utils/dashboard/statsHelpers';
import { gradients } from '../../theme/colors';

const Dashboard = () => {
  // Auth
  const { auth } = useAuth();
  
  // Color mode values
  const pageBg = useColorModeValue("#f8fafc", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const mainGradient = gradients.main;

  // Hooks personalizados
  const {
    jugador,
    nombreBuscado,
    sugerencias,
    loading,
    mostrarSugerencias,
    salaSeleccionada,
    tipoPeriodo,
    esFavorito,
    stakesDisponibles,
    stakeSeleccionado,
    loadingStakes,
    sugerenciasRef,
    handleInputChange,
    setNombreBuscado,
    buscarJugador,
    setSalaSeleccionada,
    setTipoPeriodo,
    setMostrarSugerencias,
    cambiarStake,
    toggleFavorito,
  } = usePlayerSearch("LALIGAMANAGER");

  const {
    hudConfig,
    setHudConfig,
    getVisibleOrderedStats,
    updateStatOrder,
  } = useHUDConfig();

  const {
    selectedStats,
    toggleStatSelection,
    copyStats,
    clearSelection,
  } = useStatsSelection(jugador, hudConfig);

  // Modal config
  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure();

  // Validaciones
  if (!auth) return <Spinner />;
  const tieneSuscripcionAvanzada = hasAdvancedSubscription(auth.suscripcion);

  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Box maxW="1400px" mx="auto">
        {/* Header con gradiente */}
        <DashboardHeader />
        
        {/* Búsqueda de jugador dentro del header */}
        <Box 
          bgGradient={mainGradient}
          borderRadius="xl" 
          px={8}
          pb={6}
          mt={-6}
          pt={0}
          boxShadow="lg"
        >
          <PlayerSearch
            nombreBuscado={nombreBuscado}
            handleInputChange={handleInputChange}
            salaSeleccionada={salaSeleccionada}
            setSalaSeleccionada={setSalaSeleccionada}
            tipoPeriodo={tipoPeriodo}
            setTipoPeriodo={setTipoPeriodo}
            buscarJugador={buscarJugador}
            sugerencias={sugerencias}
            mostrarSugerencias={mostrarSugerencias}
            setMostrarSugerencias={setMostrarSugerencias}
            setNombreBuscado={setNombreBuscado}
            sugerenciasRef={sugerenciasRef}
          />
        </Box>

        {/* Loading state */}
        {loading && (
          <Flex justify="center" my={10}>
            <Spinner size="xl" thickness="4px" color="#4066ED" />
          </Flex>
        )}
        
        {/* No data state */}
        {!loading && !jugador && (
          <Box 
            p={8} 
            bg={cardBg} 
            borderRadius="xl" 
            textAlign="center"
            boxShadow="base"
          >
            <VStack spacing={3}>
              <Icon as={FaSearch} boxSize={10} color="gray.400" />
              <Text fontSize="xl" color={textColor}>No se encontraron datos del jugador</Text>
              <Text color={subtextColor}>
                Intenta buscar por nombre o alias
              </Text>
            </VStack>
          </Box>
        )}

        {/* Main content */}
        {jugador && (
          <Box>
            <Flex 
              direction={{ base: "column", md: "row" }} 
              gap={6} 
              mb={6}
            >
              {/* Panel izquierdo - Información y análisis IA */}
              <Box 
                flex={{ base: "1", lg: "3" }} 
                maxW={{ base: "100%", lg: "65%" }}
              >
                <PlayerInfo
                  jugador={jugador}
                  esFavorito={esFavorito}
                  toggleFavorito={toggleFavorito}
                  tipoPeriodo={tipoPeriodo}
                  stakesDisponibles={stakesDisponibles}
                  stakeSeleccionado={stakeSeleccionado}
                  cambiarStake={cambiarStake}
                />
                
                {/* Panel de análisis IA */}
                <Box mt={6}>
                  <AnalisisJugador
                    nombre={jugador.player_name}
                    salaSeleccionada={salaSeleccionada}
                    suscripcionUsuario={auth.suscripcion}
                    tipoPeriodo={tipoPeriodo}
                    fecha={jugador.fecha_snapshot}
                  />
                </Box>
              </Box>
              
              {/* Panel derecho - HUD PROFESIONAL */}
              <Box 
                flex={{ base: "1", lg: "4" }} 
                maxW={{ base: "100%", lg: "70%" }}
              >
                {/* 🎨 NUEVO: Leyenda de colores personalizados */}
                <ColorLegend />
                
                <HUDDisplay
                  jugador={jugador}
                  stakeSeleccionado={stakeSeleccionado}
                  getVisibleOrderedStats={(section) => 
                    getVisibleOrderedStats(section, tieneSuscripcionAvanzada)
                  }
                  toggleStatSelection={toggleStatSelection}
                  selectedStats={selectedStats}
                  onConfigOpen={onConfigOpen}
                  updateStatOrder={updateStatOrder}
                />
                
                {/* Botón de copiar y leyenda */}
                <StatsCopyButton
                  selectedStatsCount={Object.keys(selectedStats).length}
                  copyStats={copyStats}
                />
                
                {/* Gráfico de ganancias */}
                {tieneSuscripcionAvanzada && (
                  <Box 
                    mt={6} 
                    p={6} 
                    bg={cardBg} 
                    borderRadius="xl" 
                    boxShadow="base"
                    position="relative"
                    overflow="hidden"
                  >
                    <Box 
                      position="absolute" 
                      top="-10%" 
                      right="-5%" 
                      w="200px" 
                      h="200px" 
                      bgGradient={mainGradient}
                      opacity="0.05"
                      borderRadius="full"
                      zIndex={0}
                    />
                    
                    <VStack align="start" spacing={4} position="relative" zIndex={1}>
                      <Text fontSize="lg" fontWeight="bold" color={textColor}>
                        Evolución de Ganancias - {jugador.player_name}
                      </Text>
                      
                      <Box minH="400px" w="100%">
                        <GraficoGanancias 
                          nombre={jugador.player_name} 
                          salaSeleccionada={salaSeleccionada}
                          tipoPeriodo={tipoPeriodo}
                        />
                      </Box>
                    </VStack>
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        )}

        {/* Modal de configuración del HUD */}
        <HUDConfigModal
          isOpen={isConfigOpen}
          onClose={onConfigClose}
          hudConfig={hudConfig}
          setHudConfig={setHudConfig}
          tieneSuscripcionAvanzada={tieneSuscripcionAvanzada}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
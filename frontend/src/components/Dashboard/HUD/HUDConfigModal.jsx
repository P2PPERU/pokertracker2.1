// frontend/src/components/Dashboard/HUD/HUDConfigModal.jsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Box,
  Text,
  Alert,
  AlertIcon,
  SimpleGrid,
  Checkbox,
  Badge,
  Icon,
  useToast,
  Link,
  Divider,
} from '@chakra-ui/react';
import { FaCog, FaCopy, FaPalette, FaCrown, FaLock } from 'react-icons/fa';
import { ALL_STATS, DEFAULT_HUD_CONFIG, FREE_STATS_FOR_BRONZE } from '../../../constants/dashboard/hudConstants';
import ColorCustomizationPanel from './ColorCustomizationPanel';
import { Link as RouterLink } from 'react-router-dom';

// Función para validar y limpiar la configuración
const cleanAndValidateConfig = (config) => {
  const cleanConfig = JSON.parse(JSON.stringify(config || DEFAULT_HUD_CONFIG));
  
  // Asegurar que todas las estructuras existan
  if (!cleanConfig.statOrder) cleanConfig.statOrder = {};
  if (!cleanConfig.visibleStats) cleanConfig.visibleStats = {};
  if (!cleanConfig.autoCopyStats) cleanConfig.autoCopyStats = [];
  
  // Verificar y limpiar cada sección
  Object.keys(ALL_STATS).forEach(section => {
    // Limpiar statOrder
    if (!cleanConfig.statOrder[section]) {
      cleanConfig.statOrder[section] = ALL_STATS[section].map(stat => stat.id);
    } else {
      // Eliminar duplicados y stats inválidos
      const validStats = ALL_STATS[section].map(s => s.id);
      const uniqueStats = [...new Set(cleanConfig.statOrder[section])];
      cleanConfig.statOrder[section] = uniqueStats.filter(id => validStats.includes(id));
      
      // Agregar stats faltantes al final
      validStats.forEach(id => {
        if (!cleanConfig.statOrder[section].includes(id)) {
          cleanConfig.statOrder[section].push(id);
        }
      });
    }
    
    // Limpiar visibleStats
    if (!cleanConfig.visibleStats[section]) {
      cleanConfig.visibleStats[section] = [];
    } else {
      const validStats = ALL_STATS[section].map(s => s.id);
      const uniqueStats = [...new Set(cleanConfig.visibleStats[section])];
      cleanConfig.visibleStats[section] = uniqueStats.filter(id => validStats.includes(id));
    }
  });
  
  // Limpiar autoCopyStats
  if (Array.isArray(cleanConfig.autoCopyStats)) {
    const allValidStats = Object.values(ALL_STATS).flatMap(stats => stats.map(s => s.id));
    const uniqueAutoCopy = [...new Set(cleanConfig.autoCopyStats)];
    cleanConfig.autoCopyStats = uniqueAutoCopy.filter(id => allValidStats.includes(id));
  } else {
    cleanConfig.autoCopyStats = [];
  }
  
  return cleanConfig;
};

const HUDConfigModal = ({ isOpen, onClose, hudConfig, setHudConfig, tieneSuscripcionAvanzada }) => {
  const toast = useToast();
  const [localConfig, setLocalConfig] = useState(() => cleanAndValidateConfig(hudConfig));
  
  // Reinicializar configuración local cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const cleanConfig = cleanAndValidateConfig(hudConfig);
      setLocalConfig(cleanConfig);
    }
  }, [isOpen, hudConfig]);
  
  const handleStatVisibilityToggle = (section, statId) => {
    if (!statId || typeof statId !== 'string') {
      console.error('Invalid statId:', statId);
      return;
    }
    
    // Verificar si es una stat gratuita o si el usuario tiene suscripción
    const stat = ALL_STATS[section].find(s => s.id === statId);
    const isFree = FREE_STATS_FOR_BRONZE.includes(statId);
    
    if (!tieneSuscripcionAvanzada && stat?.premium && !isFree) {
      toast({
        title: 'Estadística Premium',
        description: 'Actualiza a VIP Plata u Oro para acceder a esta estadística',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLocalConfig(prev => {
      const newConfig = { ...prev };
      const visibleStats = [...(newConfig.visibleStats[section] || [])];
      const index = visibleStats.indexOf(statId);
      
      if (index > -1) {
        visibleStats.splice(index, 1);
      } else {
        visibleStats.push(statId);
      }
      
      newConfig.visibleStats[section] = visibleStats;
      return newConfig;
    });
  };

  const handleAutoCopyToggle = (statId) => {
    if (!statId || typeof statId !== 'string') {
      console.error('Invalid statId:', statId);
      return;
    }
    
    // Verificar si es una stat gratuita o si el usuario tiene suscripción
    const isFree = FREE_STATS_FOR_BRONZE.includes(statId);
    const isPremium = Object.values(ALL_STATS).some(section => 
      section.some(s => s.id === statId && s.premium)
    );
    
    if (!tieneSuscripcionAvanzada && isPremium && !isFree) {
      toast({
        title: 'Función Premium',
        description: 'Actualiza a VIP para auto-copiar estadísticas premium',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLocalConfig(prev => {
      const newConfig = { ...prev };
      const autoCopyStats = [...(newConfig.autoCopyStats || [])];
      const index = autoCopyStats.indexOf(statId);
      
      if (index > -1) {
        autoCopyStats.splice(index, 1);
      } else {
        autoCopyStats.push(statId);
      }
      
      newConfig.autoCopyStats = autoCopyStats;
      return newConfig;
    });
  };

  const saveConfig = () => {
    try {
      const cleanConfig = cleanAndValidateConfig(localConfig);
      setHudConfig(cleanConfig);
      localStorage.setItem('hudConfig', JSON.stringify(cleanConfig));
      onClose();
      
      toast({
        title: 'Configuración guardada',
        description: 'Tu configuración del HUD ha sido guardada correctamente',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error al guardar',
        description: 'Hubo un problema al guardar la configuración',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const resetConfig = () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      const defaultConfig = cleanAndValidateConfig(DEFAULT_HUD_CONFIG);
      setLocalConfig(defaultConfig);
      
      toast({
        title: 'Configuración restaurada',
        description: 'Se ha restaurado la configuración por defecto',
        status: 'info',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" maxH="90vh">
        <ModalHeader>
          <HStack>
            <Icon as={FaCog} />
            <Text>Configuración del HUD</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody overflowY="auto">
          {/* Alerta para usuarios bronce */}
          {!tieneSuscripcionAvanzada && (
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">
                  <Icon as={FaCrown} mr={1} />
                  Plan Bronce - Acceso Limitado
                </Text>
                <Text fontSize="sm">
                  Solo puedes ver VPIP, PFR y 3BET. Las demás estadísticas requieren suscripción VIP.
                  {' '}
                  <Link as={RouterLink} to="/suscripciones" color="orange.600" fontWeight="bold">
                    Actualizar ahora
                  </Link>
                </Text>
              </Box>
            </Alert>
          )}
          
          <Tabs>
            <TabList>
              <Tab>Visibilidad</Tab>
              <Tab>Auto-Copiar</Tab>
              <Tab>
                <HStack>
                  <Icon as={FaPalette} />
                  <Text>Colores</Text>
                  {!tieneSuscripcionAvanzada && <Icon as={FaLock} color="orange.400" />}
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Panel de Visibilidad */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Alert status="info" fontSize="sm">
                    <AlertIcon />
                    Selecciona qué estadísticas quieres ver en tu HUD
                  </Alert>
                  
                  {Object.entries(ALL_STATS).map(([section, stats]) => (
                    <Box key={section}>
                      <Text fontWeight="bold" mb={2} textTransform="capitalize">
                        {section}
                      </Text>
                      <SimpleGrid columns={3} spacing={2}>
                        {stats.map(stat => {
                          if (!stat || !stat.id) return null;
                          
                          const isVisible = (localConfig.visibleStats[section] || []).includes(stat.id);
                          const isFree = FREE_STATS_FOR_BRONZE.includes(stat.id);
                          const isPremium = stat.premium && !tieneSuscripcionAvanzada && !isFree;
                          
                          return (
                            <Box
                              key={stat.id}
                              opacity={isPremium ? 0.6 : 1}
                              position="relative"
                            >
                              <Checkbox
                                isChecked={isVisible}
                                onChange={() => handleStatVisibilityToggle(section, stat.id)}
                                isDisabled={isPremium}
                              >
                                <HStack spacing={1}>
                                  <Text fontSize="sm">{stat.label}</Text>
                                  {isPremium && (
                                    <Badge colorScheme="orange" fontSize="xs">
                                      <Icon as={FaLock} mr={1} />
                                      VIP
                                    </Badge>
                                  )}
                                  {isFree && !tieneSuscripcionAvanzada && (
                                    <Badge colorScheme="green" fontSize="xs">
                                      FREE
                                    </Badge>
                                  )}
                                </HStack>
                              </Checkbox>
                              {isPremium && (
                                <Box
                                  position="absolute"
                                  top="0"
                                  left="0"
                                  right="0"
                                  bottom="0"
                                  pointerEvents="none"
                                  filter="blur(1px)"
                                />
                              )}
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                      <Divider mt={3} />
                    </Box>
                  ))}
                </VStack>
              </TabPanel>

              {/* Panel de Auto-Copiar */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Alert status="info" fontSize="sm">
                    <AlertIcon />
                    Estas estadísticas se seleccionarán automáticamente para copiar en cada búsqueda
                  </Alert>
                  
                  {Object.entries(ALL_STATS).map(([section, stats]) => (
                    <Box key={section}>
                      <Text fontWeight="bold" mb={2} textTransform="capitalize">
                        {section}
                      </Text>
                      <SimpleGrid columns={3} spacing={2}>
                        {stats.map(stat => {
                          if (!stat || !stat.id) return null;
                          
                          const isAutoCopy = (localConfig.autoCopyStats || []).includes(stat.id);
                          const isFree = FREE_STATS_FOR_BRONZE.includes(stat.id);
                          const isPremium = stat.premium && !tieneSuscripcionAvanzada && !isFree;
                          
                          return (
                            <Box
                              key={stat.id}
                              opacity={isPremium ? 0.6 : 1}
                              position="relative"
                            >
                              <Checkbox
                                isChecked={isAutoCopy}
                                onChange={() => handleAutoCopyToggle(stat.id)}
                                isDisabled={isPremium}
                              >
                                <HStack spacing={1}>
                                  <Icon as={FaCopy} boxSize={3} />
                                  <Text fontSize="sm">{stat.label}</Text>
                                  {isPremium && (
                                    <Badge colorScheme="orange" fontSize="xs">
                                      <Icon as={FaLock} mr={1} />
                                      VIP
                                    </Badge>
                                  )}
                                  {isFree && !tieneSuscripcionAvanzada && (
                                    <Badge colorScheme="green" fontSize="xs">
                                      FREE
                                    </Badge>
                                  )}
                                </HStack>
                              </Checkbox>
                              {isPremium && (
                                <Box
                                  position="absolute"
                                  top="0"
                                  left="0"
                                  right="0"
                                  bottom="0"
                                  pointerEvents="none"
                                  filter="blur(1px)"
                                />
                              )}
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                      <Divider mt={3} />
                    </Box>
                  ))}
                </VStack>
              </TabPanel>

              {/* Panel de Colores */}
              <TabPanel>
                <ColorCustomizationPanel tieneSuscripcionAvanzada={tieneSuscripcionAvanzada} />
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          {/* Nota informativa sobre reordenar */}
          <Alert status="info" mt={4} fontSize="sm">
            <AlertIcon />
            <Text>
              <strong>Tip:</strong> Para reordenar las estadísticas, usa el botón "Editar" en el HUD principal 
              y arrastra las estadísticas a la posición deseada.
            </Text>
          </Alert>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={resetConfig}>
            Restaurar por defecto
          </Button>
          <Button colorScheme="blue" onClick={saveConfig}>
            Guardar configuración
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HUDConfigModal;
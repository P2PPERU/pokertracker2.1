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
} from '@chakra-ui/react';
import { FaCog, FaCopy, FaPalette } from 'react-icons/fa';
import { ALL_STATS, DEFAULT_HUD_CONFIG } from '../../../constants/dashboard/hudConstants';
import ColorCustomizationPanel from './ColorCustomizationPanel';

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
          <Tabs>
            <TabList>
              <Tab>Visibilidad</Tab>
              <Tab>Auto-Copiar</Tab>
              <Tab>
                <HStack>
                  <Icon as={FaPalette} />
                  <Text>Colores</Text>
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
                          const isPremium = stat.premium && !tieneSuscripcionAvanzada;
                          
                          return (
                            <Checkbox
                              key={stat.id}
                              isChecked={isVisible}
                              onChange={() => !isPremium && stat.id && handleStatVisibilityToggle(section, stat.id)}
                              isDisabled={isPremium}
                            >
                              <HStack spacing={1}>
                                <Text fontSize="sm">{stat.label}</Text>
                                {isPremium && (
                                  <Badge colorScheme="purple" fontSize="xs">PRO</Badge>
                                )}
                              </HStack>
                            </Checkbox>
                          );
                        })}
                      </SimpleGrid>
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
                          const isPremium = stat.premium && !tieneSuscripcionAvanzada;
                          
                          return (
                            <Checkbox
                              key={stat.id}
                              isChecked={isAutoCopy}
                              onChange={() => !isPremium && stat.id && handleAutoCopyToggle(stat.id)}
                              isDisabled={isPremium}
                            >
                              <HStack spacing={1}>
                                <Icon as={FaCopy} boxSize={3} />
                                <Text fontSize="sm">{stat.label}</Text>
                                {isPremium && (
                                  <Badge colorScheme="purple" fontSize="xs">PRO</Badge>
                                )}
                              </HStack>
                            </Checkbox>
                          );
                        })}
                      </SimpleGrid>
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
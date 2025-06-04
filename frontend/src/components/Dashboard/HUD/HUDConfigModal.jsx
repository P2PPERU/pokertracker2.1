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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FaCog, FaCopy, FaGripVertical } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ALL_STATS, DEFAULT_HUD_CONFIG } from '../../../constants/dashboard/hudConstants';

// Función para generar IDs únicos para drag and drop
const getDraggableId = (section, statId) => `${section}::${statId}`;
const parseDroppableId = (draggableId) => {
  const [section, statId] = draggableId.split('::');
  return { section, statId };
};

const HUDConfigModal = ({ isOpen, onClose, hudConfig, setHudConfig, tieneSuscripcionAvanzada }) => {
  const [localConfig, setLocalConfig] = useState(() => {
    // Asegurar que la configuración inicial tenga la estructura correcta
    const config = JSON.parse(JSON.stringify(hudConfig || DEFAULT_HUD_CONFIG));
    
    // Verificar que todas las secciones existan en statOrder
    Object.keys(ALL_STATS).forEach(section => {
      if (!config.statOrder) config.statOrder = {};
      if (!config.visibleStats) config.visibleStats = {};
      if (!config.autoCopyStats) config.autoCopyStats = [];
      
      if (!config.statOrder[section]) {
        config.statOrder[section] = ALL_STATS[section].map(stat => stat.id);
      }
      if (!config.visibleStats[section]) {
        config.visibleStats[section] = [];
      }
    });
    
    return config;
  });
  
  // Reinicializar configuración local cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const config = JSON.parse(JSON.stringify(hudConfig || DEFAULT_HUD_CONFIG));
      
      // Verificar que todas las secciones existan
      Object.keys(ALL_STATS).forEach(section => {
        if (!config.statOrder) config.statOrder = {};
        if (!config.visibleStats) config.visibleStats = {};
        if (!config.autoCopyStats) config.autoCopyStats = [];
        
        if (!config.statOrder[section]) {
          config.statOrder[section] = ALL_STATS[section].map(stat => stat.id);
        }
        if (!config.visibleStats[section]) {
          config.visibleStats[section] = [];
        }
      });
      
      setLocalConfig(config);
    }
  }, [isOpen, hudConfig]);
  
  const handleStatVisibilityToggle = (section, statId) => {
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceSection = result.source.droppableId;
    const destSection = result.destination.droppableId;

    // Solo permitir drag & drop dentro de la misma sección
    if (sourceSection !== destSection) return;

    setLocalConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const items = [...(newConfig.statOrder[sourceSection] || [])];
      
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      newConfig.statOrder[sourceSection] = items;
      return newConfig;
    });
  };

  const saveConfig = () => {
    setHudConfig(localConfig);
    localStorage.setItem('hudConfig', JSON.stringify(localConfig));
    onClose();
  };

  const resetConfig = () => {
    const defaultConfig = JSON.parse(JSON.stringify(DEFAULT_HUD_CONFIG));
    setLocalConfig(defaultConfig);
  };

  // Estado para controlar qué sección está expandida (para evitar múltiples DnD contexts activos)
  const [expandedSections, setExpandedSections] = useState([]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FaCog} />
            <Text>Configuración del HUD</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Visibilidad</Tab>
              <Tab>Auto-Copiar</Tab>
              <Tab>Orden</Tab>
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
                          const isVisible = (localConfig.visibleStats[section] || []).includes(stat.id);
                          const isPremium = stat.premium && !tieneSuscripcionAvanzada;
                          
                          return (
                            <Checkbox
                              key={stat.id}
                              isChecked={isVisible}
                              onChange={() => !isPremium && handleStatVisibilityToggle(section, stat.id)}
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
                          const isAutoCopy = (localConfig.autoCopyStats || []).includes(stat.id);
                          const isPremium = stat.premium && !tieneSuscripcionAvanzada;
                          
                          return (
                            <Checkbox
                              key={stat.id}
                              isChecked={isAutoCopy}
                              onChange={() => !isPremium && handleAutoCopyToggle(stat.id)}
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

              {/* Panel de Orden - Con un solo DragDropContext */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Alert status="info" fontSize="sm">
                    <AlertIcon />
                    Arrastra y suelta para reorganizar las estadísticas
                  </Alert>
                  
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Accordion 
                      allowMultiple 
                      onChange={(expandedIndex) => setExpandedSections(expandedIndex)}
                    >
                      {Object.entries(ALL_STATS).map(([section, stats], sectionIndex) => (
                        <AccordionItem key={section}>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left" fontWeight="bold" textTransform="capitalize">
                                {section}
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            {/* Solo renderizar Droppable si la sección está expandida */}
                            {expandedSections.includes(sectionIndex) && (
                              <Droppable droppableId={section}>
                                {(provided, snapshot) => (
                                  <VStack
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    spacing={2}
                                    align="stretch"
                                    bg={snapshot.isDraggingOver ? "blue.50" : "transparent"}
                                    p={2}
                                    borderRadius="md"
                                    transition="background-color 0.2s"
                                    minH="50px"
                                  >
                                    {(localConfig.statOrder[section] || [])
                                      .filter(statId => {
                                        // Solo incluir stats que existen en ALL_STATS
                                        return stats.some(s => s.id === statId);
                                      })
                                      .map((statId, index) => {
                                        const stat = stats.find(s => s.id === statId);
                                        if (!stat) return null;
                                        
                                        const uniqueId = getDraggableId(section, statId);
                                        
                                        return (
                                          <Draggable
                                            key={uniqueId}
                                            draggableId={uniqueId}
                                            index={index}
                                          >
                                            {(provided, snapshot) => (
                                              <HStack
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                p={2}
                                                bg={snapshot.isDragging ? "blue.100" : "gray.50"}
                                                borderRadius="md"
                                                spacing={3}
                                                boxShadow={snapshot.isDragging ? "lg" : "sm"}
                                                transition="all 0.2s"
                                                _hover={{ bg: "gray.100" }}
                                              >
                                                <Icon as={FaGripVertical} color="gray.400" />
                                                <Text fontWeight="medium">{stat.label}</Text>
                                                <Text fontSize="sm" color="gray.600" flex="1" noOfLines={1}>
                                                  {stat.tooltip}
                                                </Text>
                                              </HStack>
                                            )}
                                          </Draggable>
                                        );
                                      })}
                                    {provided.placeholder}
                                  </VStack>
                                )}
                              </Droppable>
                            )}
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </DragDropContext>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
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
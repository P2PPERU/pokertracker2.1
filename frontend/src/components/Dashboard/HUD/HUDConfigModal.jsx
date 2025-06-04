// frontend/src/components/Dashboard/HUD/HUDConfigModal.jsx

import React, { useState } from 'react';
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

const HUDConfigModal = ({ isOpen, onClose, hudConfig, setHudConfig, tieneSuscripcionAvanzada }) => {
  const [localConfig, setLocalConfig] = useState(hudConfig);
  
  const handleStatVisibilityToggle = (section, statId) => {
    setLocalConfig(prev => {
      const newConfig = { ...prev };
      const visibleStats = [...newConfig.visibleStats[section]];
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
      const autoCopyStats = [...newConfig.autoCopyStats];
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

  const handleDragEnd = (result, section) => {
    if (!result.destination) return;

    setLocalConfig(prev => {
      const newConfig = { ...prev };
      const items = Array.from(newConfig.statOrder[section]);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      newConfig.statOrder[section] = items;
      return newConfig;
    });
  };

  const saveConfig = () => {
    setHudConfig(localConfig);
    localStorage.setItem('hudConfig', JSON.stringify(localConfig));
    onClose();
  };

  const resetConfig = () => {
    setLocalConfig(DEFAULT_HUD_CONFIG);
  };

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
                          const isVisible = localConfig.visibleStats[section].includes(stat.id);
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
                          const isAutoCopy = localConfig.autoCopyStats.includes(stat.id);
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

              {/* Panel de Orden */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Alert status="info" fontSize="sm">
                    <AlertIcon />
                    Arrastra y suelta para reorganizar las estadísticas
                  </Alert>
                  
                  <Accordion allowMultiple>
                    {Object.entries(ALL_STATS).map(([section, stats]) => (
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
                          <DragDropContext onDragEnd={(result) => handleDragEnd(result, section)}>
                            <Droppable droppableId={section}>
                              {(provided) => (
                                <VStack
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  spacing={2}
                                  align="stretch"
                                >
                                  {localConfig.statOrder[section].map((statId, index) => {
                                    const stat = stats.find(s => s.id === statId);
                                    if (!stat) return null;
                                    
                                    return (
                                      <Draggable
                                        key={statId}
                                        draggableId={statId}
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
                          </DragDropContext>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
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
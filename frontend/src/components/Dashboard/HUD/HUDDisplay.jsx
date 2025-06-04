// frontend/src/components/Dashboard/HUD/HUDDisplay.jsx

import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  GridItem,
  HStack,
  Text,
  Badge,
  Icon,
  IconButton,
  useColorModeValue,
  Tooltip,
  Button,
} from '@chakra-ui/react';
import {
  FaChartLine,
  FaCog,
  FaHandPaper,
  FaChartPie,
  FaWater,
  FaSyncAlt,
  FaTrophy,
  FaMedal,
  FaGripVertical,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import HUDCell from './HUDCell';
import HUDSection from './HUDSection';
import { formatStatValue, getStakeColor, getStakeLabel } from '../../../utils/dashboard/statsHelpers';
import { statRanges } from '../../../constants/dashboard/hudConstants';

const HUDDisplay = ({
  jugador,
  stakeSeleccionado,
  getVisibleOrderedStats,
  toggleStatSelection,
  selectedStats,
  onConfigOpen,
  updateStatOrder, // Nueva prop del componente padre
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const hudBg = useColorModeValue("gray.100", "gray.900");
  
  // Estado para modo edición
  const [editMode, setEditMode] = useState(false);

  const sections = {
    preflop: { title: "PREFLOP", icon: FaHandPaper },
    postflop: { title: "POSTFLOP", icon: FaChartPie },
    flop: { title: "FLOP", icon: FaWater },
    turn: { title: "TURN", icon: FaSyncAlt },
    river: { title: "RIVER", icon: FaTrophy },
    showdown: { title: "SHOWDOWN ADVANCED", icon: FaMedal }
  };

  // Manejar el drag & drop
  const handleDragEnd = useCallback((result) => {
    if (!result.destination || !editMode) return;

    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;

    // Solo permitir mover dentro de la misma sección
    if (sourceDroppableId !== destinationDroppableId) return;

    const section = sourceDroppableId.replace('hud-', '');
    const visibleStats = getVisibleOrderedStats(section);
    
    // Reordenar
    const newOrder = Array.from(visibleStats.map(s => s.id));
    const [movedStatId] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, movedStatId);

    // Actualizar el orden usando la función del padre
    if (updateStatOrder) {
      updateStatOrder(section, newOrder);
    }
  }, [editMode, getVisibleOrderedStats, updateStatOrder]);

  return (
    <Box 
      p={{ base: 2, md: 3 }}
      bg={cardBg} 
      borderRadius="md" 
      boxShadow="base"
      fontSize="xs"
    >
      {/* Header del HUD con botón de configuración */}
      <HStack mb={2} justify="space-between" px={{ base: 1, md: 2 }}>
        <HStack spacing={2}>
          <Icon as={FaChartLine} color="#4066ED" />
          <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>
            HUD STATISTICS
          </Text>
          <IconButton
            aria-label="Configurar HUD"
            icon={<FaCog />}
            size="xs"
            variant="ghost"
            onClick={onConfigOpen}
            _hover={{ color: "#4066ED" }}
          />
        </HStack>
        <HStack spacing={2}>
          {/* Botón para modo edición */}
          <Tooltip label={editMode ? "Bloquear posiciones" : "Editar posiciones"}>
            <Button
              size="xs"
              variant={editMode ? "solid" : "outline"}
              colorScheme={editMode ? "orange" : "gray"}
              leftIcon={editMode ? <FaUnlock /> : <FaLock />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Editando" : "Editar"}
            </Button>
          </Tooltip>
          
          <Badge colorScheme={getStakeColor(stakeSeleccionado)} size="sm">
            {getStakeLabel(stakeSeleccionado)}
          </Badge>
          <Badge colorScheme="blue" size="sm">
            {jugador.total_manos} hands
          </Badge>
        </HStack>
      </HStack>

      {/* TABLA HUD PROFESIONAL con drag & drop */}
      <Box 
        overflowX="auto" 
        bg={hudBg}
        p={{ base: 1, md: 2 }}
        borderRadius="md"
        border={editMode ? "2px dashed" : "none"}
        borderColor="orange.300"
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Grid 
            templateColumns={{ base: "repeat(6, 1fr)", md: "repeat(8, 1fr)", lg: "repeat(10, 1fr)" }}
            gap={{ base: "2px", md: "3px" }}
            fontSize="2xs"
          >
            {/* Renderizar secciones basadas en la configuración */}
            {Object.entries(sections).map(([section, { title, icon }]) => {
              const visibleStats = getVisibleOrderedStats(section);
              if (visibleStats.length === 0) return null;
              
              return (
                <React.Fragment key={section}>
                  <HUDSection title={title} icon={icon} />
                  {editMode ? (
                    // Modo edición con drag & drop
                    <Droppable droppableId={`hud-${section}`} direction="horizontal">
                      {(provided, snapshot) => (
                        <GridItem
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          colSpan={visibleStats.length}
                          display="flex"
                          gap={{ base: "2px", md: "3px" }}
                          bg={snapshot.isDraggingOver ? "orange.50" : "transparent"}
                          borderRadius="sm"
                          p={snapshot.isDraggingOver ? 1 : 0}
                          transition="all 0.2s"
                        >
                          {visibleStats.map((stat, index) => {
                            const value = jugador[stat.dbField];
                            const displayValue = formatStatValue(value);
                            
                            return (
                              <Draggable
                                key={stat.id}
                                draggableId={`${section}-${stat.id}`}
                                index={index}
                                isDragDisabled={!editMode}
                              >
                                {(provided, snapshot) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    position="relative"
                                    flex="1"
                                    opacity={snapshot.isDragging ? 0.5 : 1}
                                  >
                                    {/* Indicador de drag en modo edición */}
                                    {editMode && (
                                      <Box
                                        position="absolute"
                                        top="-8px"
                                        left="50%"
                                        transform="translateX(-50%)"
                                        zIndex={10}
                                      >
                                        <Icon 
                                          as={FaGripVertical} 
                                          color="orange.500" 
                                          boxSize={3}
                                          cursor="grab"
                                        />
                                      </Box>
                                    )}
                                    
                                    <HUDCell
                                      stat={stat.id}
                                      label={stat.label}
                                      value={displayValue}
                                      onClick={!editMode ? toggleStatSelection : undefined}
                                      isSelected={selectedStats[stat.id] !== undefined}
                                      colorRanges={statRanges[stat.id]}
                                      tooltip={stat.tooltip}
                                    />
                                  </Box>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </GridItem>
                      )}
                    </Droppable>
                  ) : (
                    // Modo normal sin drag & drop
                    <>
                      {visibleStats.map(stat => {
                        const value = jugador[stat.dbField];
                        const displayValue = formatStatValue(value);
                        
                        return (
                          <HUDCell
                            key={stat.id}
                            stat={stat.id}
                            label={stat.label}
                            value={displayValue}
                            onClick={toggleStatSelection}
                            isSelected={selectedStats[stat.id] !== undefined}
                            colorRanges={statRanges[stat.id]}
                            tooltip={stat.tooltip}
                          />
                        );
                      })}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </Grid>
        </DragDropContext>
      </Box>

      {/* Mensaje de ayuda en modo edición */}
      {editMode && (
        <Box 
          mt={2} 
          p={2} 
          bg="orange.50" 
          borderRadius="md" 
          fontSize="xs" 
          textAlign="center"
        >
          <Text color="orange.700">
            🎯 Arrastra las estadísticas para reorganizarlas
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default HUDDisplay;
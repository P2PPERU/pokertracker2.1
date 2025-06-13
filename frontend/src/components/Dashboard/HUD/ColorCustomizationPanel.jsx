// frontend/src/components/Dashboard/HUD/ColorCustomizationPanel.jsx

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  Checkbox,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  useColorModeValue,
  Tooltip,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Collapse,
  useToast,
} from '@chakra-ui/react';
import {
  FaPalette,
  FaGlobe,
  FaStar,
  FaDownload,
  FaUpload,
  FaTrash,
  FaSync,
  FaCheckCircle,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { ALL_STATS } from '../../../constants/dashboard/hudConstants';
import { useCustomColors, PRESET_COLORS } from '../../../hooks/dashboard/useCustomColors';
import ColorTips from './ColorTips';

const ColorCustomizationPanel = ({ tieneSuscripcionAvanzada }) => {
  const [selectedColorName, setSelectedColorName] = useState(PRESET_COLORS[0].name);
  const [showTips, setShowTips] = useState(false);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const toast = useToast();

  const {
    hasCustomColor,
    getCustomColor,
    getColorForDisplay,
    toggleCustomStat,
    setStatColor,
    setGlobalColor,
    toggleGlobalColor,
    applyColorToAllCustom,
    clearAllCustomizations,
    resetConfig,
    exportConfig,
    importConfig,
    customStats,
    useGlobalColor,
    globalCustomColor,
  } = useCustomColors();

  // Modal para import/export
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure();
  const [importText, setImportText] = useState('');

  // Función para aplicar color seleccionado a un stat
  const applyColorToStat = (statId) => {
    if (!statId || typeof statId !== 'string') {
      toast({
        title: 'Error',
        description: 'ID de estadística inválido',
        status: 'error',
        duration: 2000,
      });
      return;
    }
    
    if (!hasCustomColor(statId)) {
      toggleCustomStat(statId);
    }
    setStatColor(statId, selectedColorName);
    
    toast({
      title: 'Color aplicado',
      description: `Color ${selectedColorName} aplicado a la estadística`,
      status: 'success',
      duration: 2000,
    });
  };

  // Función para aplicar color a todos los stats seleccionados
  const applyToAllSelected = () => {
    if (customStats.length === 0) {
      toast({
        title: 'Sin estadísticas',
        description: 'No hay estadísticas seleccionadas',
        status: 'warning',
        duration: 2000,
      });
      return;
    }
    
    applyColorToAllCustom(selectedColorName);
    toast({
      title: 'Color aplicado',
      description: `Color ${selectedColorName} aplicado a todas las estadísticas`,
      status: 'success',
      duration: 2000,
    });
  };

  // Función para aplicar color global
  const applyGlobalColor = () => {
    setGlobalColor(selectedColorName);
    toast({
      title: 'Color global establecido',
      description: `${selectedColorName} establecido como color global`,
      status: 'success',
      duration: 2000,
    });
  };

  // Manejar importación
  const handleImport = () => {
    if (!importText.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor pega una configuración válida',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    const result = importConfig(importText);
    if (result.success) {
      setImportText('');
      onImportClose();
      toast({
        title: 'Configuración importada',
        description: 'La configuración se importó correctamente',
        status: 'success',
        duration: 3000,
      });
    } else {
      toast({
        title: 'Error al importar',
        description: result.error || 'Configuración inválida',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Limpiar todas las personalizaciones con confirmación
  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todas las personalizaciones?')) {
      clearAllCustomizations();
      toast({
        title: 'Personalizaciones limpiadas',
        description: 'Todas las personalizaciones han sido eliminadas',
        status: 'info',
        duration: 3000,
      });
    }
  };

  // Obtener el color actual seleccionado para mostrar
  const getCurrentSelectedColor = () => {
    return getColorForDisplay(selectedColorName);
  };

  if (!tieneSuscripcionAvanzada) {
    return (
      <Box p={6} textAlign="center">
        <Icon as={FaPalette} boxSize={12} color="gray.400" mb={4} />
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Personalización de Colores
        </Text>
        <Text color="gray.500" mb={4}>
          Esta funcionalidad está disponible para usuarios Premium
        </Text>
        <Badge colorScheme="purple" p={2} borderRadius="md">
          Requiere Suscripción Plata u Oro
        </Badge>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      
      {/* Header */}
      <HStack justify="space-between">
        <HStack>
          <Icon as={FaPalette} color="purple.500" />
          <Text fontSize="lg" fontWeight="bold">
            Personalización de Colores
          </Text>
        </HStack>
        
        <ButtonGroup size="sm" variant="outline">
          <Button 
            leftIcon={<FaQuestionCircle />} 
            onClick={() => setShowTips(!showTips)}
            colorScheme={showTips ? "blue" : "gray"}
          >
            {showTips ? "Ocultar" : "Tips"}
          </Button>
          <Button leftIcon={<FaDownload />} onClick={onExportOpen}>
            Exportar
          </Button>
          <Button leftIcon={<FaUpload />} onClick={onImportOpen}>
            Importar
          </Button>
          <Button leftIcon={<FaTrash />} colorScheme="red" onClick={handleClearAll}>
            Limpiar
          </Button>
        </ButtonGroup>
      </HStack>

      {/* Tips colapsables */}
      <Collapse in={showTips} animateOpacity>
        <ColorTips />
      </Collapse>

      <Alert status="info" fontSize="sm">
        <AlertIcon />
        Marca tus estadísticas importantes y personaliza sus colores para identificarlas rápidamente
      </Alert>

      {/* Selector de Color */}
      <Box p={4} bg={sectionBg} borderRadius="md">
        <Text fontWeight="bold" mb={3}>
          🎨 Seleccionar Color
        </Text>
        <SimpleGrid columns={6} spacing={2}>
          {PRESET_COLORS.map((color) => (
            <Tooltip key={color.name} label={color.name}>
              <Button
                size="sm"
                bg={getColorForDisplay(color.name)}
                color="white"
                onClick={() => setSelectedColorName(color.name)}
                border={selectedColorName === color.name ? "3px solid" : "1px solid"}
                borderColor={selectedColorName === color.name ? useColorModeValue("gray.800", "white") : "transparent"}
                _hover={{ transform: "scale(1.1)" }}
                minW="40px"
                h="40px"
              >
                {selectedColorName === color.name && <Icon as={FaCheckCircle} />}
              </Button>
            </Tooltip>
          ))}
        </SimpleGrid>
        
        <HStack mt={3} spacing={2}>
          <Text fontSize="sm">Color seleccionado:</Text>
          <Badge bg={getCurrentSelectedColor()} color="white" px={2} py={1}>
            {selectedColorName}
          </Badge>
        </HStack>
      </Box>

      {/* Opciones Globales */}
      <Box p={4} bg={sectionBg} borderRadius="md">
        <Text fontWeight="bold" mb={3}>
          🌐 Opciones Globales
        </Text>
        
        <VStack align="stretch" spacing={3}>
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0" flex="1">
              Usar color global para todos los stats marcados
            </FormLabel>
            <Switch
              isChecked={useGlobalColor}
              onChange={toggleGlobalColor}
              colorScheme="purple"
            />
          </FormControl>
          
          <HStack spacing={2}>
            <Button
              size="sm"
              leftIcon={<FaGlobe />}
              onClick={applyGlobalColor}
              colorScheme="purple"
              variant="outline"
            >
              Establecer Color Global
            </Button>
            
            {customStats.length > 0 && (
              <Button
                size="sm"
                leftIcon={<FaStar />}
                onClick={applyToAllSelected}
                colorScheme="blue"
                variant="outline"
              >
                Aplicar a Todos ({customStats.length})
              </Button>
            )}
          </HStack>
          
          {globalCustomColor && (
            <HStack>
              <Text fontSize="sm">Color global actual:</Text>
              <Badge bg={globalCustomColor} color="white" px={2} py={1}>
                Global
              </Badge>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Lista de Estadísticas */}
      <Box>
        <Text fontWeight="bold" mb={3}>
          📊 Seleccionar Estadísticas Importantes
        </Text>
        
        {Object.entries(ALL_STATS).map(([section, stats]) => (
          <Box key={section} mb={4}>
            <Text
              fontWeight="semibold"
              mb={2}
              textTransform="capitalize"
              color="purple.600"
            >
              {section}
            </Text>
            
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
              {stats.map((stat) => {
                if (!stat || !stat.id) return null;
                
                const isCustom = hasCustomColor(stat.id);
                const customColor = getCustomColor(stat.id);
                const isPremium = stat.premium && !tieneSuscripcionAvanzada;
                
                return (
                  <Box
                    key={stat.id}
                    p={2}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={isCustom ? "purple.300" : borderColor}
                    borderRadius="md"
                    position="relative"
                  >
                    <VStack spacing={1}>
                      <Checkbox
                        isChecked={isCustom}
                        onChange={() => !isPremium && stat.id && toggleCustomStat(stat.id)}
                        isDisabled={isPremium}
                        colorScheme="purple"
                      >
                        <Text fontSize="sm" fontWeight="medium">
                          {stat.label}
                        </Text>
                      </Checkbox>
                      
                      {isCustom && stat.id && (
                        <HStack spacing={1}>
                          <Button
                            size="xs"
                            onClick={() => applyColorToStat(stat.id)}
                            colorScheme="purple"
                            variant="outline"
                          >
                            Aplicar Color
                          </Button>
                          
                          {customColor && (
                            <Badge bg={customColor} color="white" fontSize="xs">
                              ●
                            </Badge>
                          )}
                        </HStack>
                      )}
                      
                      {isPremium && (
                        <Badge colorScheme="purple" fontSize="xs">PRO</Badge>
                      )}
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>
        ))}
      </Box>

      {/* Resumen */}
      {customStats.length > 0 && (
        <Box p={4} bg={sectionBg} borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            ✨ Resumen de Personalización
          </Text>
          <Text fontSize="sm" color="gray.600">
            Tienes {customStats.length} estadística{customStats.length !== 1 ? 's' : ''} personalizada{customStats.length !== 1 ? 's' : ''}
          </Text>
          {useGlobalColor && (
            <Text fontSize="sm" color="purple.600">
              • Usando color global para todas las estadísticas marcadas
            </Text>
          )}
        </Box>
      )}

      {/* Modal de Exportación */}
      <Modal isOpen={isExportOpen} onClose={onExportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exportar Configuración</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={3}>Copia esta configuración para respaldarla:</Text>
            <Textarea
              value={exportConfig()}
              isReadOnly
              rows={10}
              fontSize="sm"
              fontFamily="mono"
              onClick={(e) => e.target.select()}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onExportClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Importación */}
      <Modal isOpen={isImportOpen} onClose={onImportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Importar Configuración</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={3}>Pega la configuración a importar:</Text>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Pega aquí la configuración JSON..."
              rows={10}
              fontSize="sm"
              fontFamily="mono"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onImportClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleImport}
              isDisabled={!importText.trim()}
            >
              Importar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ColorCustomizationPanel;
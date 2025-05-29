// components/StatBox.jsx
import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { FaExclamationTriangle } from "react-icons/fa";
import { useStatColor } from '../hooks/useStatColor';
import { brand } from '../theme/colors';

const StatBox = React.memo(({ 
  icon: Icon, 
  title, 
  value, 
  isSelected, 
  onClick,
  color,  // color personalizado para el borde cuando está seleccionado
  warning = false,  // para mostrar indicador de warning
  isSpecial = false  // para casos especiales como valores muy buenos
}) => {
  const defaultBorderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const iconDefaultColor = useColorModeValue("gray.500", "gray.200");
  const textColor = useColorModeValue("gray.600", "gray.300");
  
  // Usar el color del tema por defecto
  const selectedColor = color || brand.primary;
  
  // Usar el hook para obtener el color correcto basado en umbrales
  const { color: statColor } = useStatColor(title, value);

  const excludedStats = ["Manos Jugadas", "Ganancias USD", "WINRATE"];
  const isExcluded = excludedStats.includes(title);

  // Para estadísticas monetarias, usar lógica simple
  const getMoneyColor = (val) => {
    const num = parseFloat(val);
    if (num > 0) return "green.500";
    if (num < 0) return "red.500";
    return textColor;
  };

  // Determinar el color del valor
  let valueColor = textColor;
  if (title === "WINRATE" || title === "Ganancias USD") {
    valueColor = getMoneyColor(value);
  } else if (statColor) {
    valueColor = statColor;
  }

  let numericValue = value;
  if (!isExcluded) {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      numericValue = Math.round(parsedValue);
    } else {
      numericValue = value.includes("%") || value.includes("$") ? value : "—";
    }
  }

  return (
    <Box
      p={3}
      border="1px solid"
      borderColor={isSelected ? selectedColor : defaultBorderColor}
      borderRadius="lg"
      bg={bgColor}
      boxShadow={isSelected ? `0 0 0 2px ${selectedColor}` : "md"}
      textAlign="center"
      cursor={!isExcluded ? "pointer" : "default"}
      onClick={!isExcluded ? onClick : undefined}
      transition="all 0.2s"
      _hover={!isExcluded ? { 
        transform: "translateY(-4px)", 
        boxShadow: "lg",
        borderColor: selectedColor
      } : {}}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      position="relative"
      overflow="hidden"
    >
      {/* Barra superior cuando está seleccionado */}
      {isSelected && (
        <Box 
          position="absolute" 
          top={0} 
          left={0}
          width="100%" 
          height="5px" 
          bg={selectedColor} 
        />
      )}
      
      {Icon && (
        <Box color={isSelected ? selectedColor : iconDefaultColor} mb={2}>
          <Icon size="20px" />
        </Box>
      )}
      
      <Text 
        fontWeight="bold" 
        fontSize="xs" 
        color={textColor}
        mb={1}
      >
        {title.toUpperCase()}
      </Text>
      
      <Text 
        fontSize="lg" 
        fontWeight="semibold" 
        color={valueColor}
      >
        {numericValue}
      </Text>
      
      {/* Indicador de warning */}
      {warning && (
        <Box 
          position="absolute" 
          bottom={1} 
          right={1} 
          color="orange.500"
          fontSize="10px"
        >
          <FaExclamationTriangle />
        </Box>
      )}
    </Box>
  );
});

export default StatBox;
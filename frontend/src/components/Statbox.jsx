// components/StatBox.jsx
import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

const StatBox = React.memo(({ icon: Icon, title, value, isSelected, onClick }) => {
  const defaultBorderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const iconDefaultColor = useColorModeValue("gray.500", "gray.200");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const excludedStats = ["Manos Jugadas", "Ganancias USD", "WINRATE"];

  // Obtener el color del texto según el título y valor
  const getValueColor = (title, value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return textColor;

    switch (title) {
      case "VPIP":
        if (num <= 19) return "yellow.400";
        if (num >= 27) return "red.400";
        break;
      case "PFR":
        if (num <= 16) return "yellow.400";
        if (num >= 21) return "red.400";
        break;
      case "3 BET":
        if (num <= 6) return "yellow.400";
        if (num >= 7 && num <= 9) return "white";
        if (num >= 10) return "red.400";
        break;
      case "Limp %":
        if (num > 5) return "yellow.400";
        break;
      case "Bet River %":
        if (num <= 30) return "yellow.400";
        if (num >= 31 && num <= 39) return "white";
        if (num >= 40) return "red.400";
        break;
      case "WSDwBR %":
        if (num <= 60) return "yellow.400";
        if (num > 60) return "red.400";
        break;
      case "Overbet River %":
        if (num <= 10) return "red.400";
        if (num > 10) return "yellow.400";
        break;
      default:
        return textColor;
    }

    return textColor;
  };

  let numericValue = value;
  if (!excludedStats.includes(title)) {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      numericValue = Math.round(parsedValue);
    } else {
      numericValue = value.includes("%") || value.includes("$") ? value : "—";
    }
  }

  const valueColor = getValueColor(title, numericValue);

  return (
    <Box
      p={2}
      border="1px solid"
      borderColor={isSelected ? "blue.400" : defaultBorderColor}
      borderRadius="md"
      bg={bgColor}
      boxShadow={isSelected ? "0 0 0 2px rgba(66,153,225,0.6)" : "md"}
      textAlign="center"
      cursor={!excludedStats.includes(title) ? "pointer" : "default"}
      onClick={!excludedStats.includes(title) ? onClick : undefined}
      transition="all 0.2s"
      _hover={!excludedStats.includes(title) ? { transform: "translateY(-2px)", boxShadow: "lg" } : {}}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="90px"
      minW="110px"
      flex="none"
    >
      {Icon && (
        <Box color={isSelected ? "blue.400" : iconDefaultColor} mb={1}>
          <Icon size="20px" />
        </Box>
      )}
      <Text fontWeight="bold" fontSize="xs" color={textColor}>
        {title.toUpperCase()}
      </Text>
      <Text fontSize="lg" fontWeight="semibold" color={valueColor}>
        {numericValue}
      </Text>
    </Box>
  );
});

export default StatBox;

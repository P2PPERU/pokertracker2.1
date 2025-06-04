// frontend/src/components/Dashboard/PlayerInfo/PlayerInfoCard.jsx

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Icon,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaStar, FaLayerGroup, FaChartLine, FaCalendarAlt, FaDatabase } from "react-icons/fa";
import { gradients } from '../../../theme/colors';
import { getStakeColor, getStakeLabel, getMoneyColor } from '../../../utils/dashboard/statsHelpers';

const PlayerInfoCard = ({ jugador, esFavorito, toggleFavorito, tipoPeriodo }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const mainGradient = gradients.main;
  
  return (
    <Box 
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
      
      <HStack mb={4} position="relative" zIndex={1}>
        <Heading size="lg" color={textColor}>
          Información del Jugador
        </Heading>
        <HStack>
          {jugador.stake_category && (
            <Badge 
              colorScheme={getStakeColor(jugador.stake_category)} 
              variant="solid"
            >
              <Icon as={FaLayerGroup} mr={1} />
              {getStakeLabel(jugador.stake_category)}
            </Badge>
          )}
          {tipoPeriodo !== 'total' && (
            <Badge colorScheme="purple" variant="subtle">
              <Icon as={FaChartLine} mr={1} />
              {tipoPeriodo === 'semana' ? 'Semanal' : 'Mensual'}
            </Badge>
          )}
        </HStack>
      </HStack>
      
      <Flex 
        mb={4} 
        direction={{ base: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", sm: "center" }}
        wrap="wrap"
        gap={3}
        position="relative"
        zIndex={1}
      >
        <HStack spacing={3}>
          <VStack align="flex-start" spacing={1}>
            <Text color={subtextColor} fontSize="sm">Nickname</Text>
            <HStack>
              <Badge 
                bg="#4066ED"
                color="white" 
                fontSize="2xl" 
                p={2} 
                borderRadius="md"
              >
                {jugador.player_name}
              </Badge>
              
              <IconButton
                aria-label={esFavorito ? "Eliminar de favoritos" : "Agregar a favoritos"}
                icon={<Icon as={FaStar} color={esFavorito ? "yellow.400" : "gray.400"} />}
                onClick={toggleFavorito}
                variant="ghost"
                size="md"
                _hover={{ transform: "scale(1.1)" }}
                transition="all 0.2s"
              />
            </HStack>
          </VStack>
        </HStack>
        
        <HStack spacing={6} wrap="wrap">
          <VStack align="flex-start" spacing={0}>
            <Text color={subtextColor} fontSize="sm">Manos jugadas</Text>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              {jugador.total_manos}
            </Text>
          </VStack>
          
          <VStack align="flex-start" spacing={0}>
            <Text color={subtextColor} fontSize="sm">Winrate</Text>
            <Text 
              fontSize="xl" 
              fontWeight="bold" 
              color={getMoneyColor(jugador.bb_100)}
            >
              {jugador.bb_100} BB/100
            </Text>
          </VStack>
          
          <VStack align="flex-start" spacing={0}>
            <Text color={subtextColor} fontSize="sm">Ganancias</Text>
            <Text 
              fontSize="xl" 
              fontWeight="bold"
              color={getMoneyColor(jugador.win_usd)}
            >
              ${jugador.win_usd}
            </Text>
          </VStack>
        </HStack>
      </Flex>

      {/* Información adicional del snapshot */}
      {jugador.fecha_snapshot && (
        <Box 
          p={3} 
          bg={useColorModeValue("gray.50", "gray.700")}
          borderRadius="md" 
          position="relative"
          zIndex={1}
        >
          <HStack spacing={4} fontSize="sm" wrap="wrap">
            <HStack>
              <Icon as={FaCalendarAlt} color="gray.500" />
              <Text color={subtextColor}>
                <strong>Fecha datos:</strong> {new Date(jugador.fecha_snapshot).toLocaleDateString()}
              </Text>
            </HStack>
            <HStack>
              <Icon as={FaDatabase} color="gray.500" />
              <Text color={subtextColor}>
                <strong>Fuente:</strong> {jugador.data_source || 'CSV'}
              </Text>
            </HStack>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default PlayerInfoCard;
// frontend/src/components/Dashboard/DashboardHeader.jsx

import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FaDatabase, FaStar } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { gradients } from '../../theme/colors';

const DashboardHeader = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const mainGradient = gradients.main;

  return (
    <Box 
      bgGradient={mainGradient}
      borderRadius="xl" 
      py={6} 
      px={8} 
      mb={6}
      boxShadow="lg"
    >
      <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
        <VStack align="flex-start" spacing={1}>
          <HStack>
            <FaDatabase color="white" fontSize="1.25rem" />
            <Heading size="lg" color="white" fontWeight="bold">
              PokerProStats
            </Heading>
          </HStack>
          <Text color="whiteAlpha.800" fontSize="sm">
            Análisis avanzado de jugadores con IA
          </Text>
        </VStack>
        
        <HStack spacing={4}>
          <Link to="/favoritos">
            <Button 
              variant="solid" 
              size="md"
              colorScheme="whiteAlpha"
              leftIcon={<FaStar />}
              _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
            >
              Favoritos
            </Button>
          </Link>
          
          <IconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="solid"
            colorScheme="whiteAlpha"
            size="md"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default DashboardHeader;
import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaDatabase } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { gradients } from '../../../theme/colors';

const AdminHeader = () => {
  const mainGradient = gradients.main;

  return (
    <Box 
      bgGradient={mainGradient}
      borderRadius="xl" 
      py={4} 
      px={6} 
      mb={6}
      boxShadow="lg"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <HStack>
          <Icon as={FaDatabase} color="white" boxSize={5} />
          <Heading size="lg" color="white" fontWeight="bold">
            Panel Administrativo
          </Heading>
        </HStack>
        
        <Link to="/">
          <HStack 
            bg="whiteAlpha.200" 
            p={2} 
            borderRadius="md" 
            spacing={2} 
            _hover={{ bg: "whiteAlpha.300" }}
          >
            <Text color="white" fontSize="sm">Volver</Text>
          </HStack>
        </Link>
      </Flex>
      
      <Text 
        mt={2}
        color="whiteAlpha.800" 
        fontSize="sm"
      >
        Administra usuarios, suscripciones y análisis de manos
      </Text>
    </Box>
  );
};

export default AdminHeader;
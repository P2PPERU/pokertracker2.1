import React from 'react';
import {
  SimpleGrid,
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaUsers,
  FaGem,
  FaMedal,
  FaRobot,
  FaFileAlt,
} from 'react-icons/fa';

// Componente StatBox mejorado
const StatBox = ({ label, number, icon }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  
  return (
    <Box 
      bg={cardBg} 
      p={4} 
      borderRadius="lg" 
      boxShadow="base"
      display="flex"
      alignItems="center"
      transition="transform 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
    >
      <Flex alignItems="center" w="100%">
        <Box 
          p={3}
          bg={useColorModeValue("blue.50", "blue.900")}
          borderRadius="lg"
          mr={4}
        >
          <Icon as={icon} boxSize={6} color="#4066ED" />
        </Box>
        
        <Box>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {number}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

const AdminStats = ({ usuarios = [], archivosManos = [] }) => {
  // Cálculos
  const totalUsuarios = usuarios.length;
  const totalOro = usuarios.filter((u) => u.suscripcion === "oro").length;
  const totalPlata = usuarios.filter((u) => u.suscripcion === "plata").length;
  const totalIA = usuarios.reduce((acc, u) => acc + parseInt(u.solicitudes_ia_mes || 0, 10), 0);
  const totalArchivos = archivosManos.length;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={6}>
      <StatBox label="Total Usuarios" number={totalUsuarios} icon={FaUsers} />
      <StatBox label="Suscripción Oro" number={totalOro} icon={FaGem} />
      <StatBox label="Suscripción Plata" number={totalPlata} icon={FaMedal} />
      <StatBox label="Solicitudes IA (mes)" number={totalIA} icon={FaRobot} />
      <StatBox label="Archivos de Manos" number={totalArchivos} icon={FaFileAlt} />
    </SimpleGrid>
  );
};

export default AdminStats;
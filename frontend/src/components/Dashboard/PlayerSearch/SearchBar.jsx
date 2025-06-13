// frontend/src/components/Dashboard/PlayerSearch/SearchBar.jsx

import React from 'react';
import {
  Box,
  Flex,
  Input,
  Select,
  Button,
  InputGroup,
  InputLeftElement,
  Badge,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaSearch, FaDatabase, FaChartLine } from "react-icons/fa";

const SearchBar = ({
  nombreBuscado,
  handleInputChange,
  salaSeleccionada,
  setSalaSeleccionada,
  tipoPeriodo,
  setTipoPeriodo,
  buscarJugador,
  onFocus,
}) => {
  return (
    <Box mt={6}>
      <Flex gap={3} align="center" wrap="wrap">
        {/* Selector de sala */}
        <Select
          value={salaSeleccionada}
          onChange={(e) => setSalaSeleccionada(e.target.value)}
          maxW="120px"
          bg="whiteAlpha.200"
          color="white"
          borderColor="whiteAlpha.300"
          _hover={{ borderColor: "whiteAlpha.400" }}
          _focus={{ borderColor: "white" }}
          size="lg"
        >
          <option value="XPK" style={{ background: 'black' }}>X-Poker</option>
          <option value="PPP" style={{ background: 'black' }}>PPPoker</option>
          <option value="PM" style={{ background: 'black' }}>ClubGG</option>
        </Select>
        
        <Box position="relative" flex="1" maxW={{ base: "100%", md: "400px" }}>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="whiteAlpha.700" />
            </InputLeftElement>
            <Input
              placeholder="Buscar jugador por nombre..."
              value={nombreBuscado}
              onChange={handleInputChange}
              onFocus={onFocus}
              bg="whiteAlpha.200"
              color="white"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: "whiteAlpha.400" }}
              _focus={{ borderColor: "white" }}
              _placeholder={{ color: "whiteAlpha.700" }}
            />
          </InputGroup>
        </Box>
        
        <Button
          size="lg"
          bg="white"
          color="blue.600"
          _hover={{ 
            bg: "gray.50",
            transform: "translateY(-2px)",
            boxShadow: "md",
          }}
          leftIcon={<FaSearch />}
          onClick={() => buscarJugador(nombreBuscado)}
          transition="all 0.2s"
        >
          Buscar
        </Button>

        {/* Selector de período */}
        <Select
          value={tipoPeriodo}
          onChange={(e) => setTipoPeriodo(e.target.value)}
          maxW="150px"
          bg="whiteAlpha.200"
          color="white"
          borderColor="whiteAlpha.300"
          _hover={{ borderColor: "whiteAlpha.400" }}
          _focus={{ borderColor: "white" }}
          size="lg"
        >
          <option value="total" style={{ background: 'black' }}>Histórico</option>
          <option value="semana" style={{ background: 'black' }}>Semana</option>
          <option value="mes" style={{ background: 'black' }}>Mes</option>
        </Select>
      </Flex>

      {/* Info badges */}
      <HStack spacing={3} mt={3} wrap="wrap">
        <Badge colorScheme="blue" p={2}>
          <Icon as={FaDatabase} mr={1} />
          Fuente: POKERPROTRACK
        </Badge>
        <Badge colorScheme="purple" p={2}>
          <Icon as={FaChartLine} mr={1} />
          Período: {tipoPeriodo === 'total' ? 'Histórico Total' : tipoPeriodo === 'semana' ? 'Última Semana' : 'Último Mes'}
        </Badge>
      </HStack>
    </Box>
  );
};

export default SearchBar;
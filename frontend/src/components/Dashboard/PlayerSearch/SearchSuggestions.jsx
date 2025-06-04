// frontend/src/components/Dashboard/PlayerSearch/SearchSuggestions.jsx

import React from 'react';
import {
  List,
  ListItem,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaUserTie } from "react-icons/fa";

const SearchSuggestions = ({ sugerencias, onSelectSuggestion, sugerenciasRef }) => {
  const suggestionBg = useColorModeValue("white", "gray.700");
  const suggestionBorderColor = useColorModeValue("gray.200", "gray.600");
  const listItemHoverBg = useColorModeValue("gray.100", "gray.600");

  if (sugerencias.length === 0) return null;

  return (
    <List
      ref={sugerenciasRef}
      borderWidth="1px"
      borderColor={suggestionBorderColor}
      borderRadius="md"
      mt={1}
      bg={suggestionBg}
      position="absolute"
      width="100%"
      maxWidth="100%"
      boxShadow="xl"
      zIndex="10"
      maxH="300px"
      overflowY="auto"
    >
      {sugerencias.map((jug, index) => (
        <ListItem
          key={index}
          p={3}
          cursor="pointer"
          _hover={{ background: listItemHoverBg }}
          onClick={() => onSelectSuggestion(jug.player_name)}
          borderBottom="1px solid"
          borderColor="gray.100"
          transition="all 0.2s"
        >
          <Flex align="center">
            <Icon as={FaUserTie} mr={2} color="gray.500" />
            {jug.player_name}
          </Flex>
        </ListItem>
      ))}
    </List>
  );
};

export default SearchSuggestions;
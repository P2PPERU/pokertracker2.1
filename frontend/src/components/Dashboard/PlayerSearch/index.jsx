// frontend/src/components/Dashboard/PlayerSearch/index.jsx

import React from 'react';
import { Box } from '@chakra-ui/react';
import SearchBar from './SearchBar';
import SearchSuggestions from './SearchSuggestions';

const PlayerSearch = ({
  nombreBuscado,
  handleInputChange,
  salaSeleccionada,
  setSalaSeleccionada,
  tipoPeriodo,
  setTipoPeriodo,
  buscarJugador,
  sugerencias,
  mostrarSugerencias,
  setMostrarSugerencias,
  setNombreBuscado,
  sugerenciasRef,
}) => {
  const handleSelectSuggestion = (playerName) => {
    setNombreBuscado(playerName);
    buscarJugador(playerName);
    setMostrarSugerencias(false);
  };

  return (
    <Box position="relative">
      <SearchBar
        nombreBuscado={nombreBuscado}
        handleInputChange={handleInputChange}
        salaSeleccionada={salaSeleccionada}
        setSalaSeleccionada={setSalaSeleccionada}
        tipoPeriodo={tipoPeriodo}
        setTipoPeriodo={setTipoPeriodo}
        buscarJugador={buscarJugador}
        onFocus={() => setMostrarSugerencias(true)}
      />
      
      <Box position="absolute" top="100%" left="0" right="0" zIndex={10}>
        {mostrarSugerencias && (
          <SearchSuggestions
            sugerencias={sugerencias}
            onSelectSuggestion={handleSelectSuggestion}
            sugerenciasRef={sugerenciasRef}
          />
        )}
      </Box>
    </Box>
  );
};

export default PlayerSearch;
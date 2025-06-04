// frontend/src/components/Dashboard/PlayerInfo/index.jsx

import React from 'react';
import { Box } from '@chakra-ui/react';
import PlayerInfoCard from './PlayerInfoCard';
import StakeSelector from './StakeSelector';

const PlayerInfo = ({
  jugador,
  esFavorito,
  toggleFavorito,
  tipoPeriodo,
  stakesDisponibles,
  stakeSeleccionado,
  cambiarStake,
}) => {
  return (
    <Box>
      <PlayerInfoCard
        jugador={jugador}
        esFavorito={esFavorito}
        toggleFavorito={toggleFavorito}
        tipoPeriodo={tipoPeriodo}
      />
      
      {stakesDisponibles.length > 1 && (
        <Box mt={4}>
          <StakeSelector
            stakesDisponibles={stakesDisponibles}
            stakeSeleccionado={stakeSeleccionado}
            cambiarStake={cambiarStake}
          />
        </Box>
      )}
    </Box>
  );
};

export default PlayerInfo;
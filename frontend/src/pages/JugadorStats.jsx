import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { Box, Heading, Spinner, Text, SimpleGrid } from '@chakra-ui/react'

const JugadorStats = () => {
  const { nombre } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/jugador/${nombre}`)
        setStats(res.data)
      } catch (error) {
        console.error("Error al obtener estadísticas del jugador:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [nombre])

  if (loading) return <Spinner />

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>📊 Estadísticas de {stats.player_name}</Heading>

      <SimpleGrid columns={[1, 2, 3]} spacing={6} mt={4}>
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Manos Jugadas:</Text>
          <Text>{stats.total_manos}</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Winrate:</Text>
          <Text>{stats.bb_100} bb/100</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Ganancias:</Text>
          <Text>${stats.win_usd}</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">VPIP:</Text>
          <Text>{stats.vpip}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">PFR:</Text>
          <Text>{stats.pfr}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">3-Bet:</Text>
          <Text>{stats.three_bet}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Fold to 3-Bet:</Text>
          <Text>{stats.fold_to_3bet_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">4-Bet:</Text>
          <Text>{stats.four_bet_preflop_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Fold to 4-Bet:</Text>
          <Text>{stats.fold_to_4bet_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">CBet Flop:</Text>
          <Text>{stats.cbet_flop}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">CBet Turn:</Text>
          <Text>{stats.cbet_turn}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">WWSF:</Text>
          <Text>{stats.wwsf}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">WTSD:</Text>
          <Text>{stats.wtsd}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">WSD:</Text>
          <Text>{stats.wsd}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Limp %:</Text>
          <Text>{stats.limp_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Limp-Raise %:</Text>
          <Text>{stats.limp_raise_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Fold to Flop C-Bet %:</Text>
          <Text>{stats.fold_to_flop_cbet_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Fold to Turn C-Bet %:</Text>
          <Text>{stats.fold_to_turn_cbet_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Bet River %:</Text>
          <Text>{stats.bet_river_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Overbet Turn %:</Text>
          <Text>{stats.overbet_turn_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Overbet River %:</Text>
          <Text>{stats.overbet_river_pct}%</Text>
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">WSDwBR %:</Text>
          <Text>{stats.wsdwbr_pct}%</Text>
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default JugadorStats;

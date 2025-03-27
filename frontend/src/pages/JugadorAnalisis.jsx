import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { Box, Heading, Spinner, Text } from '@chakra-ui/react'

const JugadorAnalisis = () => {
  const { nombre } = useParams()
  const [analisis, setAnalisis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalisis = async () => {
      try {
        const res = await api.get(`/jugadores/jugador/${nombre}/analisis`) // ✅ Nueva ruta correcta
        setAnalisis(res.data.analisis)
      } catch (error) {
        console.error("Error al obtener análisis del jugador:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalisis()
  }, [nombre])

  if (loading) return <Spinner />

  return (
    <Box p={6}>
      <Heading>Análisis de {nombre}</Heading>
      <Text mt={4} whiteSpace="pre-line">{analisis}</Text>
    </Box>
  )
}

export default JugadorAnalisis

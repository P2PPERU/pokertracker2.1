import { useState, useEffect } from 'react';
import { Box, Text, Spinner, Button, Heading, Badge, Flex } from '@chakra-ui/react'; 
import api from '../services/api';

const AnalisisJugador = ({ nombre, salaSeleccionada, suscripcionUsuario }) => {
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solicitado, setSolicitado] = useState(false);
  const [solicitudesRestantes, setSolicitudesRestantes] = useState(null);
  const [suscripcion, setSuscripcion] = useState(suscripcionUsuario);
  const [fromCache, setFromCache] = useState(false);
  const [manosAnteriores, setManosAnteriores] = useState(null);
  const [manosActuales, setManosActuales] = useState(null);

  useEffect(() => {
    setAnalisis(null);
    setError(null);
    setLoading(false);
    setSolicitado(false);
    setFromCache(false);
    setManosAnteriores(null);
    setManosActuales(null);
  }, [nombre]);

  const solicitarAnalisis = async () => {
    setLoading(true);
    setError(null);
    setSolicitado(true);

    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/jugador/${salaSeleccionada}/${encodeURIComponent(nombre)}/analisis`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.error) {
        setError(data.error);
        setAnalisis(null);
      } else {
        setAnalisis(data.analisis?.analisis || "No se encontró análisis disponible.");
        setSolicitudesRestantes(data.solicitudesRestantes);
        setSuscripcion(data.suscripcion);
        setFromCache(data.fromCache || false);
        setManosAnteriores(data.manosAnteriores || null);
        setManosActuales(data.manosActuales || null);
      }
    } catch (err) {
      console.error("❌ Error en la solicitud de análisis:", err);
      setError(err.response?.data?.error || "Error en servidor.");
      setSolicitudesRestantes(err.response?.data?.solicitudesRestantes || 0);
      setSuscripcion(err.response?.data?.suscripcion || "desconocida");
      setAnalisis(null);
    }

    setLoading(false);
  };

  return (
    <Box p={3} borderWidth="1px" borderRadius="md" boxShadow="md" mt={4} textAlign="center">
      <Heading size="md" mb={3}>🧠 Análisis IA del jugador</Heading>

      {(suscripcion === "plata" || suscripcion === "oro") && !fromCache && (
        <Flex justify="center">
          <Button
  size="md"
  color="white"
  bgGradient="linear(to-r, #5D5FEF, #6A76FB)"
  _hover={{ bgGradient: "linear(to-r, #4c4feb, #5a64f9)" }}
  fontSize="md"
  onClick={solicitarAnalisis}
  isDisabled={solicitudesRestantes === 0}
>
  Solicitar Análisis IA
</Button>
        </Flex>
      )}

      {loading && <Spinner mt={3} />}

      {error && (
        <Text color="red.500" mt={3} fontSize="md">
          {error}
        </Text>
      )}

      {!loading && analisis && (
        <Box mt={3}>
          <Text whiteSpace="pre-line" fontSize="md">
            {typeof analisis === "string" ? analisis : "No se puede mostrar el análisis."}
          </Text>

          {fromCache && (
            <Text mt={2} fontSize="sm" color="gray.500">
              (Este análisis fue generado anteriormente)
            </Text>
          )}

          {manosAnteriores && manosActuales && (
            <Text mt={2} fontSize="sm" color="gray.500">
              (Manos anteriores: {manosAnteriores} / actuales: {manosActuales})
            </Text>
          )}

          <Box mt={4} textAlign="center">
            <Badge colorScheme="green" display="block" mb={2}>
              SUSCRIPCIÓN: {(suscripcion || "desconocida").toUpperCase()}
            </Badge>
            {solicitudesRestantes !== null && (
              <Badge colorScheme="purple" display="block">
                SOLICITUDES RESTANTES: {solicitudesRestantes}
              </Badge>
            )}
          </Box>
        </Box>     
      )}

      {!loading && solicitado && !analisis && !error && (
        <Text mt={3} fontSize="md">No se generó ningún análisis.</Text>
      )}
    </Box>
  );
};

export default AnalisisJugador;

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Input,
  Button,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import api from "../services/api";

const TopJugadores = () => {
  const [stake, setStake] = useState("50");
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);

  const bgPage = useColorModeValue("#F7FAFC", "#1A202C");
  const bgCentral = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const headingColor = useColorModeValue("#2B6CB0", "#63B3ED");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const evenRowBg = useColorModeValue("gray.50", "gray.700");
  const oddRowBg = useColorModeValue("gray.100", "gray.600");
  const buttonBg = useColorModeValue("#2B6CB0", "#63B3ED");
  const buttonHover = useColorModeValue("#2C5282", "#4299E1");

  const obtenerTopJugadores = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/top-jugadores/${stake}`);
      setJugadores(res.data);
    } catch (error) {
      console.error("Error al obtener el ranking:", error);
      setJugadores([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    obtenerTopJugadores();
  }, []);

  return (
    <Box minH="100vh" bg={bgPage} p={4}>
      <Flex px={[4, 6]} py={[8, 12]} gap={6} justify="center" flexWrap="wrap">
        <Box
          display={["none", "none", "flex"]}
          alignItems="center"
          justifyContent="center"
          width="300px"
          bg="transparent"
          borderRadius="lg"
          boxShadow="md"
          overflow="hidden"
          p={0}
        >
          <a
            href="https://wa.me/51991351213?text=Hola,%20quiero%20más%20info%20sobre%20Supernova"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/supernova.png"
              alt="Publicidad Supernova"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transition: "transform 0.3s ease-in-out",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </a>
        </Box>

        <Box
          flex="1"
          maxW="1000px"
          bg={bgCentral}
          p={[6, 8]}
          borderRadius="xl"
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <Heading mb={4} color={headingColor}>
            🏆 Top Jugadores por Stake
          </Heading>

          <Flex mb={6} gap={3} align="center" wrap="wrap">
            <Text fontWeight="semibold" fontSize="md" color={textColor}>
              Stake:
            </Text>
            <Input
              size="sm"
              width="120px"
              placeholder="Ej: 50"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              bg={useColorModeValue("white", "gray.700")}
              color={textColor}
              borderColor={borderColor}
            />
            <Button
              size="sm"
              color="white"
              bg={buttonBg}
              _hover={{ bg: buttonHover }}
              onClick={obtenerTopJugadores}
            >
              Buscar
            </Button>
          </Flex>

          {loading ? (
            <Flex justify="center" mt={8}>
              <Spinner size="xl" />
            </Flex>
          ) : (
            <Table
              variant="simple"
              size="md"
              sx={{
                "tbody tr:nth-of-type(odd)": {
                  backgroundColor: oddRowBg,
                },
                "tbody tr:nth-of-type(even)": {
                  backgroundColor: evenRowBg,
                },
              }}
            >
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Jugador</Th>
                  <Th>BB/100</Th>
                  <Th>Ganancias ($)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {jugadores.length > 0 ? (
                  jugadores.map((jugador, index) => (
                    <Tr key={jugador.player_name}>
                      <Td>{index + 1}</Td>
                      <Td>{jugador.player_name}</Td>
                      <Td>{jugador.bb_100}</Td>
                      <Td>${jugador.win_usd}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4}>No hay jugadores disponibles.</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>

        <Box
          display={["none", "none", "flex"]}
          alignItems="center"
          justifyContent="center"
          width="300px"
          bg="transparent"
          borderRadius="lg"
          boxShadow="md"
          overflow="hidden"
          p={0}
        >
          <a
            href="https://wa.me/51991351213?text=Hola,%20quiero%20más%20info%20sobre%20Peruev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/peruev.png"
              alt="Publicidad Peruev+"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transition: "transform 0.3s ease-in-out",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </a>
        </Box>
      </Flex>
    </Box>
  );
};

export default TopJugadores;

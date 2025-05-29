import {
  Box, Heading, Text, SimpleGrid, Button, Badge, useColorModeValue,
  Table, Thead, Tbody, Tr, Th, Td, Select, Input, Spinner,
  useToast, Flex, Icon, HStack, VStack, IconButton
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FaUsers, FaGem, FaMedal, FaRobot, FaSearch,
  FaSave, FaTrash, FaDatabase, FaInfoCircle
} from "react-icons/fa";
import api from "../services/api";
import { Link } from "react-router-dom";

// Improved StatBox with icon and better styling
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

const AdminPanel = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [edicionesPendientes, setEdicionesPendientes] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const toast = useToast();

  // Updated color scheme to match blue palette
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const inputBg = useColorModeValue("white", "gray.700");
  const oroBg = useColorModeValue("yellow.50", "yellow.900");
  const plataBg = useColorModeValue("blue.50", "blue.900");
  const defaultRowBg = useColorModeValue("white", "gray.700");
  const mainGradient = useColorModeValue(
    "linear(to-r, #6CB5FE, #4066ED)", 
    "linear(to-r, #6CB5FE, #4066ED)"
  );

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get("/admin/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usuariosActualizados = await Promise.all(
        data.map(async (u) => {
          if ((u.suscripcion === "oro" || u.suscripcion === "plata") && u.suscripcion_expira && new Date(u.suscripcion_expira) < new Date()) {
            await api.put(`/admin/usuarios/${u.id}/suscripcion`, { nuevaSuscripcion: "bronce" }, { headers: { Authorization: `Bearer ${token}` } });
            await api.put(`/admin/usuarios/${u.id}/expiracion`, { nuevaFecha: null }, { headers: { Authorization: `Bearer ${token}` } });
            return { ...u, suscripcion: "bronce", suscripcion_expira: null };
          }
          return u;
        })
      );

      setUsuarios(usuariosActualizados);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async (id) => {
    const cambios = edicionesPendientes[id];
    if (!cambios) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de actualizar al jugador con ID ${id} a:\n- Suscripción: ${cambios.suscripcion}\n- Expira: ${cambios.expiracion || "sin cambios"}`
    );
    if (!confirmacion) return;

    try {
      const token = localStorage.getItem("token");

      let nuevaFecha = cambios.expiracion;
      if ((cambios.suscripcion === "oro" || cambios.suscripcion === "plata") && !cambios.expiracion) {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 30);
        nuevaFecha = hoy.toISOString().split("T")[0];
      }

      if (cambios.suscripcion) {
        await api.put(`/admin/usuarios/${id}/suscripcion`, { nuevaSuscripcion: cambios.suscripcion }, { headers: { Authorization: `Bearer ${token}` } });
      }

      await api.put(`/admin/usuarios/${id}/expiracion`, { nuevaFecha }, { headers: { Authorization: `Bearer ${token}` } });

      toast({
        title: "Cambios aplicados",
        description: "✅ Actualizaciones guardadas correctamente",
        status: "success",
        duration: 3000
      });
      
      fetchUsuarios();
      setEdicionesPendientes((prev) => {
        const nuevo = { ...prev };
        delete nuevo[id];
        return nuevo;
      });
    } catch (err) {
      console.error("Error actualizando campo:", err);
      toast({ title: "Error", description: "❌ Error al actualizar", status: "error", duration: 3000 });
    }
  };

  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar al usuario con ID ${id}? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/usuario/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Usuario eliminado", status: "success", duration: 3000 });
      fetchUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      toast({ title: "Error", description: "❌ No se pudo eliminar el usuario", status: "error", duration: 3000 });
    }
  };

  const manejarCambio = (id, campo, valor) => {
    setEdicionesPendientes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor,
      },
    }));
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalIA = usuarios.reduce((acc, u) => acc + parseInt(u.solicitudes_ia_mes || 0, 10), 0);
  const totalUsuarios = usuarios.length;
  const totalOro = usuarios.filter((u) => u.suscripcion === "oro").length;
  const totalPlata = usuarios.filter((u) => u.suscripcion === "plata").length;

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
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
            Administra usuarios, suscripciones y accesos a funciones premium
          </Text>
        </Box>

        {/* Stats Dashboard */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
          <StatBox label="Total Usuarios" number={totalUsuarios} icon={FaUsers} />
          <StatBox label="Suscripción Oro" number={totalOro} icon={FaGem} />
          <StatBox label="Suscripción Plata" number={totalPlata} icon={FaMedal} />
          <StatBox label="Solicitudes IA (mes)" number={totalIA} icon={FaRobot} />
        </SimpleGrid>

        {/* Search and filters */}
        <Box 
          bg={cardBg} 
          p={4} 
          borderRadius="xl" 
          mb={6}
          boxShadow="base"
        >
          <Flex gap={3} flexWrap={{ base: "wrap", md: "nowrap" }} alignItems="center">
            <Flex flex={1} position="relative">
              <Input
                placeholder="Buscar por nombre o correo"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                bg={inputBg}
                pr="40px"
              />
              <Box position="absolute" right="10px" top="50%" transform="translateY(-50%)">
                <Icon as={FaSearch} color="gray.400" />
              </Box>
            </Flex>
            
            <Button 
              colorScheme="blue" 
              onClick={fetchUsuarios}
              minW="120px"
            >
              Actualizar
            </Button>
          </Flex>
        </Box>

        {/* Users Table */}
        {loading ? (
          <Flex justify="center" my={10}>
            <Spinner size="xl" thickness="4px" color="#4066ED" />
          </Flex>
        ) : (
          <Box 
            bg={cardBg}
            borderRadius="xl"
            overflow="hidden"
            boxShadow="base"
          >
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Nombre</Th>
                    <Th>Email</Th>
                    <Th>Rol</Th>
                    <Th>Suscripción</Th>
                    <Th>Expira</Th>
                    <Th>IA</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {usuariosFiltrados.map((user) => {
                    const suscripcionExpirada = (user.suscripcion === "oro" || user.suscripcion === "plata") && user.suscripcion_expira && new Date(user.suscripcion_expira) < new Date();
                    const rowBg = user.suscripcion === "oro" ? oroBg : user.suscripcion === "plata" ? plataBg : defaultRowBg;
                    const hasChanges = !!edicionesPendientes[user.id];
                    
                    return (
                      <Tr key={user.id} bg={rowBg} _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                        <Td>{user.id}</Td>
                        <Td color={textColor}>{user.nombre}</Td>
                        <Td color={textColor}>{user.email}</Td>
                        <Td>
                          <Badge 
                            colorScheme={user.rol === "admin" ? "purple" : "blue"} 
                            variant="subtle" 
                            px={2} 
                            py={1} 
                            borderRadius="md"
                          >
                            {user.rol}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Select
                              value={edicionesPendientes[user.id]?.suscripcion || user.suscripcion || ""}
                              onChange={(e) => manejarCambio(user.id, "suscripcion", e.target.value)}
                              size="sm"
                              bg={hasChanges ? useColorModeValue("yellow.50", "yellow.900") : inputBg}
                            >
                              <option value="">Seleccionar</option>
                              <option value="bronce">Bronce</option>
                              <option value="plata">Plata</option>
                              <option value="oro">Oro</option>
                            </Select>
                            {suscripcionExpirada && (
                              <Badge colorScheme="red" fontSize="xs">Expirada</Badge>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Input
                            type="date"
                            value={edicionesPendientes[user.id]?.expiracion || user.suscripcion_expira?.split("T")[0] || ""}
                            onChange={(e) => manejarCambio(user.id, "expiracion", e.target.value)}
                            size="sm"
                            bg={hasChanges ? useColorModeValue("yellow.50", "yellow.900") : inputBg}
                          />
                        </Td>
                        <Td>{user.solicitudes_ia_mes || "0"}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton 
                              icon={<FaSave />} 
                              colorScheme="blue" 
                              size="sm" 
                              aria-label="Guardar cambios"
                              onClick={() => guardarCambios(user.id)} 
                              isDisabled={!edicionesPendientes[user.id]}
                              variant={hasChanges ? "solid" : "outline"}
                            />
                            <IconButton 
                              icon={<FaTrash />} 
                              colorScheme="red" 
                              size="sm"
                              aria-label="Eliminar usuario"
                              onClick={() => eliminarUsuario(user.id)}
                              variant="outline"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>

              {usuariosFiltrados.length === 0 && (
                <Box textAlign="center" py={10}>
                  <Icon as={FaInfoCircle} boxSize={8} color="gray.400" mb={3} />
                  <Text color="gray.500">No se encontraron usuarios con ese criterio</Text>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminPanel;
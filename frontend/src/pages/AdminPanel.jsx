import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Badge,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  Spinner,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  Flex
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../services/api";

// ✅ Mover StatBox fuera del componente principal
const StatBox = ({ label, number }) => (
  <Stat>
    <StatLabel>{label}</StatLabel>
    <StatNumber>{number}</StatNumber>
  </Stat>
);

const AdminPanel = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [edicionesPendientes, setEdicionesPendientes] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const toast = useToast();

  const pageBg = useColorModeValue("gray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("teal.500", "teal.300");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const inputBg = useColorModeValue("white", "gray.700");
  const oroBg = useColorModeValue("yellow.50", "yellow.900");
  const plataBg = useColorModeValue("blue.50", "blue.900");
  const defaultRowBg = useColorModeValue("white", "gray.700");

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

      setMensaje("✅ Cambios aplicados con éxito");
      setTimeout(() => setMensaje(""), 3000);
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
    <Box p={6} maxW="100%" mx="auto" bg={pageBg} overflowX="auto">
      <Heading size="lg" mb={6} color={headingColor}>👤 Panel Administrativo</Heading>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <StatBox label="Total usuarios" number={totalUsuarios} />
        <StatBox label="Oro" number={totalOro} />
        <StatBox label="Plata" number={totalPlata} />
        <StatBox label="Solicitudes IA este mes" number={totalIA} />
      </SimpleGrid>

      <Flex mb={4} gap={2} flexWrap="wrap" maxW="500px">
        <Input
          placeholder="Buscar por nombre o correo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          bg={inputBg}
          flex="1"
          size="sm"
        />
        <Button colorScheme="teal" minW="80px" size="sm">Buscar</Button>
      </Flex>

      {mensaje && <Text color="green.500" mb={2}>{mensaje}</Text>}
      {loading ? (
        <Spinner size="lg" color="teal.500" />
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm" bg={cardBg} minW="1000px">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Suscripción</Th>
                <Th>Expira</Th>
                <Th>Solicitudes</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {usuariosFiltrados.map((user) => {
                const suscripcionExpirada = (user.suscripcion === "oro" || user.suscripcion === "plata") && user.suscripcion_expira && new Date(user.suscripcion_expira) < new Date();
                const rowBg = user.suscripcion === "oro" ? oroBg : user.suscripcion === "plata" ? plataBg : defaultRowBg;
                return (
                  <Tr key={user.id} bg={rowBg}>
                    <Td>{user.id}</Td>
                    <Td color={textColor}>{user.nombre}</Td>
                    <Td color={textColor}>{user.email}</Td>
                    <Td><Badge colorScheme="purple">{user.rol}</Badge></Td>
                    <Td>
                      <Select
                        value={edicionesPendientes[user.id]?.suscripcion || user.suscripcion || ""}
                        onChange={(e) => manejarCambio(user.id, "suscripcion", e.target.value)}
                        size="sm"
                      >
                        <option value="">Seleccionar</option>
                        <option value="bronce">Bronce</option>
                        <option value="plata">Plata</option>
                        <option value="oro">Oro</option>
                      </Select>
                      {suscripcionExpirada && (
                        <Badge colorScheme="red" fontSize="xs" mt={1}>Suscripción expirada</Badge>
                      )}
                    </Td>
                    <Td>
                      <Input
                        type="date"
                        value={edicionesPendientes[user.id]?.expiracion || user.suscripcion_expira?.split("T")[0] || ""}
                        onChange={(e) => manejarCambio(user.id, "expiracion", e.target.value)}
                        size="sm"
                        bg={inputBg}
                      />
                    </Td>
                    <Td>{user.solicitudes_ia_mes}</Td>
                    <Td>
                      <Button size="sm" colorScheme="teal" onClick={() => guardarCambios(user.id)} isDisabled={!edicionesPendientes[user.id]} mr={2}>
                        Guardar
                      </Button>
                      <Button size="sm" colorScheme="red" onClick={() => eliminarUsuario(user.id)}>
                        Eliminar
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default AdminPanel;

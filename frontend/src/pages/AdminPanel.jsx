import {
  Box, Heading, Text, SimpleGrid, Button, Badge, useColorModeValue,
  Table, Thead, Tbody, Tr, Th, Td, Select, Input, Spinner,
  useToast, Flex, Icon, HStack, VStack, IconButton, Tabs, TabList, TabPanels, Tab, TabPanel,
  Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Alert, AlertIcon
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FaUsers, FaGem, FaMedal, FaRobot, FaSearch,
  FaSave, FaTrash, FaDatabase, FaInfoCircle, FaFileAlt, FaDownload, FaEdit, FaClock, FaCheckCircle
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
  // ✅ TODOS LOS HOOKS AL INICIO - ORDEN FIJO
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [edicionesPendientes, setEdicionesPendientes] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [archivosManos, setArchivosManos] = useState([]);
  const [loadingManos, setLoadingManos] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [analisisTexto, setAnalisisTexto] = useState("");
  
  // ✅ useDisclosure SIEMPRE se ejecuta
  const { isOpen: modalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const toast = useToast();

  // ✅ TODOS los useColorModeValue AL INICIO - NUNCA CONDICIONALMENTE
  const pageBg = useColorModeValue("#F5F8FC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const inputBg = useColorModeValue("white", "gray.700");
  const oroBg = useColorModeValue("yellow.50", "yellow.900");
  const plataBg = useColorModeValue("blue.50", "blue.900");
  const defaultRowBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const mainGradient = useColorModeValue(
    "linear(to-r, #6CB5FE, #4066ED)", 
    "linear(to-r, #6CB5FE, #4066ED)"
  );

  // ✅ FUNCIONES DESPUÉS DE LOS HOOKS
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

  const fetchArchivosManos = async () => {
    try {
      setLoadingManos(true);
      const token = localStorage.getItem("token");
      const { data } = await api.get("/manos/admin/pendientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArchivosManos(data);
    } catch (error) {
      console.error("Error cargando archivos de manos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos de manos",
        status: "error",
        duration: 3000
      });
    } finally {
      setLoadingManos(false);
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

  const descargarArchivo = async (id, nombreArchivo) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/manos/admin/descargar/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Descarga iniciada",
        description: `Descargando ${nombreArchivo}`,
        status: "success",
        duration: 3000
      });
    } catch (error) {
      console.error("Error descargando archivo:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
        status: "error",
        duration: 3000
      });
    }
  };

  const abrirModalAnalisis = (archivo) => {
    setArchivoSeleccionado(archivo);
    setAnalisisTexto(archivo.analisis_admin || '');
    openModal();
  };

  const cerrarModalAnalisis = () => {
    setArchivoSeleccionado(null);
    setAnalisisTexto('');
    closeModal();
  };

  const guardarAnalisis = async () => {
    if (!analisisTexto.trim()) {
      toast({
        title: "Error",
        description: "El análisis no puede estar vacío",
        status: "error",
        duration: 3000
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post(`/manos/admin/analisis/${archivoSeleccionado.id}`, {
        analisis: analisisTexto
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Análisis guardado",
        description: "El análisis ha sido enviado al usuario",
        status: "success",
        duration: 3000
      });

      cerrarModalAnalisis();
      fetchArchivosManos();
    } catch (error) {
      console.error("Error guardando análisis:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el análisis",
        status: "error",
        duration: 3000
      });
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ useEffect AL FINAL
  useEffect(() => {
    fetchUsuarios();
    fetchArchivosManos();
  }, []);

  // Cálculos después de useEffect
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalIA = usuarios.reduce((acc, u) => acc + parseInt(u.solicitudes_ia_mes || 0, 10), 0);
  const totalUsuarios = usuarios.length;
  const totalOro = usuarios.filter((u) => u.suscripcion === "oro").length;
  const totalPlata = usuarios.filter((u) => u.suscripcion === "plata").length;

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
            Administra usuarios, suscripciones y análisis de manos
          </Text>
        </Box>

        {/* Stats Dashboard */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={6}>
          <StatBox label="Total Usuarios" number={totalUsuarios} icon={FaUsers} />
          <StatBox label="Suscripción Oro" number={totalOro} icon={FaGem} />
          <StatBox label="Suscripción Plata" number={totalPlata} icon={FaMedal} />
          <StatBox label="Solicitudes IA (mes)" number={totalIA} icon={FaRobot} />
          <StatBox label="Archivos de Manos" number={archivosManos.length} icon={FaFileAlt} />
        </SimpleGrid>

        {/* Tabs para gestión */}
        <Box 
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="base"
        >
          <Tabs isFitted variant="enclosed">
            <TabList>
              <Tab _selected={{ color: 'white', bg: '#4066ED' }}>
                <Icon as={FaUsers} mr={2} />
                Gestión de Usuarios
              </Tab>
              <Tab _selected={{ color: 'white', bg: '#4066ED' }}>
                <Icon as={FaFileAlt} mr={2} />
                Análisis de Manos
              </Tab>
            </TabList>

            <TabPanels>
              {/* Panel de usuarios */}
              <TabPanel p={0}>
                <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
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

                {loading ? (
                  <Flex justify="center" my={10}>
                    <Spinner size="xl" thickness="4px" color="#4066ED" />
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead bg={headerBg}>
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
                            <Tr key={user.id} bg={rowBg} _hover={{ bg: hoverBg }}>
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
                )}
              </TabPanel>

              {/* Panel de análisis de manos */}
              <TabPanel p={0}>
                <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Archivos de Manos Subidos</Heading>
                    <Button 
                      colorScheme="blue" 
                      onClick={fetchArchivosManos}
                      leftIcon={<FaSearch />}
                    >
                      Actualizar
                    </Button>
                  </Flex>
                </Box>

                {loadingManos ? (
                  <Flex justify="center" my={10}>
                    <Spinner size="xl" thickness="4px" color="#4066ED" />
                  </Flex>
                ) : archivosManos.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Icon as={FaFileAlt} boxSize={8} color="gray.400" mb={3} />
                    <Text color="gray.500">No hay archivos de manos subidos</Text>
                  </Box>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Usuario</Th>
                          <Th>Email</Th>
                          <Th>Archivo</Th>
                          <Th>Estado</Th>
                          <Th>Fecha Subida</Th>
                          <Th>Acciones</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {archivosManos.map((archivo) => (
                          <Tr key={archivo.id} _hover={{ bg: hoverBg }}>
                            <Td>{archivo.id}</Td>
                            <Td>{archivo.nombre_usuario}</Td>
                            <Td>{archivo.email_usuario}</Td>
                            <Td>
                              <HStack>
                                <Icon as={FaFileAlt} color="blue.500" />
                                <Text fontSize="sm">{archivo.nombre_archivo}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              {archivo.estado === 'pendiente' ? (
                                <HStack>
                                  <Icon as={FaClock} color="orange.500" boxSize={3} />
                                  <Badge colorScheme="yellow">Pendiente</Badge>
                                </HStack>
                              ) : (
                                <HStack>
                                  <Icon as={FaCheckCircle} color="green.500" boxSize={3} />
                                  <Badge colorScheme="green">Analizado</Badge>
                                </HStack>
                              )}
                            </Td>
                            <Td fontSize="sm">{formatearFecha(archivo.fecha_subida)}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  icon={<FaDownload />}
                                  colorScheme="blue"
                                  size="sm"
                                  aria-label="Descargar archivo"
                                  onClick={() => descargarArchivo(archivo.id, archivo.nombre_archivo)}
                                  variant="outline"
                                />
                                <IconButton
                                  icon={<FaEdit />}
                                  colorScheme="green"
                                  size="sm"
                                  aria-label="Agregar/editar análisis"
                                  onClick={() => abrirModalAnalisis(archivo)}
                                  variant={archivo.estado === 'analizado' ? 'solid' : 'outline'}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Modal para análisis de manos */}
        <Modal isOpen={modalOpen} onClose={cerrarModalAnalisis} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Icon as={FaEdit} />
                <Text>Análisis de Manos</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {archivoSeleccionado && (
                <VStack spacing={4} align="stretch">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Archivo: {archivoSeleccionado.nombre_archivo}</Text>
                      <Text fontSize="sm">Usuario: {archivoSeleccionado.nombre_usuario} ({archivoSeleccionado.email_usuario})</Text>
                    </Box>
                  </Alert>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Escribe tu análisis:</Text>
                    <Textarea
                      value={analisisTexto}
                      onChange={(e) => setAnalisisTexto(e.target.value)}
                      placeholder="Escribe aquí el análisis detallado de las manos del usuario..."
                      rows={10}
                      resize="vertical"
                    />
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={cerrarModalAnalisis}>
                Cancelar
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={guardarAnalisis}
                isDisabled={!analisisTexto.trim()}
              >
                Guardar Análisis
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default AdminPanel;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  Badge,
  Text,
  Icon,
  Spinner,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  VStack,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaSearch,
  FaDownload,
  FaEdit,
  FaClock,
  FaCheckCircle,
  FaFileAlt,
} from 'react-icons/fa';
import api from '../../../services/api';

const HandAnalysis = () => {
  // Estados
  const [archivosManos, setArchivosManos] = useState([]);
  const [loadingManos, setLoadingManos] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [analisisTexto, setAnalisisTexto] = useState("");
  
  // Colores
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  
  const { isOpen: modalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const toast = useToast();

  // Funciones (mover de AdminPanel.jsx)
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

  useEffect(() => {
    fetchArchivosManos();
  }, []);

  if (loadingManos) {
    return (
      <Flex justify="center" my={10}>
        <Spinner size="xl" thickness="4px" color="#4066ED" />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
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

      {/* Tabla de archivos */}
      {archivosManos.length === 0 ? (
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
  );
};

export default HandAnalysis;
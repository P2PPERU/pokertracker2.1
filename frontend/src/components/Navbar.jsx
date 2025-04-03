import {
  Flex,
  Button,
  Text,
  Link,
  useDisclosure,
  Box,
  IconButton,
  Collapse,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const {
    isOpen: modalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  const navItemColor = "white";
  const hoverColor = "cyan.200";

  const links = [
    { to: "/", label: "Inicio", always: true },
    { to: "/dashboard", label: "Generador EV", authOnly: true },
    { to: "/top-jugadores", label: "Top Jugadores", always: true },
    { to: "/suscripciones", label: "Suscripciones", always: true },
    { to: "/favoritos", label: "Favoritos", authOnly: true },
    { to: "/perfil", label: "Mi Perfil", authOnly: true },
    { to: "/admin", label: "Admin Panel", adminOnly: true },
  ];

  const isMobile = useBreakpointValue({ base: true, md: false });

  const filteredLinks = links.filter((link) => {
    if (link.always) return true;
    if (link.authOnly && auth) return true;
    if (link.adminOnly && auth?.rol === "admin") return true;
    return false;
  });

  return (
    <Box
      bgGradient="linear(to-r, #2BB5E0, #8266D4)"
      color="white"
      position="sticky"
      top="0"
      zIndex="1000"
      onMouseLeave={() => {
        if (!isMobile) onClose();
      }}
    >
      {/* Barra superior */}
      <Flex
        px={6}
        py={4}
        align="center"
        justify="space-between"
        boxShadow="md"
        onMouseEnter={() => {
          if (!isMobile) onToggle();
        }}
      >
        {/* Logo */}
        <Text fontSize="2xl" fontWeight="bold">
          <Link
            as={RouterLink}
            to="/"
            _hover={{ textDecoration: "none", color: "cyan.100" }}
          >
            POKER PRO TRACK 2.1 🚀
          </Link>
        </Text>

        {/* Botón hamburguesa para móvil */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onToggle}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          aria-label="Abrir menú"
        />

        {/* Navegación desktop */}
        <Flex gap={4} display={{ base: "none", md: "flex" }}>
          {filteredLinks.map((link) => (
            <Link key={link.to} as={RouterLink} to={link.to}>
              <Button
                variant="ghost"
                fontSize="lg"
                fontWeight="medium"
                color={navItemColor}
                _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
              >
                {link.label}
              </Button>
            </Link>
          ))}

          {auth ? (
            <Button
              variant="ghost"
              fontSize="lg"
              fontWeight="medium"
              color={navItemColor}
              _hover={{ color: "red.300", bg: "whiteAlpha.200" }}
              onClick={logout}
            >
              Salir
            </Button>
          ) : (
            <Button
              variant="ghost"
              fontSize="lg"
              fontWeight="medium"
              color={navItemColor}
              _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
              onClick={openModal}
            >
              Ingresar
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Menú colapsable en móvil */}
      <Collapse in={isOpen} animateOpacity>
        <Stack
          bgGradient="linear(to-r, #2BB5E0, #8266D4)"
          p={4}
          display={{ md: "none" }}
        >
          {filteredLinks.map((link) => (
            <Link key={link.to} as={RouterLink} to={link.to} onClick={onClose}>
              <Button
                w="full"
                variant="ghost"
                fontSize="md"
                fontWeight="medium"
                color={navItemColor}
                _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
              >
                {link.label}
              </Button>
            </Link>
          ))}

          {auth ? (
            <Button
              w="full"
              variant="ghost"
              fontSize="md"
              fontWeight="medium"
              color={navItemColor}
              _hover={{ color: "red.300", bg: "whiteAlpha.200" }}
              onClick={() => {
                logout();
                onClose();
              }}
            >
              Salir
            </Button>
          ) : (
            <Button
              w="full"
              variant="ghost"
              fontSize="md"
              fontWeight="medium"
              color={navItemColor}
              _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
              onClick={openModal}
            >
              Ingresar
            </Button>
          )}
        </Stack>
      </Collapse>

      <AuthModal isOpen={modalOpen} onClose={closeModal} />
    </Box>
  );
};

export default Navbar;

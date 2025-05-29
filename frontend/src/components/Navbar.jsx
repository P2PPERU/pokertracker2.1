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
  Badge,
  Image,
  HStack
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { FaChartLine, FaUsers, FaCrown, FaStar, FaUserAlt, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useEffect, useState } from "react";
import { gradients } from "../theme/colors"; // 👈 Importar colores del tema

const Navbar = () => {
  const { auth, logout } = useAuth();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const {
    isOpen: modalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Seguimiento del scroll para efectos visuales en la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItemColor = "white";
  const hoverColor = "whiteAlpha.300"; // 👈 Cambiado de cyan.200
  
  // 👇 Usar gradiente del tema
  const navBgGradient = gradients.main;
    
  const navBoxShadow = scrolled 
    ? "0 4px 20px rgba(0,0,0,0.2)" 
    : "0 2px 10px rgba(0,0,0,0.1)";
    
  const navbarHeight = scrolled ? "65px" : "75px";
  const logoSize = scrolled ? "xl" : "2xl";

  // Iconos para los elementos de navegación
  const getNavIcon = (path) => {
    switch(path) {
      case "/": return FaHome;
      case "/dashboard": return FaChartLine;
      case "/top-jugadores": return FaUsers;
      case "/suscripciones": return FaCrown;
      case "/favoritos": return FaStar;
      case "/perfil": return FaUserAlt;
      case "/admin": return FaUserAlt;
      default: return null;
    }
  };

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
      bgGradient={navBgGradient} // 👈 Usando gradiente del tema
      color="white"
      position="sticky"
      top="0"
      zIndex="1000"
      boxShadow={navBoxShadow}
      transition="all 0.3s ease"
      onMouseLeave={() => {
        if (!isMobile) onClose();
      }}
    >
      {/* Barra superior */}
      <Flex
        px={6}
        py={4}
        height={navbarHeight}
        align="center"
        justify="space-between"
        transition="all 0.3s ease"
        onMouseEnter={() => {
          if (!isMobile) onToggle();
        }}
      >
        {/* Logo con brillo y efecto */}
        <Flex align="center">
          <Link
            as={RouterLink}
            to="/"
            _hover={{ textDecoration: "none" }}
            display="flex"
            alignItems="center"
          >
            <HStack spacing={2}>
              <Box 
                fontSize={scrolled ? "xl" : "2xl"} 
                transition="all 0.3s ease"
              >
                🃏
              </Box>
              <Text
                fontSize={logoSize} 
                fontWeight="bold"
                transition="all 0.3s ease"
                bgGradient="linear(to-r, white, whiteAlpha.800)" // 👈 Simplificado
                bgClip="text"
                letterSpacing="tight"
                _hover={{ 
                  textShadow: "0 0 15px rgba(255,255,255,0.5)" 
                }}
              >
                POKER PRO TRACK 2.1
              </Text>
            </HStack>
            
            <Badge 
              ml={2} 
              colorScheme="cyan" 
              fontSize="0.6em" 
              borderRadius="full"
              px={2}
              py={0.5}
              textTransform="uppercase"
              fontWeight="bold"
              bg="whiteAlpha.200" // 👈 Consistente con el tema
              color="white"
              borderWidth="1px"
              borderColor="whiteAlpha.300"
            >
              IA
            </Badge>
          </Link>
        </Flex>

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

        {/* Navegación desktop mejorada */}
        <Flex gap={2} display={{ base: "none", md: "flex" }}>
          {filteredLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = getNavIcon(link.to);
            
            return (
              <Link key={link.to} as={RouterLink} to={link.to}>
                <Button
                  variant="ghost"
                  fontSize="lg"
                  fontWeight="medium"
                  color={isActive ? "white" : navItemColor}
                  bg={isActive ? "whiteAlpha.200" : "transparent"}
                  _hover={{ 
                    color: "white", 
                    bg: hoverColor,
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }}
                  transition="all 0.2s ease"
                  borderRadius="md"
                  px={4}
                  leftIcon={Icon && <Icon />}
                >
                  {link.label}
                  {isActive && (
                    <Box 
                      position="absolute" 
                      bottom="-1px" 
                      left="0" 
                      right="0" 
                      height="2px" 
                      bg="white" // 👈 Cambiado de cyan.200
                      borderRadius="full"
                    />
                  )}
                </Button>
              </Link>
            );
          })}

          {auth ? (
            <Button
              variant="ghost"
              fontSize="lg"
              fontWeight="medium"
              color={navItemColor}
              _hover={{ 
                color: "red.300", 
                bg: "whiteAlpha.200",
                transform: "translateY(-2px)"
              }}
              onClick={logout}
              leftIcon={<FaSignOutAlt />}
              transition="all 0.2s ease"
              borderRadius="md"
            >
              Salir
            </Button>
          ) : (
            <Button
              variant="ghost"
              fontSize="lg"
              fontWeight="medium"
              color={navItemColor}
              bg="whiteAlpha.200"
              _hover={{ 
                color: "white", 
                bg: "whiteAlpha.300",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}
              onClick={openModal}
              borderRadius="md"
              px={6}
              transition="all 0.2s ease"
            >
              Ingresar
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Menú colapsable en móvil */}
      <Collapse in={isOpen} animateOpacity>
        <Stack
          bgGradient={navBgGradient} // 👈 Usando gradiente del tema
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
                _hover={{ color: "white", bg: hoverColor }}
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
              _hover={{ color: "white", bg: hoverColor }}
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
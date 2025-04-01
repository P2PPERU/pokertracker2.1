import {
  Flex,
  Button,
  Text,
  Link,
  useDisclosure
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navItemColor = "white";
  const hoverColor = "cyan.200";

  return (
    <Flex
      bgGradient="linear(to-r, #2BB5E0, #8266D4)"
      color="white"
      px={8}
      py={4}
      align="center"
      justify="space-between"
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      {/* Logo / Título */}
      <Text fontSize="2xl" fontWeight="bold">
        <Link
          as={RouterLink}
          to="/"
          _hover={{ textDecoration: "none", color: "cyan.100" }}
        >
          POKER PRO TRACK 2.1 🚀
        </Link>
      </Text>

      {/* Navegación */}
      <Flex gap={4} wrap="wrap">
        {/* Siempre visibles */}
        <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
          <Button
            variant="ghost"
            fontSize="lg"
            fontWeight="medium"
            color={navItemColor}
            _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
          >
            Inicio
          </Button>
        </Link>

        {auth && (
          <Link as={RouterLink} to="/dashboard">
            <Button
              variant="ghost"
              fontSize="lg"
              fontWeight="medium"
              color={navItemColor}
              _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
            >
              Generador EV
            </Button>
          </Link>
        )}

        <Link as={RouterLink} to="/top-jugadores">
          <Button
            variant="ghost"
            fontSize="lg"
            fontWeight="medium"
            color={navItemColor}
            _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
          >
            Top Jugadores
          </Button>
        </Link>

        <Link as={RouterLink} to="/suscripciones">
          <Button
            variant="ghost"
            fontSize="lg"
            fontWeight="medium"
            color={navItemColor}
            _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
          >
            Suscripciones
          </Button>
        </Link>

        {/* Mostrar el enlace a Favoritos solo si el usuario está autenticado */}
        {auth && (
          <Link as={RouterLink} to="/favoritos">
            <Button
              variant="ghost"
              fontSize="lg"
              fontWeight="medium"
              color={navItemColor}
              _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
            >
              Favoritos
            </Button>
          </Link>
        )}

        {/* Perfil, Admin & Logout */}
        {auth ? (
          <>
            <Link as={RouterLink} to="/perfil">
              <Button
                variant="ghost"
                fontSize="lg"
                fontWeight="medium"
                color={navItemColor}
                _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
              >
                Mi Perfil
              </Button>
            </Link>

            {auth.rol === "admin" && (
              <Link as={RouterLink} to="/admin">
                <Button
                  variant="ghost"
                  fontSize="lg"
                  fontWeight="medium"
                  color={navItemColor}
                  _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
                >
                  Admin Panel
                </Button>
              </Link>
            )}

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
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              fontSize="lg"
              fontWeight="medium"
              color={navItemColor}
              _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}
              onClick={onOpen}
            >
              Ingresar
            </Button>
            <AuthModal isOpen={isOpen} onClose={onClose} />
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Navbar;

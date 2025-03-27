import {
  Flex,
  Button,
  Text,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useAuth();

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
      {/* Marca */}
      <Text fontSize="2xl" fontWeight="bold">
        <Link
          as={RouterLink}
          to="/"
          _hover={{ textDecoration: "none", color: "cyan.100" }}
        >
          Luciana EV 2.1 🚀
        </Link>
      </Text>

      {/* Navegación */}
      <Flex gap={4} wrap="wrap">
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

        {auth ? (
          <>
            <Link as={RouterLink} to="/dashboard">
              <Button variant="ghost" fontSize="lg" fontWeight="medium" color={navItemColor} _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}>
                Generador EV
              </Button>
            </Link>

            <Link as={RouterLink} to="/top-jugadores">
              <Button variant="ghost" fontSize="lg" fontWeight="medium" color={navItemColor} _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}>
                Top Jugadores
              </Button>
            </Link>

            <Link as={RouterLink} to="/suscripciones">
              <Button variant="ghost" fontSize="lg" fontWeight="medium" color={navItemColor} _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}>
                Suscripciones
              </Button>
            </Link>

            {auth.rol === "admin" && (
              <Link as={RouterLink} to="/admin">
                <Button variant="ghost" fontSize="lg" fontWeight="medium" color={navItemColor} _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}>
                  Admin Panel
                </Button>
              </Link>
            )}

            <Button variant="ghost" fontSize="lg" fontWeight="medium" color={navItemColor} _hover={{ color: "red.300", bg: "whiteAlpha.200" }} onClick={logout}>
              Salir
            </Button>
          </>
        ) : (
          <>
            <Link as={RouterLink} to="/login">
              <Button variant="ghost" fontSize="lg" fontWeight="medium" color={navItemColor} _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}>
                Ingresar
              </Button>
            </Link>
            <Link as={RouterLink} to="/register">
              <Button variant="ghost" fontSize="lg" fontWeight="medium" color={navItemColor} _hover={{ color: hoverColor, bg: "whiteAlpha.200" }}>
                Registrar
              </Button>
            </Link>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Navbar;

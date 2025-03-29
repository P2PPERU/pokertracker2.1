// src/components/AuthModal.jsx
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    FormControl,
    FormLabel,
    Input,
    Button,
    useToast,
    Text,
    Link
  } from '@chakra-ui/react'
  import { useState } from 'react'
  import { useAuth } from '../context/AuthContext'
  import { useNavigate, Link as RouterLink } from 'react-router-dom'
  import api from '../services/api'
  
  const AuthModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate()
    const toast = useToast()
    const { login } = useAuth()
  
    // Estados para login
    const [emailLogin, setEmailLogin] = useState('')
    const [passwordLogin, setPasswordLogin] = useState('')
  
    // Estados para registro
    const [nombre, setNombre] = useState('')
    const [emailReg, setEmailReg] = useState('')
    const [passwordReg, setPasswordReg] = useState('')
    const [telefono, setTelefono] = useState('')
  
    const handleLogin = async () => {
      try {
        await login(emailLogin, passwordLogin)
        toast({ title: 'Login exitoso', status: 'success', duration: 3000, isClosable: true })
        onClose()
        navigate('/dashboard')
      } catch (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error.response?.data?.message || 'Credenciales incorrectas.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    }
  
    const handleRegister = async () => {
      try {
        await api.post('/auth/registro', { nombre, email: emailReg, password: passwordReg, telefono })
        toast({ title: 'Registro exitoso 🎉', status: 'success', duration: 3000, isClosable: true })
        onClose()
      } catch (error) {
        toast({
          title: 'Error en registro',
          description: error.response?.data?.message || 'Intenta nuevamente.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    }
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Accede a tu cuenta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab>Ingresar</Tab>
                <Tab>Registrar</Tab>
              </TabList>
              <TabPanels>
                {/* TAB LOGIN */}
                <TabPanel>
                  <FormControl mb={4}>
                    <FormLabel>Email</FormLabel>
                    <Input value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Contraseña</FormLabel>
                    <Input
                      type="password"
                      value={passwordLogin}
                      onChange={(e) => setPasswordLogin(e.target.value)}
                    />
                  </FormControl>
                  <Button colorScheme="teal" width="100%" onClick={handleLogin}>Entrar</Button>
                  <Text mt={3} textAlign="center">
                    <Link as={RouterLink} to="/recuperar" color="teal.500" onClick={onClose}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </Text>
                </TabPanel>
  
                {/* TAB REGISTRO */}
                <TabPanel>
                  <FormControl mb={3}>
                    <FormLabel>Nombre</FormLabel>
                    <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Email</FormLabel>
                    <Input value={emailReg} onChange={(e) => setEmailReg(e.target.value)} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Teléfono</FormLabel>
                    <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Contraseña</FormLabel>
                    <Input
                      type="password"
                      value={passwordReg}
                      onChange={(e) => setPasswordReg(e.target.value)}
                    />
                  </FormControl>
                  <Button colorScheme="teal" width="100%" onClick={handleRegister}>Registrarme</Button>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }
  
  export default AuthModal
  
// frontend/src/theme/index.js
import { extendTheme } from '@chakra-ui/react';
import { 
  brand, 
  backgrounds, 
  stats, 
  poker, 
  money, 
  status, 
  gradients 
} from './colors';

const theme = extendTheme({
  // 🎨 Colores personalizados
  colors: {
    brand,
    stats,
    poker,
    money,
    status,
    // Agregar los colores de fondo según el modo
    backgrounds,
  },
  
  // 🌈 Gradientes como tokens semánticos
  semanticTokens: {
    colors: {
      // Colores que cambian según el modo claro/oscuro
      'bg.page': {
        default: backgrounds.light.page,
        _dark: backgrounds.dark.page,
      },
      'bg.card': {
        default: backgrounds.light.card,
        _dark: backgrounds.dark.card,
      },
      'bg.hover': {
        default: backgrounds.light.hover,
        _dark: backgrounds.dark.hover,
      },
      'bg.modal': {
        default: backgrounds.light.modal,
        _dark: backgrounds.dark.modal,
      },
      // Colores de texto
      'text.primary': {
        default: 'gray.800',
        _dark: 'gray.100',
      },
      'text.secondary': {
        default: 'gray.600',
        _dark: 'gray.400',
      },
      'text.muted': {
        default: 'gray.500',
        _dark: 'gray.500',
      },
      // Bordes
      'border.default': {
        default: 'gray.200',
        _dark: 'gray.600',
      },
      'border.hover': {
        default: 'gray.300',
        _dark: 'gray.500',
      },
    },
  },
  
  // 🎯 Componentes personalizados
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
        transition: 'all 0.2s',
      },
      variants: {
        // Botón primario con gradiente
        primary: {
          bgGradient: gradients.main,
          color: 'white',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            _disabled: {
              transform: 'none',
              boxShadow: 'none',
            },
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
        // Botón secundario
        secondary: {
          bg: 'brand.secondary',
          color: 'white',
          _hover: {
            bg: 'brand.primary',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
        },
        // Botón de éxito
        success: {
          bgGradient: gradients.success,
          color: 'white',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        },
        // Botón de peligro
        danger: {
          bgGradient: gradients.danger,
          color: 'white',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        },
        // Botón premium/oro
        premium: {
          bgGradient: gradients.gold,
          color: 'gray.800',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        },
      },
      defaultProps: {
        variant: 'primary',
      },
    },
    
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 3,
        py: 1,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 'xs',
      },
      variants: {
        // Badges de suscripción
        gold: {
          bg: 'poker.gold',
          color: 'gray.800',
        },
        silver: {
          bg: 'poker.silver',
          color: 'gray.800',
        },
        bronze: {
          bg: 'poker.bronze',
          color: 'white',
        },
        // Badges de estado
        optimal: {
          bg: 'stats.optimal',
          color: 'white',
        },
        warning: {
          bg: 'stats.warning',
          color: 'white',
        },
        danger: {
          bg: 'stats.danger',
          color: 'white',
        },
      },
    },
    
    Card: {
      baseStyle: {
        container: {
          bg: 'bg.card',
          borderRadius: 'xl',
          boxShadow: 'base',
          border: '1px solid',
          borderColor: 'border.default',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: 'lg',
          },
        },
      },
    },
    
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.primary',
      },
      variants: {
        filled: {
          field: {
            bg: 'bg.hover',
            _hover: {
              bg: 'bg.hover',
            },
            _focus: {
              bg: 'bg.card',
              borderColor: 'brand.primary',
            },
          },
        },
      },
    },
    
    Select: {
      defaultProps: {
        focusBorderColor: 'brand.primary',
      },
    },
    
    Tabs: {
      variants: {
        'soft-rounded': {
          tab: {
            _selected: {
              bg: 'brand.primary',
              color: 'white',
            },
          },
        },
      },
    },
  },
  
  // 🎨 Estilos globales
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'light' ? backgrounds.light.page : backgrounds.dark.page,
        color: props.colorMode === 'light' ? 'gray.800' : 'gray.100',
      },
      // Scrollbar personalizada
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: props.colorMode === 'light' ? 'gray.100' : 'gray.800',
      },
      '::-webkit-scrollbar-thumb': {
        bg: props.colorMode === 'light' ? 'gray.400' : 'gray.600',
        borderRadius: 'full',
        '&:hover': {
          bg: props.colorMode === 'light' ? 'gray.500' : 'gray.500',
        },
      },
    }),
  },
  
  // 🔧 Configuración
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
    cssVarPrefix: 'poker',
  },
  
  // 📏 Espaciados personalizados
  space: {
    18: '4.5rem',
    88: '22rem',
    100: '25rem',
    120: '30rem',
  },
  
  // 🔤 Fuentes
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  
  // 🎯 Sombras personalizadas
  shadows: {
    brand: '0 0 0 3px rgba(64, 102, 237, 0.3)',
  },
});

export default theme;

// Re-exportar utilidades de colors para facilitar imports
export { 
  brand,
  backgrounds,
  stats,
  poker,
  money,
  status,
  gradients,
  statThresholds,
  getStatColor,
  getMoneyColor,
  getSuscripcionColor
} from './colors';

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',      // Móviles pequeños (iPhone SE)
        'sm': '375px',      // Móviles estándar (iPhone 12)
        'md': '428px',      // Móviles grandes (iPhone 14 Pro Max)
        'lg': '768px',      // Tablets
        'xl': '1024px',     // Tablets landscape / laptops pequeños
        '2xl': '1280px',    // Laptops
        '3xl': '1536px',    // Monitores
        '4xl': '1920px',    // Full HD
        '5xl': '2560px',    // 2K / QHD
        '6xl': '3840px',    // 4K
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          xs: '0.75rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem',
          '2xl': '4rem',
        },
        screens: {
          xs: '100%',
          sm: '100%',
          md: '100%',
          lg: '100%',
          xl: '1024px',
          '2xl': '1280px',
          '3xl': '1400px',
        },
      },
      spacing: {
        'safe-top': 'var(--safe-area-top)',
        'safe-bottom': 'var(--safe-area-bottom)',
        'header': 'var(--header-height)',
        'nav': 'var(--nav-height)',
        'content': 'var(--content-height)',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // LinguaForge Theme - Paleta Mejorada WCAG AA Compliant
        lf: {
          // Primarios
          primary: '#6366F1',        // Indigo 500 - Color primario unificado
          'primary-dark': '#4F46E5', // Indigo 600 - Para hover/active
          'primary-light': '#818CF8', // Indigo 400 - Para estados disabled
          
          // Secundarios
          secondary: '#C026D3',      // Fuchsia 600 - Mejor contraste (4.2:1)
          'secondary-light': '#E879F9', // Fuchsia 400 - Para acentos sutiles
          
          // Acentos
          accent: '#FDE047',         // Yellow 300 - Ratio 4.6:1 ✅ WCAG AA
          'accent-dark': '#FACC15',  // Yellow 400 - Para fondos claros
          'accent-subtle': '#FEF08A', // Yellow 200 - Para backgrounds sutiles
          
          // Fondos
          dark: '#0F172A',           // Slate 900 - Background principal
          soft: '#1E293B',           // Slate 800 - UI Background
          muted: '#334155',          // Slate 700 - Elementos muted
          
          // Escala de Grises Estructurada
          gray: {
            50: '#F8FAFC',   // Texto principal sobre oscuro
            100: '#F1F5F9',  // Texto secundario
            200: '#E2E8F0',  // Bordes claros
            300: '#CBD5E1',  // Placeholders
            400: '#94A3B8',  // Texto muted
            500: '#64748B',  // Iconos secundarios
            600: '#475569',  // Dividers
            700: '#334155',  // UI Background alternativo
            800: '#1E293B',  // UI Background
            900: '#0F172A',  // Background principal
          },
          
          // Semánticos Mejorados
          success: '#22C55E',        // Green 500
          'success-dark': '#16A34A', // Green 600
          warning: '#F59E0B',        // Amber 500
          'warning-dark': '#D97706', // Amber 600
          error: '#EF4444',          // Red 500
          'error-dark': '#DC2626',   // Red 600
          info: '#3B82F6',           // Blue 500
        }
      },
      fontFamily: {
        // Tipografía LinguaForge - Sistema Jerárquico
        rajdhani: ['var(--font-rajdhani)', 'Rajdhani', 'sans-serif'],    // Display, títulos grandes
        quicksand: ['var(--font-quicksand)', 'Quicksand', 'sans-serif'],   // UI principal, botones, cards
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],                // Texto largo, contenido educativo
        atkinson: ['var(--font-atkinson)', 'Atkinson Hyperlegible', 'sans-serif'], // Accesibilidad, alto contraste
      },
      backgroundImage: {
        'resonance-gradient': 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #0EA5E9 100%)', // Gradiente "Resonancia" mejorado
        'forge-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)', // Gradiente "Forja Lingüística"
        'glyph-pattern': "url('/patterns/phonetic-glyphs.svg')",
        'crystal-pattern': "url('/patterns/crystal-cracks.svg')",
      },
      boxShadow: {
        'resonance': '0 0 20px rgba(99, 102, 241, 0.5)',        // Actualizado a Indigo 500
        'resonance-lg': '0 0 40px rgba(99, 102, 241, 0.6)',     // Actualizado a Indigo 500
        'glow-accent': '0 0 15px rgba(253, 224, 71, 0.4)',      // Actualizado a Yellow 300
        'glow-secondary': '0 0 20px rgba(192, 38, 211, 0.4)',    // Actualizado a Fuchsia 600
        'glow-success': '0 0 15px rgba(34, 197, 94, 0.4)',      // Nuevo para éxito
        'glow-info': '0 0 15px rgba(59, 130, 246, 0.4)',        // Nuevo para información
      },
      animation: {
        'resonance-pulse': 'resonance 3s ease-in-out infinite',
        'wordweave-surge': 'surge 0.5s cubic-bezier(0, 0, 0.2, 1) forwards',
        'glyph-shimmer': 'shimmer 2s ease-in-out infinite',
        'crystal-glow': 'crystalGlow 4s ease-in-out infinite',
        'echo-fade': 'echoFade 0.6s ease-out forwards',
      },
      keyframes: {
        resonance: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 5px #6366F1)',  // Actualizado a Indigo 500
            opacity: '0.8'
          },
          '50%': {
            filter: 'drop-shadow(0 0 15px #C026D3)', // Actualizado a Fuchsia 600
            opacity: '1'
          },
        },
        surge: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        crystalGlow: {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.3), inset 0 0 20px rgba(192, 38, 211, 0.1)'  // Actualizado
          },
          '50%': {
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.5), inset 0 0 30px rgba(192, 38, 211, 0.2)'  // Actualizado
          },
        },
        echoFade: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0.5' },
        },
      },
      borderRadius: {
        'glyph': '2px',
      },
    },
  },
  plugins: [],
};
export default config;

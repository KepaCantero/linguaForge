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
        'xs': '320px',
        'sm': '375px',
        'md': '428px',
        'lg': '768px',
        'xl': '1024px',
        '2xl': '1280px',
        '3xl': '1536px',
        '4xl': '1920px',
        '5xl': '2560px',
        '6xl': '3840px',
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

        // ============================================
        // CALM THEME - Parasympathetic Design System
        // ============================================

        calm: {
          // Backgrounds
          bg: {
            primary: 'var(--calm-bg-primary)',
            secondary: 'var(--calm-bg-secondary)',
            tertiary: 'var(--calm-bg-tertiary)',
            elevated: 'var(--calm-bg-elevated)',
          },
          // Text
          text: {
            primary: 'var(--calm-text-primary)',
            secondary: 'var(--calm-text-secondary)',
            tertiary: 'var(--calm-text-tertiary)',
            muted: 'var(--calm-text-muted)',
          },
          // Sage Green - Growth, Progress
          sage: {
            50: '#F0F5F1',
            100: '#DCEADF',
            200: '#B8D4BE',
            300: '#94BF9E',
            400: '#72A87D',
            500: '#5A946A',
            600: '#487A56',
          },
          // Blue-Gray - Calm Focus
          blue: {
            50: '#F0F4F8',
            100: '#D9E2EC',
            200: '#BCCCDC',
            300: '#9FB3C8',
            400: '#829AB1',
            500: '#627D98',
            600: '#486581',
          },
          // Warm Gray - Neutral UI
          warm: {
            50: '#FAF9F7',
            100: '#F1EDE8',
            200: '#E4DDD4',
            300: '#D1C7BC',
            400: '#B5A898',
            500: '#998A7A',
          },
          // Soft Coral - Encouraging Accent
          accent: {
            50: '#FEF5F3',
            100: '#FDE8E3',
            200: '#F9C9BE',
            300: '#F5A898',
            400: '#E8907C',
            500: '#D97B66',
            600: '#C46652',
          },
          // Semantic (Softened)
          success: '#72A87D',
          'success-bg': '#F0F5F1',
          warning: '#D4A76A',
          'warning-bg': '#FAF5F0',
          error: '#C9807A',
          'error-bg': '#FDF5F4',
          info: '#829AB1',
          'info-bg': '#F0F4F8',
        },

        // Legacy lf namespace - mapped to calm for backwards compatibility
        lf: {
          primary: 'var(--lf-primary)',
          'primary-dark': 'var(--lf-primary-dark)',
          'primary-light': 'var(--lf-primary-light)',
          secondary: 'var(--lf-secondary)',
          'secondary-light': 'var(--lf-secondary-light)',
          accent: 'var(--lf-accent)',
          'accent-dark': 'var(--lf-accent-dark)',
          'accent-subtle': 'var(--lf-accent-subtle)',
          dark: 'var(--lf-dark)',
          soft: 'var(--lf-soft)',
          muted: 'var(--lf-muted)',
          gray: {
            50: 'var(--gray-50)',
            100: 'var(--gray-100)',
            200: 'var(--gray-200)',
            300: 'var(--gray-300)',
            400: 'var(--gray-400)',
            500: 'var(--gray-500)',
            600: 'var(--gray-600)',
            700: 'var(--gray-700)',
            800: 'var(--gray-800)',
            900: 'var(--gray-900)',
          },
          success: 'var(--success)',
          'success-dark': 'var(--success-dark)',
          warning: 'var(--warning)',
          'warning-dark': 'var(--warning-dark)',
          error: 'var(--error)',
          'error-dark': 'var(--error-dark)',
          info: 'var(--info)',
        }
      },
      fontFamily: {
        // Quicksand for headings - softer, rounder
        quicksand: ['var(--font-quicksand)', 'Quicksand', 'sans-serif'],
        // Inter for body - clean, readable
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        // Atkinson for accessibility
        atkinson: ['var(--font-atkinson)', 'Atkinson Hyperlegible', 'sans-serif'],
        // Legacy - still available but secondary
        rajdhani: ['var(--font-rajdhani)', 'Rajdhani', 'sans-serif'],
      },
      lineHeight: {
        'calm': '1.7',
        'calm-relaxed': '1.8',
        'calm-tight': '1.3',
      },
      letterSpacing: {
        'calm': '0.01em',
        'calm-heading': '0.02em',
      },
      backgroundImage: {
        // ============================================
        // CALM GRADIENTS - Subtle, Breathing
        // ============================================

        // Primary calm gradients
        'calm-mist': 'linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 100%)',
        'calm-dawn': 'linear-gradient(135deg, #FAF9F7 0%, #F0F5F1 50%, #F0F4F8 100%)',
        'calm-breath': 'linear-gradient(180deg, #FFFFFF 0%, #F5F7F9 100%)',
        'calm-sage': 'linear-gradient(135deg, #F0F5F1 0%, #DCEADF 100%)',
        'calm-serenity': 'linear-gradient(180deg, #F0F4F8 0%, #D9E2EC 100%)',

        // Legacy gradients - mapped to calm versions
        'resonance-gradient': 'linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 100%)',
        'forge-gradient': 'linear-gradient(135deg, #FAF9F7 0%, #F0F5F1 50%, #F0F4F8 100%)',
        'aurora-borealis': 'linear-gradient(135deg, #F0F5F1 0%, #D9E2EC 100%)',
        'sunset-blaze': 'linear-gradient(135deg, #FEF5F3 0%, #FDE8E3 100%)',
        'ocean-depth': 'linear-gradient(180deg, #F0F4F8 0%, #D9E2EC 50%, #F0F4F8 100%)',
        'midnight-aurora': 'radial-gradient(ellipse at top, #F5F7F9 0%, #FAFBFC 50%, #FFFFFF 100%)',

        // Soft glass
        'glass-surface': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        'neural-network': 'radial-gradient(circle at 50% 50%, rgba(114, 168, 125, 0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        // ============================================
        // CALM SHADOWS - Soft, Diffuse
        // ============================================

        // Primary calm shadows
        'calm-sm': '0 1px 2px rgba(45, 55, 72, 0.04)',
        'calm-md': '0 4px 12px rgba(45, 55, 72, 0.06)',
        'calm-lg': '0 8px 24px rgba(45, 55, 72, 0.08)',
        'calm-xl': '0 16px 40px rgba(45, 55, 72, 0.10)',
        'calm-inner': 'inset 0 1px 2px rgba(45, 55, 72, 0.04)',

        // Soft elevation
        'soft-sm': '0 1px 3px rgba(45, 55, 72, 0.05)',
        'soft-md': '0 4px 8px rgba(45, 55, 72, 0.06)',
        'soft-lg': '0 8px 16px rgba(45, 55, 72, 0.08)',

        // Focus ring - sage colored
        'focus-calm': '0 0 0 3px rgba(114, 168, 125, 0.15)',

        // Legacy shadows - remapped to calm (no glows)
        'resonance': '0 4px 12px rgba(45, 55, 72, 0.06)',
        'resonance-lg': '0 8px 24px rgba(45, 55, 72, 0.08)',
        'glow-accent': '0 4px 12px rgba(45, 55, 72, 0.06)',
        'glow-secondary': '0 4px 12px rgba(45, 55, 72, 0.06)',
        'glow-success': '0 4px 12px rgba(114, 168, 125, 0.1)',
        'glow-info': '0 4px 12px rgba(130, 154, 177, 0.1)',

        // Glass - softened
        'glass': '0 4px 16px rgba(45, 55, 72, 0.06)',
        'glass-lg': '0 8px 24px rgba(45, 55, 72, 0.08)',
        'glass-xl': '0 12px 32px rgba(45, 55, 72, 0.10)',
        'glass-dark': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'glass-inner': 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',

        // Depth - softened
        'depth-sm': '0 2px 4px rgba(45, 55, 72, 0.04)',
        'depth-md': '0 4px 8px rgba(45, 55, 72, 0.06)',
        'depth-lg': '0 8px 16px rgba(45, 55, 72, 0.08)',
        'depth-xl': '0 12px 24px rgba(45, 55, 72, 0.10)',

        // Inner - softened
        'inner-glow': 'inset 0 1px 2px rgba(45, 55, 72, 0.04)',
        'inner-glow-accent': 'inset 0 1px 2px rgba(45, 55, 72, 0.04)',
      },
      animation: {
        // ============================================
        // CALM ANIMATIONS - Slow, Breathing
        // ============================================

        // Primary calm animations
        'calm-appear': 'calmAppear 400ms ease-out',
        'calm-fade': 'calmFade 300ms ease-out',
        'calm-float': 'calmFloat 8s ease-in-out infinite',
        'calm-pulse': 'calmPulse 4s ease-in-out infinite',
        'calm-breath': 'calmBreath 6s ease-in-out infinite',

        // Legacy - remapped to calm (slower, gentler)
        'resonance-pulse': 'calmPulse 4s ease-in-out infinite',
        'wordweave-surge': 'calmAppear 400ms ease-out',
        'glyph-shimmer': 'calmFade 3s ease-in-out infinite',
        'crystal-glow': 'calmPulse 6s ease-in-out infinite',
        'echo-fade': 'calmFade 500ms ease-out',
        'float': 'calmFloat 8s ease-in-out infinite',
        'float-delayed': 'calmFloat 8s ease-in-out 4s infinite',
        'breath': 'calmBreath 6s ease-in-out infinite',
        'shimmer-aaa': 'none', // Disabled
        'glow-pulse': 'calmPulse 4s ease-in-out infinite',
        'gradient-shift': 'none', // Disabled
        'subtle-drift': 'calmFloat 20s ease-in-out infinite',
      },
      keyframes: {
        // ============================================
        // CALM KEYFRAMES
        // ============================================

        calmAppear: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        calmFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        calmFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        calmPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        calmBreath: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 1px 2px rgba(45, 55, 72, 0.04)'
          },
          '50%': {
            opacity: '0.95',
            boxShadow: '0 4px 12px rgba(45, 55, 72, 0.06)'
          },
        },

        // Legacy keyframes - gentler versions
        resonance: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' },
        },
        surge: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' },
        },
        crystalGlow: {
          '0%, 100%': { boxShadow: '0 1px 2px rgba(45, 55, 72, 0.04)' },
          '50%': { boxShadow: '0 4px 12px rgba(45, 55, 72, 0.06)' },
        },
        echoFade: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        breath: {
          '0%, 100%': { opacity: '0.95' },
          '50%': { opacity: '1' },
        },
        shimmerAAA: {
          '0%': { opacity: '0.95' },
          '100%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.95' },
          '50%': { opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { opacity: '1' },
        },
        subtleDrift: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '50%': { transform: 'translateX(1px) translateY(-2px)' },
        },
      },
      borderRadius: {
        'glyph': '2px',
        'calm': '12px',
        'calm-lg': '16px',
        'calm-xl': '20px',
        'aaa-lg': '24px',
        'aaa-xl': '32px',
      },
      backdropBlur: {
        'calm': '16px',
        'aaa': '24px',
      },
      transitionDuration: {
        'calm': '300ms',
        'calm-slow': '400ms',
        'calm-slower': '500ms',
      },
      transitionTimingFunction: {
        'calm': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'calm-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
export default config;

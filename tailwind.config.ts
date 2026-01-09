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
        // LinguaForge AAA Theme - Paleta Premium
        lf: {
          primary: '#6366F1',
          'primary-dark': '#4F46E5',
          'primary-light': '#818CF8',
          secondary: '#C026D3',
          'secondary-light': '#E879F9',
          accent: '#FDE047',
          'accent-dark': '#FACC15',
          'accent-subtle': '#FEF08A',
          dark: '#0F172A',
          soft: '#1E293B',
          muted: '#334155',
          gray: {
            50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
            400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
            800: '#1E293B', 900: '#0F172A',
          },
          success: '#22C55E', 'success-dark': '#16A34A',
          warning: '#F59E0B', 'warning-dark': '#D97706',
          error: '#EF4444', 'error-dark': '#DC2626',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        rajdhani: ['var(--font-rajdhani)', 'Rajdhani', 'sans-serif'],
        quicksand: ['var(--font-quicksand)', 'Quicksand', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        atkinson: ['var(--font-atkinson)', 'Atkinson Hyperlegible', 'sans-serif'],
      },
      backgroundImage: {
        // AAA Gradients - Premium & Atmospheric
        'resonance-gradient': 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #0EA5E9 100%)',
        'forge-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        'aurora-borealis': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'sunset-blaze': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'ocean-depth': 'linear-gradient(180deg, #0F172A 0%, #1e3a8a 50%, #0F172A 100%)',
        'midnight-aurora': 'radial-gradient(ellipse at top, #1e1b4b 0%, #0F172A 50%, #000000 100%)',
        'glass-surface': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'neural-network': 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
      },
      boxShadow: {
        // AAA Effects - Depth & Atmosphere
        'resonance': '0 0 20px rgba(99, 102, 241, 0.5)',
        'resonance-lg': '0 0 40px rgba(99, 102, 241, 0.6)',
        'glow-accent': '0 0 15px rgba(253, 224, 71, 0.4)',
        'glow-secondary': '0 0 20px rgba(192, 38, 211, 0.4)',
        'glow-success': '0 0 15px rgba(34, 197, 94, 0.4)',
        'glow-info': '0 0 15px rgba(59, 130, 246, 0.4)',
        // Glassmorphism
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-xl': '0 20px 40px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-inner': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
        // 3D Depth
        'depth-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
        'depth-md': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'depth-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'depth-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 12px 24px -8px rgba(0, 0, 0, 0.3)',
        // Premium Glow
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.3)',
        'inner-glow-accent': 'inset 0 0 20px rgba(253, 224, 71, 0.3)',
      },
      animation: {
        'resonance-pulse': 'resonance 3s ease-in-out infinite',
        'wordweave-surge': 'surge 0.5s cubic-bezier(0, 0, 0.2, 1) forwards',
        'glyph-shimmer': 'shimmer 2s ease-in-out infinite',
        'crystal-glow': 'crystalGlow 4s ease-in-out infinite',
        'echo-fade': 'echoFade 0.6s ease-out forwards',
        // AAA Animations
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'breath': 'breath 4s ease-in-out infinite',
        'shimmer-aaa': 'shimmerAAA 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'subtle-drift': 'subtleDrift 20s ease-in-out infinite',
      },
      keyframes: {
        resonance: {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px #6366F1)', opacity: '0.8' },
          '50%': { filter: 'drop-shadow(0 0 15px #C026D3)', opacity: '1' },
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
          '0%, 100%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.3), inset 0 0 20px rgba(192, 38, 211, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.5), inset 0 0 30px rgba(192, 38, 211, 0.2)' },
        },
        echoFade: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0.5' },
        },
        // AAA Keyframes
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        shimmerAAA: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        subtleDrift: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(2px) translateY(-2px)' },
          '50%': { transform: 'translateX(0px) translateY(-4px)' },
          '75%': { transform: 'translateX(-2px) translateY(-2px)' },
        },
      },
      borderRadius: {
        'glyph': '2px',
        'aaa-lg': '24px',
        'aaa-xl': '32px',
      },
      backdropBlur: {
        'aaa': '24px',
      },
    },
  },
  plugins: [],
};
export default config;

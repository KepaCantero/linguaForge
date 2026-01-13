import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
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
        // ============================================
        // LINGUAFORGE AAA THEME SYSTEM
        // Light/Dark Mode with WCAG AA Compliance
        // ============================================

        // === BACKGROUND (60%) ===
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
        },

        // === TEXT COLORS ===
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)',
        },

        // === ACCENT PRIMARY (10%) - EMERALD ===
        accent: {
          50: 'var(--accent-50)',
          100: 'var(--accent-100)',
          200: 'var(--accent-200)',
          300: 'var(--accent-300)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
        },

        // === SECONDARY - SKY BLUE ===
        sky: {
          50: 'var(--sky-50)',
          100: 'var(--sky-100)',
          200: 'var(--sky-200)',
          300: 'var(--sky-300)',
          400: 'var(--sky-400)',
          500: 'var(--sky-500)',
          600: 'var(--sky-600)',
          700: 'var(--sky-700)',
        },

        // === ACCENT - WARM AMBER ===
        amber: {
          50: 'var(--amber-50)',
          100: 'var(--amber-100)',
          200: 'var(--amber-200)',
          300: 'var(--amber-300)',
          400: 'var(--amber-400)',
          500: 'var(--amber-500)',
          600: 'var(--amber-600)',
        },

        // === SEMANTIC COLORS (WCAG AA Compliant) ===
        semantic: {
          success: {
            DEFAULT: 'var(--semantic-success)',
            bg: 'var(--semantic-success-bg)',
            text: 'var(--semantic-success-text)',
          },
          error: {
            DEFAULT: 'var(--semantic-error)',
            bg: 'var(--semantic-error-bg)',
            text: 'var(--semantic-error-text)',
          },
          warning: {
            DEFAULT: 'var(--semantic-warning)',
            bg: 'var(--semantic-warning-bg)',
            text: 'var(--semantic-warning-text)',
          },
          info: {
            DEFAULT: 'var(--semantic-info)',
            bg: 'var(--semantic-info-bg)',
            text: 'var(--semantic-info-text)',
          },
        },

        // === BORDER COLORS ===
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },

        // ============================================
        // LEGACY CALM THEME (Backward Compatibility)
        // Mapped to new AAA system
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
          // Sage Green - Growth, Progress (Mapped to accent)
          sage: {
            50: 'var(--accent-50)',
            100: 'var(--accent-100)',
            200: 'var(--accent-200)',
            300: 'var(--accent-300)',
            400: 'var(--accent-400)',
            500: 'var(--accent-500)',
            600: 'var(--accent-600)',
          },
          // Blue-Gray - Calm Focus (Mapped to sky)
          blue: {
            50: 'var(--sky-50)',
            100: 'var(--sky-100)',
            200: 'var(--sky-200)',
            300: 'var(--sky-300)',
            400: 'var(--sky-400)',
            500: 'var(--sky-500)',
            600: 'var(--sky-600)',
          },
          // Warm Gray - Neutral UI (Mapped to borders)
          warm: {
            50: 'var(--bg-elevated)',
            100: 'var(--border-subtle)',
            200: 'var(--border-default)',
          },
          // Soft Coral - Encouraging Accent (Mapped to amber)
          accent: {
            50: 'var(--amber-50)',
            100: 'var(--amber-100)',
            200: 'var(--amber-200)',
            300: 'var(--amber-300)',
            400: 'var(--amber-400)',
            500: 'var(--amber-500)',
            600: 'var(--amber-600)',
          },
          // Semantic (Mapped to new system)
          success: 'var(--semantic-success)',
          'success-bg': 'var(--semantic-success-bg)',
          warning: 'var(--semantic-warning)',
          'warning-bg': 'var(--semantic-warning-bg)',
          error: 'var(--semantic-error)',
          'error-bg': 'var(--semantic-error-bg)',
          info: 'var(--semantic-info)',
          'info-bg': 'var(--semantic-info-bg)',
        },

        // Legacy lf namespace - mapped to new system
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
        quicksand: ['var(--font-quicksand)', 'Quicksand', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        atkinson: ['var(--font-atkinson)', 'Atkinson Hyperlegible', 'sans-serif'],
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
        // Primary gradients using CSS variables
        'calm-mist': 'var(--gradient-mist)',
        'calm-dawn': 'var(--gradient-dawn)',
        'calm-breath': 'var(--gradient-breath)',
        'calm-sage': 'var(--gradient-sage)',
        'calm-serenity': 'var(--gradient-mist)',

        // Legacy gradients
        'resonance-gradient': 'var(--gradient-mist)',
        'forge-gradient': 'var(--gradient-dawn)',
        'aurora-borealis': 'var(--gradient-sage)',
        'sunset-blaze': 'linear-gradient(135deg, var(--amber-50) 0%, var(--amber-100) 100%)',
        'ocean-depth': 'linear-gradient(180deg, var(--sky-50) 0%, var(--sky-100) 50%, var(--sky-50) 100%)',
        'midnight-aurora': 'radial-gradient(ellipse at top, var(--bg-elevated) 0%, var(--bg-primary) 50%, var(--bg-secondary) 100%)',

        'glass-surface': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        'neural-network': 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        // Primary calm shadows using CSS variables
        'calm-sm': 'var(--shadow-soft-sm)',
        'calm-md': 'var(--shadow-soft-md)',
        'calm-lg': 'var(--shadow-soft-lg)',
        'calm-xl': 'var(--shadow-soft-xl)',
        'calm-inner': 'var(--shadow-inner-soft)',

        // Soft elevation
        'soft-sm': 'var(--shadow-soft-sm)',
        'soft-md': 'var(--shadow-soft-md)',
        'soft-lg': 'var(--shadow-soft-lg)',

        // Focus ring
        'focus-calm': '0 0 0 3px var(--accent-200)',

        // Legacy shadows
        'resonance': 'var(--shadow-soft-md)',
        'resonance-lg': 'var(--shadow-soft-lg)',
        'glow-accent': 'var(--shadow-soft-md)',
        'glow-secondary': 'var(--shadow-soft-md)',
        'glow-success': '0 4px 12px rgba(16, 185, 129, 0.15)',
        'glow-info': '0 4px 12px rgba(14, 165, 233, 0.15)',

        // Glass
        'glass': '0 4px 16px rgba(0, 0, 0, 0.05)',
        'glass-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'glass-xl': '0 12px 32px rgba(0, 0, 0, 0.10)',
        'glass-dark': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'glass-inner': 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',

        // Depth
        'depth-sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'depth-md': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'depth-lg': '0 8px 16px rgba(0, 0, 0, 0.10)',
        'depth-xl': '0 12px 24px rgba(0, 0, 0, 0.12)',

        // Inner
        'inner-glow': 'var(--shadow-inner-soft)',
        'inner-glow-accent': 'var(--shadow-inner-soft)',
      },
      animation: {
        'calm-appear': 'calmAppear 400ms ease-out',
        'calm-fade': 'calmFade 300ms ease-out',
        'calm-float': 'calmFloat 8s ease-in-out infinite',
        'calm-pulse': 'calmPulse 4s ease-in-out infinite',
        'calm-breath': 'calmBreath 6s ease-in-out infinite',

        // Legacy
        'resonance-pulse': 'calmPulse 4s ease-in-out infinite',
        'wordweave-surge': 'calmAppear 400ms ease-out',
        'glyph-shimmer': 'calmFade 3s ease-in-out infinite',
        'crystal-glow': 'calmPulse 6s ease-in-out infinite',
        'echo-fade': 'calmFade 500ms ease-out',
        'float': 'calmFloat 8s ease-in-out infinite',
        'float-delayed': 'calmFloat 8s ease-in-out 4s infinite',
        'breath': 'calmBreath 6s ease-in-out infinite',
        'shimmer-aaa': 'none',
        'glow-pulse': 'calmPulse 4s ease-in-out infinite',
        'gradient-shift': 'none',
        'subtle-drift': 'calmFloat 20s ease-in-out infinite',
      },
      keyframes: {
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
            boxShadow: 'var(--shadow-soft-sm)'
          },
          '50%': {
            opacity: '0.95',
            boxShadow: 'var(--shadow-soft-md)'
          },
        },

        // Legacy keyframes
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
          '0%, 100%': { boxShadow: 'var(--shadow-soft-sm)' },
          '50%': { boxShadow: 'var(--shadow-soft-md)' },
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

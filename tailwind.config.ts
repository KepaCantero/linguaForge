import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // LinguaForge Theme
        lf: {
          primary: '#7E22CE',   // Purple Power
          secondary: '#D946EF', // Fuchsia Glow
          accent: '#FACC15',    // Gold Resonance
          dark: '#0F172A',      // Void Background
          soft: '#1E293B',      // UI Background
          muted: '#334155',     // Muted elements
        }
      },
      fontFamily: {
        rajdhani: ['var(--font-rajdhani)', 'Rajdhani', 'sans-serif'],
        atkinson: ['var(--font-atkinson)', 'Atkinson Hyperlegible', 'sans-serif'],
      },
      backgroundImage: {
        'resonance-gradient': 'linear-gradient(135deg, #7E22CE 0%, #D946EF 100%)',
        'glyph-pattern': "url('/patterns/phonetic-glyphs.svg')",
        'crystal-pattern': "url('/patterns/crystal-cracks.svg')",
      },
      boxShadow: {
        'resonance': '0 0 20px rgba(126, 34, 206, 0.5)',
        'resonance-lg': '0 0 40px rgba(126, 34, 206, 0.6)',
        'glow-accent': '0 0 15px rgba(250, 204, 21, 0.4)',
        'glow-secondary': '0 0 20px rgba(217, 70, 239, 0.4)',
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
            filter: 'drop-shadow(0 0 5px #7E22CE)',
            opacity: '0.8'
          },
          '50%': {
            filter: 'drop-shadow(0 0 15px #D946EF)',
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
            boxShadow: '0 0 10px rgba(126, 34, 206, 0.3), inset 0 0 20px rgba(217, 70, 239, 0.1)'
          },
          '50%': {
            boxShadow: '0 0 25px rgba(126, 34, 206, 0.5), inset 0 0 30px rgba(217, 70, 239, 0.2)'
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

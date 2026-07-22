/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Dark Palette ───────────────────────────────────────────────────
        obsidian: {
          900: '#030508',
          800: '#07090F',
          700: '#0D1117',
          600: '#131825',
          500: '#1A2332',
        },
        // ── Gold Palette (God of War / Clair-Obscur) ──────────────────────
        ember: {
          100: '#FFF8E7',
          200: '#FFE9A0',
          300: '#FFD700',
          400: '#C89B3C',
          500: '#9A6E00',
          600: '#5C3D00',
        },
        // ── Accent Runes ──────────────────────────────────────────────────
        rune: {
          blue: '#4FC3F7',
          red: '#FF4655',
          purple: '#7C3AED',
          teal: '#00D4AA',
          orange: '#FF6B35',
        },
        // ── Blood ─────────────────────────────────────────────────────────
        blood: {
          dark: '#2D0A0A',
          mid: '#8B0000',
          light: '#CC2222',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
        rune: ['"Uncial Antiqua"', 'cursive'],
      },
      backgroundImage: {
        'rune-gradient': 'linear-gradient(135deg, #030508 0%, #0D1117 50%, #07090F 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C89B3C 0%, #FFD700 50%, #9A6E00 100%)',
        'ember-glow': 'radial-gradient(ellipse at center, rgba(200,155,60,0.15) 0%, transparent 70%)',
        'blood-vignette': 'radial-gradient(ellipse at center, transparent 40%, rgba(45,10,10,0.8) 100%)',
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'rune-glow': 'runeGlow 4s ease-in-out infinite',
        'scan-line': 'scanLine 8s linear infinite',
        'ember-float': 'emberFloat 6s ease-in-out infinite',
        'title-reveal': 'titleReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
          '75%': { opacity: '0.95' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(200,155,60,0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(200,155,60,0.4)' },
        },
        runeGlow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(200,155,60,0.5)' },
          '50%': { textShadow: '0 0 20px rgba(255,215,0,1), 0 0 40px rgba(200,155,60,0.6)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        emberFloat: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: '1' },
        },
        titleReveal: {
          '0%': { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          '100%': { clipPath: 'inset(0 0% 0 0)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'game': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'dramatic': 'cubic-bezier(0.77, 0, 0.18, 1)',
      },
      boxShadow: {
        'ember': '0 0 20px rgba(200,155,60,0.5), 0 0 60px rgba(200,155,60,0.2)',
        'ember-strong': '0 0 30px rgba(255,215,0,0.8), 0 0 100px rgba(200,155,60,0.4)',
        'rune-inner': 'inset 0 0 30px rgba(200,155,60,0.2)',
        'card': '0 25px 50px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,155,60,0.1)',
      },
    },
  },
  plugins: [],
};

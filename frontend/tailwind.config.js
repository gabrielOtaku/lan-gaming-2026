/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lanDark: "#0a0a0a", // Noir abyssal
        lanGold: "#d4af37", // Or divin (God of War)
        lanAccent: "#c21f1f", // Rouge agressif (Gaming/LoL)
        lanGlow: "rgba(212, 175, 55, 0.3)",
      },
      fontFamily: {
        gaming: ['"Cinzel"', "serif"], // Font épique type GOW
        sans: ['"Inter"', "sans-serif"],
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(212, 175, 55, 0.5)",
        "glow-red": "0 0 20px rgba(194, 31, 31, 0.6)",
      },
    },
  },
  plugins: [],
};

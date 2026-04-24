import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidad Candás
        "candas-rojo":       "#c1121f",
        "candas-rojoOscuro": "#8b0a17",
        "candas-negro":      "#1a1a1a",
        "candas-crema":      "#fff5f5",
        // Fondo base — negro suavizado, con capas diferenciadas
        "site":      "#0f0f0f",  // fondo base (antes #0a0a0a — ahora más suave)
        "surface":   "#161616",  // primera capa sobre el fondo
        "surface-2": "#1c1c1c",  // tarjetas, cards
        "surface-3": "#222222",  // elementos elevados, modales
        "surface-4": "#2a2a2a",  // hover states, elementos activos
      },
      fontFamily: {
        sans:    ["var(--font-inter)",   "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 7rem)",   { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2rem, 5vw, 4.5rem)",  { lineHeight: "1",    letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.5rem, 3vw, 2.5rem)",{ lineHeight: "1.1",  letterSpacing: "-0.02em" }],
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" },                              "100%": { opacity: "1" } },
        fadeInUp:  { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-dark":   "linear-gradient(180deg, #0f0f0f 0%, #161616 100%)",
        "gradient-hero":   "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 60%, #0f0f0f 100%)",
        "gradient-rojo":   "linear-gradient(135deg, #c1121f 0%, #8b0a17 100%)",
      },
      boxShadow: {
        "glow-red":    "0 0 40px rgba(193,18,31,0.3)",
        "glow-red-sm": "0 0 20px rgba(193,18,31,0.2)",
        "card":        "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover":  "0 4px 12px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
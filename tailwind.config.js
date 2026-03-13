/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6D28D9", // Roxo Vibrante (Violet 700)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#000000", // Preto Puro
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3F4F6", // Cinza Claro (Retornando ao neutro)
          foreground: "#6B7280", // Cinza Médio
        },
        accent: {
          DEFAULT: "#4C1D95", // Roxo Muito Escuro (Violet 900)
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "#E5E7EB", // Cinza Claro para bordas (neutro)
        input: "#E5E7EB",
        ring: "#6D28D9", // Roxo Vibrante
        background: "#FFFFFF",
        foreground: "#000000", // Preto Puro para texto
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      animation: {
        scroll: 'scroll 30s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

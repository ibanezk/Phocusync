/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aquí le decimos que busque en tu HTML
  content: ["./*.html", "./src/**/*.{html,js}"],
  theme: {
    extend: {
      // Definimos tus fuentes Premium
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Inter", "sans-serif"],
        molengo: ["Molengo", "sans-serif"],
      },
      // Añadimos el color oscuro de fondo por si lo quieres usar como clase
      colors: {
        dark: "#0A0A0A",
        gold: "#C5A059",
      },
    },
  },
  plugins: [],
};

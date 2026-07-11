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
        molengo: ['"Molengo"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-orange": "#FF4D00",
      },
      fontFamily: {
        molengo: ["Molengo", "sans-serif"],
      },
    },
  },
  plugins: [],
};

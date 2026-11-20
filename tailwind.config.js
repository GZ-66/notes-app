/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        notion: {
          dark: '#191919',
          darker: '#121212',
          light: '#fbfbfa',
          hoverLight: '#f1f1ef',
          hoverDark: '#2c2c2c',
          borderLight: '#e9e9e8',
          borderDark: '#2f2f2f'
        }
      }
    },
  },
  plugins: [],
}

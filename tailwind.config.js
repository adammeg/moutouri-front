/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    screens: {
      'xs': '420px',  // Extra small screen / phone
      'sm': '640px',  // Small screen / tablet
      'md': '768px',  // Medium screen / laptop
      'lg': '1024px', // Large screen / desktop
      'xl': '1280px', // Extra large screen / wide desktop
      '2xl': '1536px',// 2 Extra large screen / wider desktop
    },
    extend: {
      // Your existing theme extensions...
    },
  },
  plugins: [require("tailwindcss-animate")],
} 
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
        // Light mode defaults (Slate-50 for background, Slate-900 for text)
        background: '#f8fafc', 
        surface: '#ffffff',     
        
        // Dark mode specific colors are handled via "dark:" classes in components,
        // but we define the primary purple here.
        primary: {
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
        }
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
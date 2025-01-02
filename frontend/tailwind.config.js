/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        flip: 'flip 2s infinite', // Name of the animation with duration and infinite loop
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },  // Initial state
          '50%': { transform: 'rotateY(180deg)' },  // Halfway (flipped)
          '100%': { transform: 'rotateY(360deg)' }, // Back to the original state
        },
      },
    },
  },
  plugins: [],
}


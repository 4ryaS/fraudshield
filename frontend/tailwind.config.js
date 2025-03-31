/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom colors for the fraud detection system
        fraud: {
          low: '#22c55e',    // Green
          medium: '#eab308',  // Yellow
          high: '#ef4444',    // Red
        },
      },
    },
  },
  plugins: [],
};
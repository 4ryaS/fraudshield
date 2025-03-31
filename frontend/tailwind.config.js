/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
<<<<<<< HEAD
    extend: {},
  },
  plugins: [],
};
=======
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
>>>>>>> 933d26ab9ab8ab8a4c1f6811ca1d5647cfa57738

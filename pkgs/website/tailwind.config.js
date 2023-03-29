const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // colors: {
    //   ...colors,
    // },
    extend: {
      colors: {
        // primary: colors.indigo,
        // secondary: colors.yellow,
        // neutral: colors.gray,
      },
    },
  },
  plugins: [],
};

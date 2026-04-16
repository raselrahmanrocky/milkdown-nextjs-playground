/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "paper-dark": "#1e293b",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
}

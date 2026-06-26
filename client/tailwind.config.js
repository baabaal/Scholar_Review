/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Aksen tunggal: biru slate. Ganti ke emerald (#059669) untuk nuansa sage.
        accent: { DEFAULT: "#2f6bed", soft: "#eef2ff" },
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        grade: {
          A: "#22c55e", // green
          B: "#3b82f6", // blue
          C: "#eab308", // yellow
          D: "#f97316", // orange
          F: "#ef4444", // red
        },
      },
    },
  },
  plugins: [],
};

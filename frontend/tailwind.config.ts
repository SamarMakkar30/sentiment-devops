import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        muted: "#6F6F6F"
      },
      fontFamily: {
        display: ["\"Instrument Serif\"", "serif"],
        body: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;

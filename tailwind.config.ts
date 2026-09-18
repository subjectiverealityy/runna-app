import type { Config } from "tailwindcss";

// Colour tokens carried over 1:1 from the prototype's design system.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1E2A4A",
        navyDeep: "#141C30",
        amber: "#F2A93B",
        amberDeep: "#C9821A",
        green: "#2E8B63",
        greenBg: "#E7F3EC",
        red: "#B8463C",
        redBg: "#FBEAE8",
        paper: "#FFFFFF",
        card: "#FCF9F1",
        line: "#E4E0D3",
        ink: "#20242C",
        sub: "#6B6F76",
        faint: "#9A9C9F",
      },
    },
  },
  plugins: [],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          ink: "#030406",
          panel: "#0a0d14",
          panel2: "#121722",
          line: "#252936",
          red: "#ff1528",
          crimson: "#b00022",
          smoke: "#070914",
          graphite: "#171b26",
          green: "#20e58a",
          cyan: "#28b8ff",
          amber: "#f7bc42"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 28px rgba(32, 229, 138, 0.18)",
        redglow: "0 0 28px rgba(255, 21, 40, 0.3)"
      }
    }
  },
  plugins: []
};

export default config;

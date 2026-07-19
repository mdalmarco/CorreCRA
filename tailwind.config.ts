import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cra: {
          yellow: "#F5C400",
          black: "#0B0B0B",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;

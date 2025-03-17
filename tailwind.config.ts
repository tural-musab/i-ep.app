import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4a86e8",
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd7ff",
          300: "#8ebeff",
          400: "#599cff",
          500: "#4a86e8",
          600: "#2c5edb",
          700: "#2348bc",
          800: "#233c99",
          900: "#233679",
          950: "#172252",
        },
        secondary: {
          DEFAULT: "#ff9900",
          50: "#fff8eb",
          100: "#ffecc6",
          200: "#ffd988",
          300: "#ffc14a",
          400: "#ffa41c",
          500: "#ff9900",
          600: "#e17a00",
          700: "#bb5802",
          800: "#984608",
          900: "#7c3a0c",
          950: "#481d00",
        },
      },
    },
  },
  plugins: [],
};
export default config; 
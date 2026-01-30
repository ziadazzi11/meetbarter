import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'jungle': "url('/assets/jungle_background.png')",
        'beach': "url('/assets/beach_background.png')",
        'himalaya': "url('/assets/himalaya_background.png')",
        'sacred_geometry': "url('/assets/sacred_geometry_background.png')",
        'farm_night': "url('/assets/farm_night_background.png')",
        'sacred_geometry_4d': "url('/assets/sacred_geometry_4d_background.png')",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;

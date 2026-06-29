import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    // Jalur jika menggunakan folder src/ (Proyek Anda saat ini)
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Jalur jika tanpa folder src/ (Jalur cadangan)
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        telkom: {
          red: "#C8102E",       // Telkom Red resmi kampus
          dark: "#121212",      // Dark Charcoal premium AI
          gray: "#F5F5F7",      // Soft Gray modern
          gold: "#D4AF37",      // Gold Accent mewah
        },
      },
      animation: {
        'batik-loop': 'batikScroll 40s linear infinite',
      },
      keyframes: {
        batikScroll: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
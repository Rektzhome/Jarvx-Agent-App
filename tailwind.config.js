import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      layout: {
        dividerWeight: "1px", 
        disabledOpacity: 0.45, 
        fontSize: {
          tiny: "0.75rem",
          small: "0.875rem",
          medium: "0.9375rem",
          large: "1.125rem",
        },
        lineHeight: {
          tiny: "1rem", 
          small: "1.25rem", 
          medium: "1.5rem", 
          large: "1.75rem", 
        },
        radius: {
          small: "6px", 
          medium: "8px", 
          large: "12px", 
        },
        borderWidth: {
          small: "1px", 
          medium: "1px", 
          large: "2px", 
        },
      },
      themes: {
        light: {
          colors: {
            background: {
              DEFAULT: "#000000"
            },
            content1: {
              DEFAULT: "#111111",
              foreground: "#FFFFFF"
            },
            content2: {
              DEFAULT: "#222222",
              foreground: "#FFFFFF"
            },
            content3: {
              DEFAULT: "#333333",
              foreground: "#FFFFFF"
            },
            content4: {
              DEFAULT: "#444444",
              foreground: "#FFFFFF"
            },
            divider: {
              DEFAULT: "rgba(255, 255, 255, 0.15)"
            },
            focus: {
              DEFAULT: "#00E8FF"
            },
            foreground: {
              DEFAULT: "#FFFFFF"
            },
            primary: {
              50: "#e6f0ff",
              100: "#cce0ff",
              200: "#99c2ff",
              300: "#66a3ff",
              400: "#3385ff",
              500: "#0066ff",
              600: "#0052cc",
              700: "#003d99",
              800: "#002966",
              900: "#001433",
              DEFAULT: "#0066ff",
              foreground: "#000000"
            }
          }
        },
        dark: {
          colors: {
            background: {
              DEFAULT: "#000000"
            },
            content1: {
              DEFAULT: "#111111",
              foreground: "#FFFFFF"
            },
            content2: {
              DEFAULT: "#222222",
              foreground: "#FFFFFF"
            },
            content3: {
              DEFAULT: "#333333",
              foreground: "#FFFFFF"
            },
            content4: {
              DEFAULT: "#444444",
              foreground: "#FFFFFF"
            },
            divider: {
              DEFAULT: "rgba(255, 255, 255, 0.15)"
            },
            focus: {
              DEFAULT: "#00E8FF"
            },
            foreground: {
              DEFAULT: "#FFFFFF"
            },
            primary: {
              50: "#001433",
              100: "#002966",
              200: "#003d99",
              300: "#0052cc",
              400: "#0066ff",
              500: "#3385ff",
              600: "#66a3ff",
              700: "#99c2ff",
              800: "#cce0ff",
              900: "#e6f0ff",
              DEFAULT: "#0066ff",
              foreground: "#000000"
            }
          }
        }
      }
    })
  ]
}
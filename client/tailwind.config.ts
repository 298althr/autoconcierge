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
                burgundy: {
                    DEFAULT: "var(--burgundy)",
                    light: "var(--burgundy-light)",
                    dark: "var(--burgundy-dark)",
                },
                surface: {
                    DEFAULT: "var(--surface)",
                    50: "var(--surface-50)",
                    100: "var(--surface-100)",
                    200: "var(--surface-200)",
                },
                content: {
                    primary: "var(--text-primary)",
                    secondary: "var(--text-secondary)",
                    muted: "var(--text-muted)",
                },
                emerald: "var(--emerald)",
                onyx: {
                    DEFAULT: "#0F172A",
                    light: "#1E293B",
                    dark: "#020617",
                }
            },
            fontFamily: {
                heading: ["var(--font-heading)"],
                subheading: ["var(--font-subheading)"],
                body: ["var(--font-body)"],
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
            animation: {
                'gradient-x': 'gradient-x 15s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;

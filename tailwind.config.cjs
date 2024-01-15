/** @type {import('tailwindcss').Config}*/
const config = {
    content: ['./src/**/*.{html,js,svelte,ts}'],

    theme: {
        extend: {}
    },

    plugins: [require("@tailwindcss/typography"), require("daisyui")],

    daisyui: {
        themes: [
            {
                mytheme: {
                    "primary": "#5863F8",
                    // "primary": "#788ef0",
                    // "secondary": "#64F58D",
                    "secondary": "#A9927D",
                    "accent": "#d5e1e8",
                    "neutral": "#A9927D",
                    "base-100": "#ffffff",
                },
            },

            "light", "dark", "retro"],
    },
};

module.exports = config;

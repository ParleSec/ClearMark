/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        typography: {
          DEFAULT: {
            css: {
              maxWidth: '65ch',
              color: 'var(--tw-prose-body)',
              lineHeight: '1.75',
            },
          },
        },
      },
    },
    plugins: [],
    darkMode: 'class',
  }
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          flow: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          stone: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
          },
        },
        borderRadius: {
          'fluid': '0.5rem 1rem 0.5rem 1rem',
        },
        boxShadow: {
          'flow': '0 4px 12px rgba(14, 165, 233, 0.08), 0 2px 4px rgba(14, 165, 233, 0.04)',
          'flow-lg': '0 8px 20px rgba(14, 165, 233, 0.1), 0 4px 8px rgba(14, 165, 233, 0.06)',
        },
        typography: {
          DEFAULT: {
            css: {
              maxWidth: '65ch',
              color: 'var(--tw-prose-body)',
              lineHeight: '1.75',
            },
          },
        },
        animation: {
          'flow': 'flow 8s ease infinite',
          'ripple': 'ripple 2s linear infinite',
        },
        keyframes: {
          flow: {
            '0%, 100%': { 
              backgroundPosition: '0% 50%',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.08)'
            },
            '50%': { 
              backgroundPosition: '100% 50%',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.18)'
            },
          },
          ripple: {
            '0%': { transform: 'scale(0.95)', opacity: '0.7' },
            '50%': { transform: 'scale(1.05)', opacity: '0.4' },
            '100%': { transform: 'scale(0.95)', opacity: '0.7' },
          },
        },
      },
    },
    plugins: [],
    darkMode: 'class',
  }
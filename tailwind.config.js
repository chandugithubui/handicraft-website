/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c2703e',
          50:  '#fdf6f0',
          100: '#f9e8d8',
          200: '#f2ccb0',
          300: '#e8a87e',
          400: '#db7f4a',
          500: '#c2703e',
          600: '#a85a2e',
          700: '#8b4523',
          800: '#6e341a',
          900: '#4e2412',
        },
        secondary: {
          DEFAULT: '#8b4513',
          50:  '#fdf3ec',
          100: '#f7ddc5',
          200: '#edbb8a',
          300: '#de9050',
          400: '#c9682a',
          500: '#8b4513',
          600: '#73390f',
          700: '#5a2c0c',
          800: '#402008',
          900: '#281404',
        },
        accent: {
          DEFAULT: '#d4af37',
          50:  '#fdf9ec',
          100: '#f9edcb',
          200: '#f0d68c',
          300: '#e6bc4d',
          400: '#d4af37',
          500: '#b8951f',
          600: '#967715',
          700: '#735a0e',
          800: '#503e09',
          900: '#2e2305',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.1)',
        'card':  '0 4px 20px rgba(0,0,0,0.08)',
        'hover': '0 12px 40px rgba(194,112,62,0.2)',
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
  // Allow Tailwind classes alongside existing vanilla CSS
  corePlugins: {
    preflight: false, // Disabled so it doesn't conflict with existing global styles
  },
};

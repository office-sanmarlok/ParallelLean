/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'kb-blue': '#3B82F6',
        'is-purple': '#8B5CF6',
        'build-green': '#10B981',
        'measure-orange': '#F59E0B',
        'learn-red': '#EF4444',
        gold: '#FFD700',
      },
      backgroundImage: {
        'diagonal-lines':
          'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.1) 10px, rgba(0,0,0,.1) 20px)',
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px 10px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 30px 20px rgba(255, 215, 0, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: '#F6F1EB',
        cream: '#F3EDE7',
        beige: '#DCCCBF',
        taupe: '#B8A99A',
        mocha: '#6B4F3B',
        charcoal: '#222222',
        gold: '#B89A6A'
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)'
      }
    }
  },
  plugins: []
}

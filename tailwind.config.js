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
      spacing: {
        'safe': 'env(safe-area-inset-bottom)'
      }
    }
  },
  plugins: []
}

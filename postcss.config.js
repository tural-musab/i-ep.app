module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Enhanced browser support configuration
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'Chrome >= 90',
        'Safari >= 14',
        'iOS >= 14',
        'Edge >= 90',
        'Android >= 8',
        'Samsung >= 12',
        'not IE 11',
        'not op_mini all'
      ],
      // Enable flexbox prefixes for older browsers
      flexbox: 'no-2009',
      // Add vendor prefixes for CSS Grid
      grid: 'autoplace',
      // Support CSS custom properties
      supports: true,
    },
  },
}
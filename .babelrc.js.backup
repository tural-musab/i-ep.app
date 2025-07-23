module.exports = {
  presets: [
    // Next.js preset for React and modern JS features
    ['next/babel'],
    // TypeScript preset for Jest testing
    ['@babel/preset-typescript', {
      allowDeclareFields: true,
      optimizeConstEnums: true,
    }]
  ],
  plugins: [
    // Transform imports for better compatibility
    ['@babel/plugin-transform-modules-commonjs'],
  ],
  env: {
    test: {
      presets: [
        ['next/babel'],
        ['@babel/preset-typescript', {
          allowDeclareFields: true,
          optimizeConstEnums: true,
        }]
      ],
      plugins: [
        ['@babel/plugin-transform-modules-commonjs'],
      ]
    }
  }
};
module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.svelte$': 'svelte-jester'
  },
  setupFilesAfterEnv: [
    '<rootDir>src/setupTests.js'
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(svelte-routing|svelte-spa-router)/)"
  ]
};

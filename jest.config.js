module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.svelte$': 'svelte-jester'
  },
  setupFilesAfterEnv: [
    '<rootDir>src/setupTests.js'
  ]
};

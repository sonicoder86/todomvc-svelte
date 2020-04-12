module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.svelte$': 'svelte-jester'
  },
  moduleFileExtensions: [
    'js',
    'svelte'
  ],
  moduleDirectories: [
    'node_modules'
  ],
  setupFilesAfterEnv: [
    '<rootDir>src/setupTests.js'
  ]
};

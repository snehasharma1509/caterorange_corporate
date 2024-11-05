module.exports = {
    transformIgnorePatterns: [
      'node_modules/(?!axios)'
    ],
    transform: {
      '^.+\\.jsx?$': 'babel-jest'
    },
  };
  
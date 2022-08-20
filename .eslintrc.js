module.exports = {
  extends: ['eslint-config-nk'],
  globals: {
    wp: true,
  },
  settings: {
    react: {
      pragma: 'wp',
    },
  },
  rules: {
    'react/prefer-stateless-function': 'off',
    'react/prop-types': 'off',
  },
};

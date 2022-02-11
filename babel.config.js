module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'wp.element.createElement',
      },
    ],
    ['@babel/plugin-proposal-object-rest-spread'],
  ],
};

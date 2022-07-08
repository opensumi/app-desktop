module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        debug: false,
        targets: {
          chrome: '101',
          node: 16,
          electron: 13,
        },
      },
    ],

    '@babel/preset-react',
    ['@babel/preset-typescript', { onlyRemoveTypeImports: true }],
  ],
  plugins: [
    // "babel-plugin-transform-typescript-metadata",
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'babel-plugin-parameter-decorator',
    '@babel/plugin-proposal-class-properties',
    'lodash',
  ],
};

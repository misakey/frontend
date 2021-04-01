// This overrides file is used for the applicatioh only.
// It's renamed in the Dockerfiles to match the real file name config-overrides.js

const path = require('path');

module.exports = function override(config) {
  const newConfig = { ...config };

  newConfig.resolve.alias = {
    '@misakey/core': path.resolve(__dirname, './src/packages/core/src'),
    '@misakey/react-auth': path.resolve(__dirname, './src/packages/react-auth/src'),
    '@misakey/hooks': path.resolve(__dirname, './src/packages/hooks/src'),
    '@misakey/store': path.resolve(__dirname, './src/packages/store/src'),
    '@misakey/ui/static': path.resolve(__dirname, './src/packages/ui/static'),
    '@misakey/ui': path.resolve(__dirname, './src/packages/ui/src'),
    '@misakey/crypto': path.resolve(__dirname, './src/packages/crypto/src'),
  };

  newConfig.module.rules.push({
    test: /\.worker\.js$/,
    use: {
      loader: 'worker-loader',
      options: {
        filename: 'static/js/[name].[contenthash:8].js',
      },
    },
  });

  return newConfig;
};

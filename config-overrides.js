// This overrides file is used for the applicatioh only.
// It's renamed in the Dockerfiles to match the real file name config-overrides.js

const path = require('path');

module.exports = function override(config) {
  const newConfig = { ...config };

  newConfig.resolve.alias = {
    '@misakey/api': path.resolve(__dirname, './src/packages/api/src'),
    '@misakey/auth': path.resolve(__dirname, './src/packages/auth/src'),
    '@misakey/react-auth': path.resolve(__dirname, './src/packages/react-auth/src'),
    '@misakey/helpers': path.resolve(__dirname, './src/packages/helpers/src'),
    '@misakey/hooks': path.resolve(__dirname, './src/packages/hooks/src'),
    '@misakey/store': path.resolve(__dirname, './src/packages/store/src'),
    '@misakey/ui/static': path.resolve(__dirname, './src/packages/ui/static'),
    '@misakey/ui': path.resolve(__dirname, './src/packages/ui/src'),
    '@misakey/crypto': path.resolve(__dirname, './src/packages/crypto/src'),
  };

  return newConfig;
};

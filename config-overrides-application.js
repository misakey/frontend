const path = require('path');

module.exports = function override(config) {
  const newConfig = { ...config };

  newConfig.resolve.alias = {
    '@misakey/api': path.resolve(__dirname, './src/packages/api/src'),
    '@misakey/auth': path.resolve(__dirname, './src/packages/auth/src'),
    '@misakey/helpers': path.resolve(__dirname, './src/packages/helpers/src'),
    '@misakey/hooks': path.resolve(__dirname, './src/packages/hooks/src'),
    '@misakey/store': path.resolve(__dirname, './src/packages/store/src'),
    '@misakey/ui/static': path.resolve(__dirname, './src/packages/ui/static'),
    '@misakey/ui': path.resolve(__dirname, './src/packages/ui/src'),
    '@misakey/crypto': path.resolve(__dirname, './src/packages/crypto/src'),
  };

  return newConfig;
};

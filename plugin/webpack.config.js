const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  context: path.join(__dirname, ''),
  devtool: 'source-map',
  entry: {
    background: './src/background-script/index.js',
    content_script: './src/content-script/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  plugins: [
    new CopyPlugin([
      { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: 'polyfill/browser-polyfill.js' },
    ]),
  ],
};

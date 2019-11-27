const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  env: process.env.PLUGIN_ENV || 'development',
  targetBrowser: process.env.TARGET_BROWSER || 'firefox',
  rootfolder: process.env.ROOT_FOLDER || '../build_plugin',
};

const outputPath = path.resolve(
  __dirname,
  `${config.rootfolder}/${config.env}/${config.targetBrowser}`,
);

module.exports = {
  context: path.join(__dirname, ''),
  devtool: 'source-map',
  entry: {
    background: './src/background-script/index.js',
    content_script: './src/content-script/index.js',
    content_script_misakey: './src/content-script/misakey.js',
  },
  output: {
    path: outputPath,
    filename: '[name].bundle.js',
  },
  plugins: [
    new CopyPlugin([
      { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: 'polyfill/browser-polyfill.js' },
    ]),
  ],
};

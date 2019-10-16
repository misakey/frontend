/* eslint-disable import/no-extraneous-dependencies, no-console */
// from https://gist.github.com/jasonblanchard/ae0d2e304a647cd847c0b4493c2353d4 and https://www.npmjs.com/package/cra-build-watch

process.env.NODE_ENV = 'development'; // eslint-disable-line no-process-env

const fs = require('fs-extra');
const paths = require('react-scripts/config/paths');
const webpack = require('webpack');
const config = require('react-scripts/config/webpack.config.js')('development');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const getClientEnvironment = require('react-scripts/config/env');
/**
 * We also need to update the path where the different files get generated.
 */
const buildPath = paths.appBuild; // resolve the build path

const disableChunks = true;

// we need to set the public_url ourselves because in dev mode
// it is supposed to always be an empty string as they are using
// the in-memory development server to serve the content
const env = getClientEnvironment(process.env.PUBLIC_URL || ''); // eslint-disable-line no-process-env

function copyPublicFolder() {
  return fs.copy(paths.appPublic, buildPath, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}
/**
 * We need to update the webpack dev config in order to remove the use of webpack devserver
 */
config.entry = config.entry.filter(fileName => !fileName.match(/webpackHotDevClient/));
config.plugins = config.plugins.filter(
  plugin => !(plugin instanceof webpack.HotModuleReplacementPlugin),
);


// update the paths in config
config.output.path = buildPath;
config.output.publicPath = `${process.env.PUBLIC_URL || ''}/`;
config.output.filename = 'js/bundle.js';
config.output.chunkFilename = 'js/[name].chunk.js';

if (disableChunks) {
  // disable code-splitting/chunks
  config.optimization.runtimeChunk = false;

  config.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };
}

// update media path destination
const oneOfIndex = 2;
config.module.rules[oneOfIndex].oneOf[0].options.name = 'media/[name].[hash:8].[ext]';
config.module.rules[oneOfIndex].oneOf[7].options.name = 'media/[name].[hash:8].[ext]';


const htmlPluginIndex = 0;
const interpolateHtmlPluginIndex = 1;

// we need to override the InterpolateHtmlPlugin because in dev mod
// they don't provide it the PUBLIC_URL env
config.plugins[interpolateHtmlPluginIndex] = new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw);
config.plugins[htmlPluginIndex] = new HtmlWebpackPlugin({
  inject: true,
  template: paths.appHtml,
  filename: 'index.html',
});

console.log('Clear destination folder');

let inProgress = false;

fs.emptyDir(paths.appBuild)
  .then(() => new Promise((resolve, reject) => {
    const webpackCompiler = webpack(config);
    webpackCompiler.apply(
      new webpack.ProgressPlugin(() => {
        if (!inProgress) {
          console.log('Start webpack watch...');
          inProgress = true;
        }
      }),
    );

    webpackCompiler.watch({
      poll: true,
      ignored: /node_modules/,
    }, (err, stats) => {
      if (err) {
        return reject(err);
      }

      inProgress = false;

      console.log();
      console.log(
        stats.toString({
          chunks: false,
          colors: true,
        }),
      );
      console.log();

      return resolve();
    });
  }))
  .then(() => copyPublicFolder());

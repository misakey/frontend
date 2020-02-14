/* eslint-disable import/no-extraneous-dependencies */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const WriteFileWebpackPlugin = require('react-app-rewire-build-dev/dist/write-file');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

/* eslint-disable no-param-reassign */

const CONFIG = {
  __configAppUrlTpl__: {
    production: 'https://www.misakey.com/',
    preproduction: 'https://www.preprod.misakey.dev/',
    development: 'https://misakey.com.local/',
  },
};

function modify(buffer, targetBrowser, environment) {
  // copy-webpack-plugin passes a buffer
  // build for browser target
  const manifest = JSON.parse(buffer.toString());
  const targetManifest = (manifest[`${targetBrowser}_specific`])
    ? { ...manifest.common, ...manifest[`${targetBrowser}_specific`] }
    : { ...manifest.common };

  process.env.VERSION = targetManifest.version;

  // replace template values depending on environment
  const newManifestString = JSON.stringify(targetManifest);
  // eslint-disable-next-line no-underscore-dangle
  return newManifestString.replace(/__configAppUrlTpl__/g, CONFIG.__configAppUrlTpl__[environment]);
}

module.exports = {
  webpack: function override(config) {
    const environment = process.env.PLUGIN_ENV || config.mode;
    const targetBrowser = process.env.TARGET_BROWSER || 'firefox';

    config.resolve.alias = {
      '@misakey/api': path.resolve(__dirname, './src/packages/api/src'),
      '@misakey/auth': path.resolve(__dirname, './src/packages/auth/src'),
      '@misakey/helpers': path.resolve(__dirname, './src/packages/helpers/src'),
      '@misakey/hooks': path.resolve(__dirname, './src/packages/hooks/src'),
      '@misakey/store': path.resolve(__dirname, './src/packages/store/src'),
      '@misakey/ui/static': path.resolve(__dirname, './src/packages/ui/static'),
      '@misakey/ui': path.resolve(__dirname, './src/packages/ui/src'),
      '@misakey/crypto': path.resolve(__dirname, './src/packages/crypto/src'),
    };

    let plugins = (config.plugins || []);

    plugins.push(new CopyWebpackPlugin([
      { from: `plugin/config/env.${environment}.js`, to: 'env.js' },
      { from: 'plugin/src/manifest/_locales', to: '_locales' },
      {
        from: 'plugin/src/manifest/manifest.json',
        to: 'manifest.json',
        transform(content) {
          return modify(content, targetBrowser, environment);
        },
      },
    ]));

    // Replace specific scripts for webapp by specific script for plugin
    plugins.push(new HtmlReplaceWebpackPlugin([
      {
        pattern: /bundleVersion.js/g,
        replacement: 'polyfill/browser-polyfill.js',
      },
    ]));

    // Launched with react-app-rewired start
    if (config.mode === 'development') {
      const outputDirDev = path.join(process.cwd(), `build_plugin/${environment}/${targetBrowser}`);
      plugins.push(new WriteFileWebpackPlugin({ outputPath: outputDirDev }));
      config.output.futureEmitAssets = false;
      config.entry = config.entry.filter((fileName) => !fileName.match(/webpackHotDevClient/));
      plugins = plugins.filter(
        (plugin) => !(plugin instanceof webpack.HotModuleReplacementPlugin),
      );
    } else {
      // ensure plugin build is done with the same config as popup build
      process.env.PLUGIN_ENV = environment;
      process.env.TARGET_BROWSER = targetBrowser;
      plugins.push(new WebpackShellPlugin({
        onBuildEnd: ['yarn --cwd plugin build'],
      }));
    }

    config.plugins = plugins;
    return config;
  },
  paths(paths) {
    const targetBrowser = process.env.TARGET_BROWSER;
    const environment = process.env.PLUGIN_ENV || 'production';
    paths.appBuild = `${paths.appBuild}_plugin/${environment}/${targetBrowser}`;
    return paths;
  },
};

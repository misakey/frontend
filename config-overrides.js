/* eslint-disable import/no-extraneous-dependencies */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

/* eslint-disable no-param-reassign */

const CONFIG = {
  __configAppUrlTpl__: {
    prod: 'https://www.misakey.com/',
    preprod: 'https://www.preprod.misakey.dev/',
    dev: 'https://misakey.com.local/',
  },
};

function modify(buffer, targetBrowser, environment) {
  // copy-webpack-plugin passes a buffer
  // build for browser target
  const manifest = JSON.parse(buffer.toString());
  const targetManifest = (manifest[`${targetBrowser}_specific`])
    ? { ...manifest.common, ...manifest[`${targetBrowser}_specific`] }
    : { ...manifest.common };

  // replace template values depending on environment
  const newManifestString = JSON.stringify(targetManifest);
  // eslint-disable-next-line no-underscore-dangle
  return newManifestString.replace('__configAppUrlTpl__', CONFIG.__configAppUrlTpl__[environment]);
}

module.exports = {
  webpack: function override(config) {
    const environment = process.env.PLUGIN_ENV || 'prod';
    const targetBrowser = process.env.TARGET_BROWSER || 'chrome';

    const plugins = (config.plugins || []);

    plugins.push(new WebpackShellPlugin({ onBuildStart: ['yarn --cwd plugin build'] }));

    plugins.push(new CopyWebpackPlugin([
      { from: 'public', ignore: ['index.html', 'env.js', 'manifest.json'] },
      { from: `plugin/popup/env.${environment}.js`, to: 'env.js' },
      { from: 'plugin/build/' },
      {
        from: 'plugin/src/manifest.json',
        to: 'manifest.json',
        transform(content) {
          return modify(content, targetBrowser, environment);
        },
      },
    ]));

    config.plugins = plugins;
    return config;
  },
  paths(paths) {
    const targetBrowser = process.env.TARGET_BROWSER;
    paths.appBuild = `${paths.appBuild}_plugin/${targetBrowser}`;
    paths.appHtml = paths.appHtml.replace('public', 'plugin/popup');
    return paths;
  },
};

/* eslint-disable import/no-extraneous-dependencies */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

/* eslint-disable no-param-reassign */

function modify(buffer, targetBrowser) {
  // copy-webpack-plugin passes a buffer
  const manifest = JSON.parse(buffer.toString());

  const targetManifest = (manifest[`${targetBrowser}_specific`])
    ? { ...manifest.common, ...manifest[`${targetBrowser}_specific`] }
    : { ...manifest.common };

  return JSON.stringify(targetManifest);
}

module.exports = {
  webpack: function override(config) {
    const environment = process.env.PLUGIN_ENV || 'prod';
    const targetBrowser = process.env.TARGET_BROWSER || 'chrome';

    const plugins = (config.plugins || []);

    plugins.push(new WebpackShellPlugin({
      onBuildStart: ['yarn --cwd plugin build'],
      onBuildEnd: process.env.NO_ZIP
        ? []
        : [`zip -r -FS build_plugin/misakey_extension_${targetBrowser}.xpi build_plugin/${targetBrowser}`],
    }));

    plugins.push(new CopyWebpackPlugin([
      { from: 'public', ignore: ['index.html', 'env.js', 'manifest.json'] },
      { from: `plugin/popup/env.${environment}.js`, to: 'env.js' },
      { from: 'plugin/build/' },
      {
        from: 'plugin/src/manifest.json',
        to: 'manifest.json',
        transform(content) {
          return modify(content, targetBrowser);
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

const path = require('path');

module.exports = {
  title: 'Frontend components',
  serverHost: 'docs.misakey.dev.local',
  sections: [{
    name: 'Documentation',
    sections: [{
      name: 'Auth bundle',
      content: 'src/packages/auth/README.md',
      components: 'src/packages/auth/src/components/**/+([A-Z]*)/*.js',
      exampleMode: 'expand', // 'hide' | 'collapse' | 'expand'
      usageMode: 'expand', // 'hide' | 'collapse' | 'expand'
    }, {
      name: 'UI Components & Theme',
      content: 'src/packages/ui/README.md',
      components: 'src/packages/ui/src/**/+([A-Z]*)/*.js',
      exampleMode: 'expand', // 'hide' | 'collapse' | 'expand'
      usageMode: 'expand', // 'hide' | 'collapse' | 'expand'
    }],
  }],
  require: [
    path.join(__dirname, '/public/env.js'),
  ],
  styles: './styleguide_config/style.js',
  theme: './styleguide_config/theme.js',
  template: {
    favicon: 'https://www.misakey.com/favicon.ico',
  },
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'styleguide_config/components/Wrapper'),
  },
  webpackConfig: {
    context: path.resolve(__dirname),
    resolve: {
      modules: [path.join(__dirname, '../'), 'node_modules'],
      alias: {
        '@misakey/api': path.resolve(__dirname, './src/packages/api/src'),
        '@misakey/auth': path.resolve(__dirname, './src/packages/auth/src'),
        '@misakey/react-auth': path.resolve(__dirname, './src/packages/react-auth/src'),
        '@misakey/helpers': path.resolve(__dirname, './src/packages/helpers/src'),
        '@misakey/hooks': path.resolve(__dirname, './src/packages/hooks/src'),
        '@misakey/store': path.resolve(__dirname, './src/packages/store/src'),
        '@misakey/ui/static': path.resolve(__dirname, './src/packages/ui/static'),
        '@misakey/ui': path.resolve(__dirname, './src/packages/ui/src'),
        '@misakey/crypto': path.resolve(__dirname, './src/packages/crypto/src'),
      },
    },
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'bundle.js',
      publicPath: '/build/',
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
        },
      }, {
        test: /\.md$/,
        loader: 'raw-loader',
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      }],
    },
  },
};

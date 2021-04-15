const path = require('path');

module.exports = {
  title: 'Frontend components',
  serverHost: 'docs.misakey.dev.local',
  serverPort: 6060,
  sections: [{
    name: 'Documentation',
    sections: [{
      name: 'React Auth SDK',
      content: 'src/packages/react/src/auth/README.md',
      components: 'src/packages/react-auth/src/components/**/+([A-Z]*)/*.js',
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
        '@misakey/core': path.resolve(__dirname, './src/packages/core/src'),
        '@misakey/react': path.resolve(__dirname, './src/packages/react/src'),
        '@misakey/hooks': path.resolve(__dirname, './src/packages/hooks/src'),
        '@misakey/store': path.resolve(__dirname, './src/packages/store/src'),
        '@misakey/ui/static': path.resolve(__dirname, './src/packages/ui/static'),
        '@misakey/ui': path.resolve(__dirname, './src/packages/ui/src'),
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

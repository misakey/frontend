let defaultPresets;

if (process.env.BABEL_ENV === 'es') {
  defaultPresets = [];
} else {
  defaultPresets = [
    [
      '@babel/preset-env',
      {
        modules: ['esm', 'production-umd'].includes(process.env.BABEL_ENV) ? false : 'commonjs',
      },
    ],
  ];
}

const localAlias = {
  '@misakey/core': './src/packages/core/src',
  '@misakey/store': './src/packages/store/src',
  '@misakey/react': './src/packages/react/src',
  '@misakey/hooks': './src/packages/hooks/src',
  '@misakey/ui/static': './src/packages/ui/static',
  '@misakey/ui': './src/packages/ui/src',
};

const productionPlugins = [
  'babel-plugin-transform-react-constant-elements',
  'babel-plugin-transform-dev-warning',
  ['babel-plugin-react-remove-properties', { properties: ['data-rsr-test'] }],
  [
    'babel-plugin-transform-react-remove-prop-types',
    {
      mode: 'unsafe-wrap',
    },
  ],
];

if (process.env.BUILD_ENV === 'local-package-link') {
  productionPlugins.push([
    'babel-plugin-module-resolver',
    {
      root: ['./'],
      alias: {
        '@misakey/core': '../core/build',
        '@misakey/store': '../store/build',
        '@misakey/react': '../react/build',
        '@misakey/hooks': '../hooks/build',
        '@misakey/ui/static': '../ui/static',
        '@misakey/ui': '../ui/build',
      },
    },
  ]);
}

module.exports = {
  presets: defaultPresets.concat([['@babel/preset-react', {
    runtime: 'automatic',
  }]]),
  plugins: [
    'babel-plugin-optimize-clsx',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    '@babel/plugin-transform-runtime',
    // for IE 11 support
    '@babel/plugin-transform-object-assign',
    ['inline-json-import', {}],
  ],
  ignore: [/@babel[\\|/]runtime/], // Fix a Windows issue.
  env: {
    cjs: {
      plugins: productionPlugins,
    },
    coverage: {
      plugins: [
        'babel-plugin-istanbul',
        [
          'babel-plugin-module-resolver',
          {
            root: ['./'],
            alias: localAlias,
          },
        ],
      ],
    },
    development: {
      plugins: [
        [
          'babel-plugin-module-resolver',
          {
            alias: {
              modules: './modules',
            },
          },
        ],
      ],
    },
    esm: {
      plugins: [...productionPlugins, ['@babel/plugin-transform-runtime', { useESModules: true }]],
    },
    es: {
      plugins: [...productionPlugins, ['@babel/plugin-transform-runtime', { useESModules: true }]],
    },
    production: {
      plugins: [...productionPlugins, ['@babel/plugin-transform-runtime', { useESModules: true }]],
    },
    'production-umd': {
      plugins: [...productionPlugins, ['@babel/plugin-transform-runtime', { useESModules: true }]],
    },
    test: {
      sourceMaps: 'both',
      plugins: [
        [
          'babel-plugin-module-resolver',
          {
            root: ['./'],
            alias: localAlias,
          },
        ],
      ],
    },
    benchmark: {
      plugins: [
        ...productionPlugins,
        [
          'babel-plugin-module-resolver',
          {
            root: ['./'],
            alias: localAlias,
          },
        ],
      ],
    },
  },
};

// @ts-check;
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

/**
 * @param {import ('webpack').Configuration} options
 * @param {import ('webpack')} webpack
 * @returns {import ('webpack').Configuration}
 */

module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];
  return {
    ...options,
    externals: [],
    target: 'node18',
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
      new CopyPlugin({
        patterns: [
          { from: './node_modules/.prisma/client/schema.prisma', to: './' },
          {
            from: './node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node',
            to: './',
          },
        ],
      }),
    ],
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
      filename: 'main.js',
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
          },
        }),
      ],
    },
  };
};

const { composePlugins, withNx, withReact } = require('@nx/rspack');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');
const mfConfig = require('./modulefederation.config');
const path = require('path');
const rspack = require('@rspack/core');

const envVariables = {};

for (let key in process.env) {
  envVariables[`process.env.${key}`] = JSON.stringify(process.env[key]);
}

module.exports = composePlugins(withNx(), withReact(), (baseConfig) => {
  const config = {
    ...baseConfig,
    output: {
      publicPath: 'auto',
    },
    devServer: {
      ...baseConfig.devServer,
      historyApiFallback: true,
      port: 4201,
      hot: false,
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
      extensions: ['.js', '.ts', '.tsx'],
    },
    module: {
      rules: [
        ...baseConfig.module.rules,
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.css$/,
          type: 'css',
          exclude: '/node_modules/',
        },
      ],
    },
    plugins: [
      ...baseConfig.plugins,
      new ModuleFederationPlugin({ ...mfConfig }),
      new rspack.ProvidePlugin({
        process: [require.resolve('process/browser')],
      }),
      new rspack.DefinePlugin(envVariables)
    ],
  };
  return config;
});
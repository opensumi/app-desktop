/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import { Configuration, DefinePlugin } from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

import { buildEnv, isDev, getVersions } from './help';
import { dependencies as externals } from './package.json';

export const tsConfigPath = path.join(__dirname, '../tsconfig.json');

const configuration: Configuration = {
  mode: buildEnv(),
  devtool: isDev() ? 'source-map' : false,

  output: {
    // path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  externals: [
    ({ context, request }, callback) => {
      // TODO: win-dpapi 需要针对 Windows 环境做额外处理，暂时不可用
      if ([...Object.keys(externals || {}), 'vm2', 'win-dpapi'].indexOf(request || '') !== -1) {
        return callback(undefined, `commonjs ${request}`);
      }
      callback();
    },
  ],

  // stats: 'errors-only',

  module: {
    exprContextCritical: false,
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    usedExports: true,
    minimize: !isDev(),
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin({
        parallel: true,
      }),
    ],
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.css', 'less'],
    // modules: [webpackPaths.srcPath, 'node_modules'],
    modules: [path.join(__dirname, '../node_modules')],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ],
  },

  plugins: [
    // new webpack.EnvironmentPlugin({
    //   NODE_ENV: 'production',
    // }),
    new DefinePlugin({
      WP_BUILD_ENV: JSON.stringify(buildEnv()),
      WP_VERSIONS_INFO: JSON.stringify(JSON.stringify(getVersions())),
      WP_RESOURCE_TYPE: JSON.stringify('append'),
    }),
  ],
};

export default configuration;

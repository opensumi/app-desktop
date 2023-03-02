import path from 'path';
import { isProd, buildEnv, isDev, getVersions } from '../../../build/help';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';

const tsConfigPath = path.join(__dirname, '../../../tsconfig.json');
const srcDir = path.join(__dirname, '../node');
const distDir = path.join(__dirname, '../../../app/editor/node');

export const config: Configuration = {
  entry: path.join(srcDir, './index.ts'),
  target: 'node',
  output: {
    filename: 'index.js',
    path: distDir,
  },
  node: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['main'],
    plugins: [new TsconfigPathsPlugin({
      configFile: tsConfigPath,
    })],
  },
  mode: buildEnv(),
  devtool: isDev() ? 'source-map' : false,
  optimization: {
    minimize: isProd(),
  },
  module: {
    // https://github.com/webpack/webpack/issues/196#issuecomment-397606728
    exprContextCritical: false,
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      options: {
        configFile: tsConfigPath,
      },
    }],
  },
  externals: [
    {
      nsfw: 'nsfw',
    },
    ({ context, request }, callback) => {
      if (['node-pty', '@parcel/watcher', 'spdlog', '@opensumi/vscode-ripgrep', 'vm2', 'keytar'].indexOf(request || '') !== -1) {
        return callback(undefined, `commonjs ${request}`);
      }
      callback();
    },
  ],
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
  },
  plugins: [
    new DefinePlugin({
      WP_IS_DEVELOP: !isProd(),
      WP_BUILD_ENV: JSON.stringify(buildEnv()),
      WP_VERSIONS_INFO: JSON.stringify(JSON.stringify(getVersions())),
    }),
  ],
};

export default config;

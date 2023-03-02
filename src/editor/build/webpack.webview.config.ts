import path from 'path';
import { Configuration } from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { isProd, buildEnv, isDev } from '../../../build/help';

const tsConfigPath = path.join(__dirname, '../../../tsconfig.json');
const distDir = path.join(__dirname, '../../../app/editor/webview');

const config: Configuration = {
  entry: require.resolve('@opensumi/ide-webview/lib/electron-webview/host-preload.js'),
  target: 'node',
  output: {
    filename: 'host-preload.js',
    path: distDir,
  },
  node: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
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
    },
    ],
  },
  externals: [
    {
      nsfw: 'nsfw',
    },
    ({ context, request }, callback) => {
      if (['node-pty', '@parcel/watcher', 'spdlog', 'electron'].indexOf(request || '') !== -1) {
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
    new CopyPlugin({
      patterns: [
        { from: require.resolve('@opensumi/ide-webview/lib/electron-webview/plain-preload.js'), to: path.join(distDir, 'plain-preload.js') },
      ],
    }),
  ],
};

export default config;

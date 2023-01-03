import path from 'path';
import { Configuration, ProvidePlugin } from 'webpack';
import { isProd, buildEnv, isDev } from '../../../build/help';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const tsConfigPath = path.join(__dirname, '../../../tsconfig.json');
const distDir = path.join(__dirname, '../../../app/editor/extension');

const nodeTarget: Configuration = {
  entry: path.join(__dirname, '../extension/index'), // require.resolve('@opensumi/ide-extension/lib/hosted/ext.process.js'),
  target: 'node',
  output: {
    filename: 'index.js',
    path: distDir,
  },
  node: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['main'], // 修复 yargs 16.x 的 mjs 引用路径异常 https://github.com/yargs/yargs/issues/1754
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
    ({ context, request }, callback) => {
      if (['node-pty', '@parcel/watcher', 'spdlog', 'keytar'].indexOf(request || '') !== -1) {
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
};

const workerTarget: Configuration = {
  entry: path.join(__dirname, '../extension/index.worker'), // require.resolve('@opensumi/ide-extension/lib/hosted/ext.process.js'),
  target: 'webworker',
  output: {
    filename: 'index.worker.js',
    path: distDir,
  },
  node: {
    global: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['main'],
    plugins: [new TsconfigPathsPlugin({
      configFile: tsConfigPath,
    })],
    fallback: {
      os: false,
      net: false,
      path: false,
      util: false,
      crypto: false,
      buffer: require.resolve('buffer/'),
    },
  },
  mode: buildEnv(),
  devtool: isDev() ? 'source-map' : false,
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
    ({ context, request }, callback) => {
      if (['node-pty', '@parcel/watcher', 'spdlog', 'keytar'].indexOf(request || '') !== -1) {
        return callback(undefined, `commonjs ${request}`);
      }
      callback();
    },
  ],
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
  },
};

module.exports = [nodeTarget, workerTarget];
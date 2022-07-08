import path from 'path';
import { merge } from 'webpack-merge';
import { Configuration } from 'webpack';
import baseConfig, { tsConfigPath } from './webpack.base.config';

const srcDir = path.join(__dirname, '../src/bootstrap');
const distDir = path.join(__dirname, '../app/bootstrap');

const configuration: Configuration = {
  entry: {
    main: path.join(srcDir, './index.ts'),
  },
  target: 'electron-main',
  output: {
    filename: '[name].js',
    path: distDir,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: tsConfigPath,
          transpileOnly: true,
        },
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
};

export default merge(baseConfig, configuration);

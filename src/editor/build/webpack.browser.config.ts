import path from 'path';
import { DefinePlugin } from 'webpack';
import { buildEnv, getVersions, isDev } from '../../../build/help';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const tsConfigPath = path.join(__dirname, '../../../tsconfig.json');
const srcDir = path.join(__dirname, '../browser');
const distDir = path.join(__dirname, '../../../app/editor/browser');
const reactPath = path.join(__dirname, '../../../node_modules/react');

const baseCssLoaders = [{
  loader: isDev() ? 'style-loader' : MiniCssExtractPlugin.loader,
}];

const baseWebpackTarget = () => ({
  target: 'electron-renderer',
  externalsPresets: {
    node: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ],
    alias: {
      react: reactPath,
    },
  },
  mode: buildEnv(),
  devtool: isDev() ? 'source-map' : false,
  optimization: {
    minimize: !isDev(),
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    // https://github.com/webpack/webpack/issues/196#issuecomment-397606728
    exprContextCritical: false,
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: tsConfigPath,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.module.less$/,
        use: [{
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            sourceMap: isDev(),
            modules: true,
            localIdentName: '[local]___[hash:base64:5]',
          },
        },
        {
          loader: 'less-loader',
          options: {
            javascriptEnabled: true,
          },
        },
        ],
      },
      {
        test: /^((?!\.module).)*less$/,
        use: [
          ...baseCssLoaders,
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[contenthash].[ext]',
            outputPath: '../static/fonts/',
            publicPath: '../../static/fonts/',
          },
        }],
      },
    ],
  },
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
  },
  externals: {},
});

const editorTarget = (env: any, argv: any) => {
  if (argv.mode) {
    process.env.BUILD_ENV = argv.mode;
  }
  return {
    ...baseWebpackTarget(),
    entry: path.join(srcDir, './index.ts'),
    output: {
      filename: 'bundle.js',
      path: distDir,
    },
    plugins: [
      new DefinePlugin({
        WP_BUILD_ENV: JSON.stringify(buildEnv()),
        WP_VERSIONS_INFO: JSON.stringify(JSON.stringify(getVersions())),
      }),
      new HtmlWebpackPlugin({
        template: path.join(srcDir, '/index.html'),
      }),
      new MiniCssExtractPlugin({
        filename: '[name]/[contenthash].css',
        chunkFilename: '[id].css',
        ignoreOrder: true,
      }),
      new CopyPlugin(
        {
          patterns: [
            {
              from: require.resolve('@opensumi/ide-core-electron-main/browser-preload/index.js'),
              to: path.join(distDir, 'preload.js'),
            },
          ],
        },
      ),
    ],
  };
};

module.exports = editorTarget;

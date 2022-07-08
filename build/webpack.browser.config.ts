import path from 'path';
import fs from 'fs';
import { DefinePlugin, Configuration, IgnorePlugin } from 'webpack';
import baseConfig from './webpack.base.config';
import { buildEnv, getVersions, isDev } from './help';
import { readdirSync } from '../src/base/common/utils/fs';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const tsConfigPath = path.join(__dirname, '../tsconfig.json');
const srcDir = path.join(__dirname, '../src/pages');
const distDir = path.join(__dirname, '../app/pages');

const baseCssLoaders = [
  {
    loader: isDev() ? 'style-loader' : MiniCssExtractPlugin.loader,
  },
];

const entries = readdirSync(srcDir)
  .filter((dir) => !dir.includes('.'))
  // .filter((dir) => dir.includes('dashboard'))
  .reduce((p, dir) => ({ ...p, [dir]: path.join(srcDir, dir, 'index.tsx') }), {});

console.log('===== 将要编译的窗口 =====');
console.log(entries);

const multiHtml = Object.keys(entries).map(
  (chunk) => {
    let template = path.join(srcDir, '../base/browser/index.html');
    if (fs.existsSync(path.join(srcDir, chunk, 'index.html'))) {
      template = path.join(srcDir, chunk, 'index.html');
    }
    return new HtmlWebpackPlugin({
      chunks: [chunk],
      title: chunk,
      filename: `${chunk}/index.html`,
      template,
      templateParameters: {},
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isDevelopment: isDev(),
    });
  },
);

const configuration: Configuration = {
  entry: entries,
  target: 'electron-renderer',
  node: {
    __dirname: false,
    __filename: false,
  },
  output: {
    filename: '[name]/index.js',
    path: distDir,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ],
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
  module: {
    // https://github.com/webpack/webpack/issues/196#issuecomment-397606728
    exprContextCritical: false,
    rules: [
      {
        test: /\.(tsx?|js)$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [['@babel/preset-typescript', { onlyRemoveTypeImports: false }]],
        }, // 缓存公共文件，提高编译效率
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [...baseCssLoaders, 'css-loader'],
      },
      {
        test: /\.module.less$/,
        use: [
          ...baseCssLoaders,
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
              lessOptions: {
                javascriptEnabled: true,
              },
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
              lessOptions: {
                modifyVars: {
                  'primary-color': '#ff5000',
                  'link-color': '#ff5000',
                  'text-color': 'var(--foreground)',
                  'text-color-secondary': 'rgba(255, 255, 255, 0.45)',
                  'border-radius-base': '2px',
                  // 所有组件背景色改为透明，通过 electron 自己的背景色进行定义
                  'component-background': 'transparent',
                },
                javascriptEnabled: true,
                math: 'always',
              },
            },
          },
        ],
      },
      {
        test: /^((?!\.module).)*scss$/,
        use: [
          ...baseCssLoaders,
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
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
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[contenthash].[ext]',
              outputPath: '../static/fonts/',
              publicPath: '../../static/fonts/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      WP_BUILD_ENV: JSON.stringify(buildEnv()),
      WP_VERSIONS_INFO: JSON.stringify(JSON.stringify(getVersions())),
    }),
    ...multiHtml,
    new MiniCssExtractPlugin({
      filename: '[name]/[contenthash].css',
      chunkFilename: '[id].css',
      ignoreOrder: true,
    }),
    // Ignore all locale files of moment.js
    // new ContextReplacementPlugin(/moment[/\\]locale$/, /en-ca/),
    // https://webpack.js.org/plugins/ignore-plugin/
    new IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
};

// module 的 rules 在 mergeWithRules 方法中没有生效
const result = {
  ...baseConfig,
  ...configuration,
};

export default result;

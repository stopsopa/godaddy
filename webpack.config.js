'use strict';

const path                    = require('path');

const utils                   = require('./webpack/utils');

const webpack                 = require('webpack');

const MiniCssExtractPlugin    = require('mini-css-extract-plugin');

const { CleanWebpackPlugin }  = require('clean-webpack-plugin');

const log                     = require('inspc');

const config                  = require('./config.js')(process.env.NODE_ENV);

require('colors');

utils.setup(config);

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  // I'm using mode 'prod..' setting DefinePlugin manually to get rid of evals from transpiled output
  // to keep even dev output files readable
  // more info: https://webpack.js.org/guides/production/#specify-the-mode
  //            https://webpack.js.org/configuration/mode/#mode-production
  mode: 'production',
  entry: utils.entries(),
  output: { // https://webpack.js.org/configuration/output/#outputpath
    path: config.output,
    filename: "[name].bundle.js",
  },
  node: {
    // https://github.com/webpack/webpack/issues/1599
    __dirname: true,
    __filename: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: config.node_modules,
        use: [
          { // https://webpack.js.org/guides/build-performance/#persistent-cache
            loader: 'cache-loader',
            options: {
              cacheDirectory: path.resolve(config.vardir, 'cache-loader'),
            }
          },
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
              ],
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // // Creates `style` nodes from JS strings
          // 'style-loader', I will relay on MiniCssExtractPlugin
          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          'css-loader', // https://webpack.js.org/loaders/css-loader/
          // Compiles Sass to CSS
          'sass-loader', // https://webpack.js.org/loaders/sass-loader/#root
        ],
      },
    ]
  },
  optimization: {
    minimize: isProd,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    // https://webpack.js.org/guides/production/
    // https://webpack.js.org/guides/output-management/#cleaning-up-the-dist-folder
    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: `[name].bundle.css`,
    }), // https://webpack.js.org/plugins/mini-css-extract-plugin/#root
    new webpack.DefinePlugin({ // https://webpack.js.org/plugins/define-plugin/
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
  ],
  performance: {
    hints: false,
  },
  stats: {
    errorDetails: true,
    colors: {
      green: '\u001b[32m',
    },
  },
};

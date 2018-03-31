const path = require('path')
const webpack = require('webpack')

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const paths = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
  data: path.join(__dirname, 'data')
}

module.exports = {
  context: paths.src,
  entry: ['./app.js', './main.css'],
  output: {
    filename: 'app.bundle.js',
    path: paths.dist,
    publicPath: '/',
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: { presets: ['es2015', 'stage-0'] },
        }],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: paths.dist + '/index.html',
      template: 'index.html',
      inject: true
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "main.bundle.css",
      allChunks: true
    }),
    new CopyWebpackPlugin([
      {
        from: paths.data,
        to: paths.dist + '/data'
      }
    ])
  ],
}

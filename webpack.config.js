const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: './index.html',
    })
  ],
  devServer: {
    proxy: {
      '/api': 'http://localhost:8082'
    }
  },
  mode: "development",
  stats: "errors-only",
};
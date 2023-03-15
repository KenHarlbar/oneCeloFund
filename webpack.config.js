const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "eval-cheap-module-source-map",
  entry: {
    main: [
      "webpack-dev-server/client?http://localhost:3000",
      "webpack/hot/dev-server",
      "./index.js"
    ]
  },
  output: {
    path: path.resolve(process.cwd(), "docs"),
    publicPath: ""
  },
  node: {
    __dirname: false,
    __filename: false,
    global: true
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 500
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), ".", "index.html")
    })
  ]
}


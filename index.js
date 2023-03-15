let path = require("path");
let webpack = require("webpack");
let webpackDevServer = require("webpack-dev-server");
let webpackConfig = require("./webpack.config");

let webpackCompiler = webpack(webpackConfig);

let webpackDevServerOptions = {
  publicPath: "/",
  contentBase: path.join(process.cwd(), "dist"),
  historyApiFallback: true,
  hot: true,
  host: "0.0.0.0",
  clientLogLevel: "none",
  quiet: false,
  noInfo: false,
  stats: "minimal",
  watchOptions: {
    ignored: /node_modules/
  }
};

let app = new webpackDevServer(webpackCompiler, webpackDevServerOptions);

app.listen(3000, "0.0.0.0", (err) => {
  if (err) {
    console.log(err);
  }
  console.log("App listening on port 3000");
});


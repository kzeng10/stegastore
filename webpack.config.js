var path = require('path');

module.exports = {
  context: __dirname + "/app",
  entry: "./app.js",

  output: {
    filename: "app.js",
    path: __dirname + "/dist",
  },
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react')
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"],
      }
    ],
  },
}

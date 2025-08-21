const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "dist"),
    filename: "index.js",
  },
  target: "node",
  module: {exprContextCritical: false,
    rules: [
      {
        test: /\.([cm]?ts|tsx)$/, 
        use: [
          {
            loader:"ts-loader",
            options:{
              transpileOnly: false,
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
  externals: ['esi-common-layer']
};
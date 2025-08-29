const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "dist-local"),
    filename: "index.js",
  },
  target: "node",
  module: {
    exprContextCritical: false,
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
  // Remove externals for local testing - bundle everything
  externals: {
    // Only exclude AWS SDK and Node.js built-ins
    'aws-sdk': 'aws-sdk',
    '@aws-sdk/client-dynamodb': '@aws-sdk/client-dynamodb',
    'fs': 'fs',
    'path': 'path',
    'os': 'os',
    'crypto': 'crypto',
    'util': 'util',
    'events': 'events',
    'buffer': 'buffer',
    'stream': 'stream',
    'url': 'url',
    'querystring': 'querystring'
  },
  // Add source maps for better debugging
  devtool: 'source-map',
  // Optimize for faster builds during development
  optimization: {
    minimize: false
  }
};

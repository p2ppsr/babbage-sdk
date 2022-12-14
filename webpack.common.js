const path = require('path')
// Webpack Analyzer
// const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')

module.exports = {
  output: {
    globalObject: 'this',
    library: {
      type: 'umd',
      name: 'BabbageSDK'
    },
    filename: 'sdk.js'
  },
  plugins: [
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // .js and .jsx files
        exclude: /node_modules/, // excluding the node_modules folder
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  externals: {
    'isomorphic-fetch': 'isomorphic-fetch'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'bn.js': path.resolve(__dirname, 'node_modules/bn.js'),
      'safe-buffer': path.resolve(__dirname, 'node_modules/safe-buffer')
    }
  }
}

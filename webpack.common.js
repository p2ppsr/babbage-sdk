const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

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
    new NodePolyfillPlugin()
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
    "isomorphic-fetch": "isomorphic-fetch"
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}

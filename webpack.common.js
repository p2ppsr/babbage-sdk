const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  output: {
    library: {
      type: 'umd',
      name: 'sdk'
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
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}

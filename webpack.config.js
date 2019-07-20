const path = require('path');

module.exports = {
  entry: './src/payload-react.js',
  output: {
    path: path.resolve('dist'),
    filename: 'payload-react.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  externals: {
    'react': 'commonjs react'
  }
}

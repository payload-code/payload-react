const path = require('path');

module.exports = {
  entry: './src/payload-react.js',
  output: {
    path: path.resolve('umd'),
    filename: 'payload-react.js',
    libraryTarget: 'umd',
    library: 'PayloadReact',
    libraryExport: "default" ,
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: { loader: 'babel-loader' },
        exclude: /node_modules/
      }
    ]
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  }
}

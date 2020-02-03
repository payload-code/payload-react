const path = require('path');

module.exports = {
  entry: './src/payload-react.js',
  mode: 'production',
  output: {
    path: path.resolve('dist'),
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
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    }
  }
}

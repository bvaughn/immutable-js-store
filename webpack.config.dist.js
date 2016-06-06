const path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: [
    './source/index.js'
  ],
  externals: {
    immutable: {
      commonjs: 'immutable',
      commonjs2: 'immutable',
      amd: 'immutable',
      root: 'Immutable'
    }
  },
  output: {
    path: 'dist',
    filename: 'immutable-js-store.js',
    libraryTarget: 'commonjs2',
    library: 'immutable-js-store'
  },
  plugins: [
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: path.join(__dirname, 'source')
      }
    ]
  }
}

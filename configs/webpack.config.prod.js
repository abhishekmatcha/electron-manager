const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const paths = require('./utils/paths.js');
const helper = require('./utils/helper.js');

const electronMainConfig = {
  target: 'electron-main',
  entry: helper.entry('main'),
  output: {
    filename: '[name].main.js',
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/index.js', to: 'index.js' }
    ])
  ]
}

const electronRendererConfig = {
  target: 'electron-renderer',
  entry: helper.entry('renderer'),
  output: {
    filename: '[name].renderer.js',
  }
}

const baseConfig = {
  mode: 'production',
  output: {
    path: paths.lib,
    libraryTarget: 'umd',
    library: 'electron-manager'
  },
  optimization: {
    minimize: true,
  },
  resolve: {
    modules: [paths.nodeModules],
    alias: {
      'constants': path.resolve(__dirname, '..', 'src', 'constants'),
      'utils': path.resolve(__dirname, '..', 'src', 'utils')
    },
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        include: paths.src,
        loader: require.resolve('babel-loader'),
        options: {
          compact: true
        }
      }
    ]
  }
}

module.exports = [{
  ...baseConfig,
  ...electronMainConfig,
  output: {
    ...baseConfig.output,
    ...electronMainConfig.output
  }
}, {
  ...baseConfig,
  ...electronRendererConfig,
  output: {
    ...baseConfig.output,
    ...electronRendererConfig.output
  }
}];

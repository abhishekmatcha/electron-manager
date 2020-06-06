/**
 * @file webpack.config.prod.js
 * @description Electron Manager webpack configuration
 * Created on: 22/05/2020
 * @author Sanoop Jose <sanoop.jose@hashedin.com>
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const paths = require('./paths.js');

const electronMainConfig = {
  target: 'electron-main',
  entry: './src/index.main.js',
  output: {
    filename: 'index.main.js',
  },
  externals: {
    'electron-updater': 'electron-updater',
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/index.js', to: 'index.js' }
    ]),
    // new BundleAnalyzerPlugin()
  ]
}

const electronRendererConfig = {
  target: 'electron-renderer',
  entry: './src/index.renderer.js',
  output: {
    filename: 'index.renderer.js',
  },
  plugins: [
    // new BundleAnalyzerPlugin()
  ]
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

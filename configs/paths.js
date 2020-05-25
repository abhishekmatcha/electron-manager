/**
 * @file paths.js
 * @description Resolve path for webpack configuration
 * Created on: 22/05/2020
 * @author Sanoop Jose <sanoop.jose@hashedin.com>
 */

'use strict';

const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  config: resolveApp('config'),
  lib: resolveApp('lib'),
  modules: resolveApp('src/modules'),
  nodeModules: resolveApp('node_modules'),
  root: appDirectory,
  src: resolveApp('src')
};
